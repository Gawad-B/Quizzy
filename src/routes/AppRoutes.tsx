import { Routes, Route } from 'react-router-dom'
import Home from '../pages/dashboard/Home'
import Login from '../pages/auth/Login'
import Signup from '../pages/auth/Signup'
import History from '../pages/dashboard/History'
import Overview from '../pages/dashboard/Overview'
import Analysis from '../pages/dashboard/Analysis'
import Rooms from '../pages/dashboard/Rooms'
import Notes from '../pages/dashboard/Notes'
import CreateQuiz from '../pages/dashboard/CreateQuiz'
import Quiz from '../pages/quiz/Quiz'
import DashboardLayout from '../components/layout/DashboardLayout'
import ProtectedRoute from '../components/auth/ProtectedRoute'

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes - No Layout */}
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<Signup />} />

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
      <Route path='/rooms' element={
        <ProtectedRoute>
          <DashboardLayout>
            <Rooms />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path='/notes' element={
        <ProtectedRoute>
          <DashboardLayout>
            <Notes />
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
  )
}

export default AppRoutes