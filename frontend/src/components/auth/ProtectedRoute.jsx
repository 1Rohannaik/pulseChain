import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, userRole } = useAuth();
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }
  
  // Check role if required
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to dashboard if role doesn't match
    return <Navigate to="/dashboard" />;
  }
  
  // If authenticated and role matches (or no role required), show the component
  return children;
}

export default ProtectedRoute;