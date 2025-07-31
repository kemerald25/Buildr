
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-bold text-base-blue">404</h1>
      <h2 className="text-3xl font-bold mt-4">Page Not Found</h2>
      <p className="mt-4 text-gray-600">Sorry, the page you are looking for does not exist.</p>
      <div className="mt-8">
        <Link 
          to="/"
          className="bg-base-blue text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
