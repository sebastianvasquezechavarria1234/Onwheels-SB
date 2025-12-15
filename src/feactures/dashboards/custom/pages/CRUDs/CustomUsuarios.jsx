import { CustomSidebar } from "../../layout/CustomSidebar"
import Usuarios from "../../../admin/pages/configuracion/usuarios/usuarios"

export const CustomUsuarios = () => {
  return (
    <main className="relative w-full h-screen flex gap-[10px] overflow-hidden">
      <CustomSidebar />

      <section className="w-[80%] hide-scrollbar" style={{ height: "100%", overflowY: "auto" }}>
        <Usuarios />
      </section>
    </main>
  )
}
