import { CustomSidebar } from "../../layout/CustomSidebar"
import Compras from "../../../admin/pages/compras/compras/compras"

export const CustomCompras = () => {
  return (
    <main className="relative w-full h-screen flex gap-[10px] overflow-hidden">
      <CustomSidebar />

      <section className="w-[80%] hide-scrollbar" style={{ height: "100%", overflowY: "auto" }}>
        <Compras />
      </section>
    </main>
  )
}
