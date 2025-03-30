import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/common/AdminSidebar';

const AdminLayout = () => {
    return (
        <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-64 flex-shrink-0">
                <AdminSidebar />
            </div>
            <div className="flex-grow">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
