import { CustomSidebar } from "../../layout/CustomSidebar"
import PreinscripcionesAdmin from "../../../admin/pages/clases/preinscripciones/PreRegistrations"

export const CustomPreinscripciones = () => {
  return (
    <main className="relative w-full h-screen flex gap-[10px] overflow-hidden">
      <CustomSidebar />

      <section className="w-[80%] hide-scrollbar" style={{ height: "100%", overflowY: "auto" }}>
        <PreinscripcionesAdmin />
      </section>
    </main>
  )
}
