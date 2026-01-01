import React, { useContext } from 'react';
import NotFound from '../pages/NotFound';
import AuthContext from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Loading...</div>; // Or a spinner
    }

    if (user && user.isAdmin) {
        return children;
    }

    return <NotFound />;
};

export default AdminRoute;
