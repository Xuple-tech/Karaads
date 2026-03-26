import React from 'react';
import { Link, usePage } from '@inertiajs/react';

import AppLayout from './app-layout';

interface UserLayoutProps {
    children: React.ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {

   

    return (
      <AppLayout>
        {children}
      </AppLayout>
    );
};

export default UserLayout;
