import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'

const Home = lazy(() => import('../pages/dashboard/Home'))
const Login = lazy(() => import('../pages/auth/Login'))
const Signup = lazy(() => import('../pages/auth/Signup'))
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'))
const AuthAction = lazy(() => import('../pages/auth/AuthAction'))
const History = lazy(() => import('../pages/dashboard/History'))
const QuizReview = lazy(() => import('../pages/dashboard/QuizReview'))
const Overview = lazy(() => import('../pages/dashboard/Overview'))
const Analysis = lazy(() => import('../pages/dashboard/Analysis'))
const Bookmarks = lazy(() => import('../pages/dashboard/Bookmarks'))
const CreateQuiz = lazy(() => import('../pages/dashboard/CreateQuiz'))
const Quiz = lazy(() => import('../pages/quiz/Quiz'))
const DashboardLayout = lazy(() => import('../components/layout/DashboardLayout'))
const ProtectedRoute = lazy(() => import('../components/auth/ProtectedRoute'))

const RouteLoading = () => (
  <div style={{ padding: '1.5rem', color: 'var(--color-text-secondary)' }}>Loading...</div>
)

const AppRoutes = () => {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        {/* Auth Routes - No Layout */}
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/auth/action' element={<AuthAction />} />

        {/* Dashboard Routes - With Layout and Protection */}
        <Route path='/' element={
          <ProtectedRoute>
            <DashboardLayout>
              <Home />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path='/overview' element={
          <ProtectedRoute>
            <DashboardLayout>
              <Overview />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path='/analysis' element={
          <ProtectedRoute>
            <DashboardLayout>
              <Analysis />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path='/history' element={
          <ProtectedRoute>
            <DashboardLayout>
              <History />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path='/history/:quizId' element={
          <ProtectedRoute>
            <DashboardLayout>
              <QuizReview />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path='/bookmarks' element={
          <ProtectedRoute>
            <DashboardLayout>
              <Bookmarks />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path='/create-quiz' element={
          <ProtectedRoute>
            <DashboardLayout>
              <CreateQuiz />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Quiz Routes - Protected */}
        <Route path='/quiz/:quizId' element={
          <ProtectedRoute>
            <Quiz />
          </ProtectedRoute>
        } />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes