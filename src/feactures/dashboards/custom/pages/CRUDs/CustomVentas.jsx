import { CustomSidebar } from "../../layout/CustomSidebar"
import Ventas from "../../../admin/pages/ventas/ventas/ventas"

export const CustomVentas = () => {
    return (
        <main className="relative w-full h-screen flex gap-[10px] overflow-hidden">
            <CustomSidebar />

            <section className="w-[80%] hide-scrollbar" style={{ height: "100%", overflowY: "auto" }}>
                <Ventas />
            </section>
        </main>
    )
}
