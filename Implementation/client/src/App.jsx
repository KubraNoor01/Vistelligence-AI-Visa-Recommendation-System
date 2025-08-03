import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './component/Layout/MainPage';
import Chatbot from './component/pages/Chatbot';
import Createpost from './component/pages/Createpost';
import UserProfile from './component/pages/UserProfile';
import ProfilePage from './component/pages/ProfilePage';
import Signup from './component/pages/SignUp';
import Login from './component/pages/Login';
import NonVerifyPage from './component/Admin/NonVerifyPage';
import Categories from './component/Admin/Catagories';
import ForgetPass from "./component/pages/ForgetPass";
import ResetPass from "./component/pages/ResetPass";
import NotFound from './component/pages/404Page'
import { ThemeProvider } from './context/ThemeContext';

// Function to check if the user is authenticated
const isAuthenticated = () => {
  return localStorage.getItem('authToken') !== null;
};

// Function to get the user role
const getUserRole = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData).role : null;
};

// ProtectedRoute component for general protection
const ProtectedRoute = ({ element }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return element;
};

// AdminRoute component for admin-only routes
const AdminRoute = ({ element }) => {
  const role = getUserRole();
  if (role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return element;
};

function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuthenticated() ? <Chatbot /> : <Navigate to="/login" replace />} />
        <Route path="/community" element={<MainPage />} />
        <Route path="/create-post" element={<ProtectedRoute element={<Createpost />} />} />
        <Route path="/UserProfile" element={<ProtectedRoute element={<UserProfile />} />} />
        <Route path="/Account" element={<ProtectedRoute element={<ProfilePage />} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/notverify" element={<NonVerifyPage />} />
        <Route path="/report" element={<AdminRoute element={<Categories />} />} />
        <Route path="/Forget" element={<ForgetPass/>}/>
        <Route path="/reset-password/:token" element={<ResetPass/>}/>
        <Route path="/notFound" element={<NotFound/>}/>
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
