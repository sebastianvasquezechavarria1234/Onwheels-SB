import { createContext, useContext } from 'react';

export const AdminLayoutContext = createContext({
    showSidebar: true, // Default to showing the sidebar
});

export const useAdminLayout = () => useContext(AdminLayoutContext);
