import { CustomSidebar } from "../../layout/CustomSidebar"
import Instructores from "../../../admin/pages/clases/instructores/Instructores"

export const CustomInstructores = () => {
  return (
    <main className="relative w-full h-screen flex gap-[10px] overflow-hidden">
      <CustomSidebar />

      <section className="w-[80%] hide-scrollbar" style={{ height: "100%", overflowY: "auto" }}>
        <Instructores />
      </section>
    </main>
  )
}
