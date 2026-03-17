import { CustomSidebar } from "./CustomSidebar";
import { Outlet } from "react-router-dom";

export const CustomLayoutWrapper = () => {
    return (
        <main className="relative w-full h-screen flex gap-[10px] overflow-hidden">
            <CustomSidebar />
            <section className="w-full hide-scrollbar" style={{ height: "100%", overflowY: "auto" }}>
                <Outlet />
            </section>
        </main>
    );
};
