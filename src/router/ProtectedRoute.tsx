import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

interface Props {
    children: React.ReactNode;
}

// Redirige al login si no hay token — cualquier ruta privada lo usa
const ProtectedRoute = ({ children }: Props) => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

export default ProtectedRoute;