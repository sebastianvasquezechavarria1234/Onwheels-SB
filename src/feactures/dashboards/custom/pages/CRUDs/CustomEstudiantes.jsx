import { CustomSidebar } from "../../layout/CustomSidebar"
import Estudiantes from "../../../admin/pages/clases/estudiantes/students"

export const CustomEstudiantes = () => {
  return (
    <main className="relative w-full h-screen flex gap-[10px] overflow-hidden">
      <CustomSidebar />

      <section className="w-[80%] hide-scrollbar" style={{ height: "100%", overflowY: "auto" }}>
        <Estudiantes />
      </section>
    </main>
  )
}
