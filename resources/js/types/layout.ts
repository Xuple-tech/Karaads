import { ReactNode } from 'react';
import { User } from './index';

export interface LayoutProps {
  children: ReactNode;
  auth: {
    user: User;
  };
  title?: string;
}

export interface HeaderProps {
  user: User;
}

export interface SidebarProps {
  // Props can be extended as needed
}
