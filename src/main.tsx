import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App'
import Auth from './pages/Auth'
import Landing from './pages/Landing'
import VerifyTutor from './pages/VerifyTutor'
import ChatPage from './pages/Chat'
import Profile from './pages/Profile'
import { AuthProvider } from './context/AuthProvider'
import ErrorPage from './pages/ErrorPage'
import Inbox from './pages/Inbox'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'auth', element: <Auth /> },
      { path: 'verify', element: <VerifyTutor /> },
      { path: 'inbox', element: <Inbox /> },
      { path: 'chat/:chatId', element: <ChatPage /> },
      { path: 'profile', element: <Profile /> }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
)


