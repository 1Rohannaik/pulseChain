import { Link } from 'react-router-dom';
import { FiAlertCircle } from 'react-icons/fi';

function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
      <div className="text-center p-8">
        <FiAlertCircle className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-bold text-neutral-700 dark:text-neutral-300 mb-4">Page Not Found</h2>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary">
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;