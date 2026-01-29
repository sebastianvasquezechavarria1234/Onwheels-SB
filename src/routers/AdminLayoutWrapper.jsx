import { Outlet } from "react-router-dom";
import { Layout } from "../feactures/dashboards/admin/layout/layout";

export const AdminLayoutWrapper = () => {
    return (
        <Layout>
            <Outlet />
        </Layout>
    );
};
