import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Unauthorized');

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) throw new Error('Unauthorized');

    const { video_id } = await req.json();
    if (!video_id) throw new Error('video_id is required');

    // Check enrollment
    const { data: video } = await supabase
      .from('videos')
      .select('*, courses(*)')
      .eq('id', video_id)
      .single();
    if (!video) throw new Error('Video not found');

    // Rate limit: check last generation in the last 60 seconds
    const { data: recent } = await supabase
      .from('video_summaries')
      .select('id')
      .eq('video_id', video_id)
      .eq('generated_by', user.id)
      .gte('created_at', new Date(Date.now() - 60000).toISOString())
      .single();
    if (recent) throw new Error('Rate limit: wait 60 seconds before regenerating');

    // Mark as generating
    await supabase.from('videos').update({ summary_status: 'generating' }).eq('id', video_id);

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) throw new Error('Gemini API key not configured');

    const prompt = `Você é um assistente educacional especializado em criar resumos de aulas online.

Aula: "${video.title}"
${video.description ? `Descrição: ${video.description}` : ''}

Crie um resumo educacional estruturado desta aula com:
1. Um resumo conciso em 2-3 parágrafos explicando os principais conceitos
2. Uma lista de 5-8 tópicos principais abordados
3. Pontos de atenção importantes

Responda SOMENTE com um JSON válido no formato:
{
  "summary_text": "resumo conciso aqui",
  "bullets": ["tópico 1", "tópico 2", "tópico 3"],
  "key_points": ["ponto importante 1", "ponto importante 2"]
}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
        }),
      }
    );

    if (!geminiRes.ok) throw new Error(`Gemini API error: ${geminiRes.status}`);

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    let parsed: { summary_text: string; bullets: string[] };
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch?.[0] ?? rawText);
    } catch {
      parsed = { summary_text: rawText, bullets: [] };
    }

    const { data: summaryRecord, error: insertError } = await supabase
      .from('video_summaries')
      .insert({
        video_id,
        generated_by: user.id,
        summary_text: parsed.summary_text,
        bullets: parsed.bullets,
        model_name: 'gemini-pro',
      })
      .select()
      .single();

    if (insertError) throw insertError;

    await supabase.from('videos').update({ summary_status: 'ready' }).eq('id', video_id);

    return new Response(JSON.stringify(summaryRecord), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
