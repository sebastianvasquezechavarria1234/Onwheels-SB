import { CustomSidebar } from "../../layout/CustomSidebar"
import Roles from "../../../admin/pages/configuracion/roles/Roles"

export const CustomRoles = () => {
  return (
    <main className="relative w-full h-screen flex gap-[10px] overflow-hidden">
      <CustomSidebar />

      <section className="w-[80%] hide-scrollbar" style={{ height: "100%", overflowY: "auto" }}>
        <Roles />
      </section>
    </main>
  )
}
