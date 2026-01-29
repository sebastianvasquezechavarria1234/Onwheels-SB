import { CustomSidebar } from "../../layout/CustomSidebar"
import ClassLevels from "../../../admin/pages/clases/niveles/ClassLevels"

export const CustomNiveles = () => {
    return (
        <main className="relative w-full h-screen flex gap-[10px] overflow-hidden">
            <CustomSidebar />

            <section className="w-[80%] hide-scrollbar" style={{ height: "100%", overflowY: "auto" }}>
                <ClassLevels />
            </section>
        </main>
    )
}
