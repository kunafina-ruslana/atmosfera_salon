import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header/Header';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Profile from './pages/Profile/Profile';
import Services from './pages/Services/Services';
import ServiceDetails from './pages/ServiceDetails/ServiceDetails';
import Footer from './components/Footer/Footer';
import AdminPanel from './pages/AdminPanel/AdminPanel';
import Booking from './pages/Booking/Booking';
import MasterDashboard from './pages/MasterDashboard/MasterDashboard';
import Reports from './pages/Reports/Reports';
import AdminSchedule from './pages/AdminSchedule/AdminSchedule';
import MasterSchedule from './pages/MasterSchedule/MasterSchedule';


const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="loading">Загрузка...</div>;
  
  if (!user) return <Navigate to="/login" />;
  
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Services />} />
    <  Route path="/services/:id" element={<ServiceDetails />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/booking" element={<PrivateRoute><Booking /></PrivateRoute>} />
      <Route path="/master-dashboard" element={<PrivateRoute roles={['master', 'admin']}><MasterDashboard /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminPanel /></PrivateRoute>} />
      <Route path="/admin/reports" element={<PrivateRoute roles={['admin']}><Reports /></PrivateRoute>} />
      <Route path="/admin/schedule" element={<PrivateRoute roles={['admin']}><AdminSchedule /></PrivateRoute>} />
<Route path="/master-schedule" element={<PrivateRoute roles={['master', 'admin']}><MasterSchedule /></PrivateRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Header />
            <AppRoutes />
            <Footer/>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;