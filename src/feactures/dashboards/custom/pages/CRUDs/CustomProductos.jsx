import { CustomSidebar } from "../../layout/CustomSidebar"
import Products from "../../../admin/pages/compras/productos/Products"

export const CustomProductos = () => {
  return (
    <main className="relative w-full h-screen flex gap-[10px] overflow-hidden">
      <CustomSidebar />

      <section className="w-[80%] hide-scrollbar" style={{ height: "100%", overflowY: "auto" }}>
        <Products />
      </section>
    </main>
  )
}
