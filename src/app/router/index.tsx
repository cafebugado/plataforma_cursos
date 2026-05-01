import React, { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import ProtectedRoute from '../../features/auth/ProtectedRoute';
import AuthTransition from '../../features/auth/AuthTransition';
import HomePage from '../../pages/Home';

const Fallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <CircularProgress />
  </Box>
);

const wrap = (Component: React.ComponentType) => (
  <Suspense fallback={<Fallback />}>
    <Component />
  </Suspense>
);

const LoginPage = lazy(() => import('../../features/auth/LoginPage'));
const RegisterPage = lazy(() => import('../../features/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../../features/auth/ForgotPasswordPage'));

const AdminShell = lazy(() => import('../../components/layout/AdminShell'));
const AdminDashboard = lazy(() => import('../../features/admin/AdminDashboard'));
const CoursesPage = lazy(() => import('../../features/admin/CoursesPage'));
const CourseFormPage = lazy(() => import('../../features/admin/CourseFormPage'));
const ModulesPage = lazy(() => import('../../features/admin/ModulesPage'));
const VideosPage = lazy(() => import('../../features/admin/VideosPage'));
const QuizzesPage = lazy(() => import('../../features/admin/QuizzesPage'));
const PlaylistsPage = lazy(() => import('../../features/admin/PlaylistsPage'));
const UsersPage = lazy(() => import('../../features/admin/UsersPage'));
const ReportsPage = lazy(() => import('../../features/admin/ReportsPage'));
const AdminProfilePage = lazy(() => import('../../features/admin/AdminProfilePage'));

const StudentShell = lazy(() => import('../../components/layout/StudentShell'));
const StudentDashboard = lazy(() => import('../../features/courses/StudentDashboard'));
const CourseCatalog = lazy(() => import('../../features/courses/CourseCatalog'));
const CourseDetailPage = lazy(() => import('../../features/courses/CourseDetailPage'));
const LessonPlayer = lazy(() => import('../../features/courses/LessonPlayer'));
const ProgressPage = lazy(() => import('../../features/progress/ProgressPage'));
const ProfilePage = lazy(() => import('../../features/profile/ProfilePage'));

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },

  { path: '/auth/login', element: <AuthTransition>{wrap(LoginPage)}</AuthTransition> },
  { path: '/auth/register', element: <AuthTransition>{wrap(RegisterPage)}</AuthTransition> },
  { path: '/auth/forgot-password', element: <AuthTransition>{wrap(ForgotPasswordPage)}</AuthTransition> },

  {
    path: '/admin',
    element: (
      <ProtectedRoute requireAdmin>
        <Suspense fallback={<Fallback />}><AdminShell /></Suspense>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: wrap(AdminDashboard) },
      { path: 'courses', element: wrap(CoursesPage) },
      { path: 'courses/new', element: wrap(CourseFormPage) },
      { path: 'courses/:id/edit', element: wrap(CourseFormPage) },
      { path: 'modules', element: wrap(ModulesPage) },
      { path: 'videos', element: wrap(VideosPage) },
      { path: 'quizzes', element: wrap(QuizzesPage) },
      { path: 'playlists', element: wrap(PlaylistsPage) },
      { path: 'users', element: wrap(UsersPage) },
      { path: 'reports', element: wrap(ReportsPage) },
      { path: 'profile', element: wrap(AdminProfilePage) },
    ],
  },

  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Fallback />}><StudentShell /></Suspense>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: wrap(StudentDashboard) },
      { path: 'courses', element: wrap(CourseCatalog) },
      { path: 'courses/:slug', element: wrap(CourseDetailPage) },
      { path: 'learn/:courseId/:moduleId/:videoId', element: wrap(LessonPlayer) },
      { path: 'progress', element: wrap(ProgressPage) },
      { path: 'profile', element: wrap(ProfilePage) },
    ],
  },
]);
