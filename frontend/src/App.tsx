import { Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import Navbar from './components/Navbar';
import HotelPageWrapper from './components/HotelPageWrapper';
import { useAuth } from './hooks/useAuth';

import HomePage from './pages/HomePage';
import MyBookingsPage from './pages/MyBookingsPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import AddHotelPage from './pages/AddHotelPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
    const { user, setUser, loadingAuth, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        window.location.href = '/';
    };

    // Пока проверяем авторизацию, показываем пустой экран (или можно добавить спиннер)
    if (loadingAuth) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={user} onLogout={handleLogout} />
            <Routes>
                {/* Публичные */}
                <Route path="/" element={<HomePage />} />
                <Route path="/hotels/:id" element={<HotelPageWrapper />} />
                <Route
                    path="/login"
                    element={
                        <LoginPage
                            onLoginSuccess={(userData) => {
                                setUser(userData);
                                window.location.href = '/';
                            }}
                        />
                    }
                />
                <Route path="/register" element={<RegisterPage />} />

                {/* Защищённые */}
                <Route path="/my-bookings" element={user ? <MyBookingsPage /> : <Navigate to="/login" />} />
                <Route
                    path="/add-hotel"
                    element={
                        user?.role === 'Owner'
                            ? <AddHotelPage ownerEmail={user.email} onSuccess={() => window.location.href = '/'} />
                            : <Navigate to="/" />
                    }
                />
                <Route
                    path="/owner-dashboard"
                    element={user?.role === 'Owner' ? <OwnerDashboardPage /> : <Navigate to="/" />}
                />

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    );
}