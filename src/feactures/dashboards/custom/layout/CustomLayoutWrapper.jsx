import { Outlet } from "react-router-dom";
import { CustomDashboardLayout } from "./CustomDashboardLayout";

export const CustomLayoutWrapper = () => {
    return (
        <CustomDashboardLayout>
            <Outlet />
        </CustomDashboardLayout>
    );
};
