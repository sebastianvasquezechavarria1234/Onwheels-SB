import { CustomSidebar } from "../../layout/CustomSidebar"
import Clases from "../../../admin/pages/clases/clases/Classes"

export const CustomClases = () => {
  return (
    <main className="relative w-full h-screen flex gap-[10px] overflow-hidden">
      <CustomSidebar />

      <section className="w-[80%] hide-scrollbar" style={{ height: "100%", overflowY: "auto" }}>
        <Clases />
      </section>
    </main>
  )
}
