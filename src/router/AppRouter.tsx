import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import Inbox from '../pages/Inbox/Inbox';
import EmailView from '../pages/EmailView/EmailView';
import ProtectedRoute from './ProtectedRoute';

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/inbox" element={
                    <ProtectedRoute><Inbox /></ProtectedRoute>
                } />

                <Route path="/email/:emailId" element={
                    <ProtectedRoute><EmailView /></ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;