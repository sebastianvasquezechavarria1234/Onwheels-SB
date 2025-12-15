import { CustomSidebar } from "../../layout/CustomSidebar"
import Matriculas from "../../../admin/pages/clases/matriculas/matriculas"

export const CustomMatriculas = () => {
  return (
    <main className="relative w-full h-screen flex gap-[10px] overflow-hidden">
      <CustomSidebar />

      <section className="w-[80%] hide-scrollbar" style={{ height: "100%", overflowY: "auto" }}>
        <Matriculas />
      </section>
    </main>
  )
}
