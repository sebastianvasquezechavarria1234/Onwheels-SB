import { CustomSidebar } from "../../layout/CustomSidebar"
import PlanClasses from "../../../admin/pages/clases/planes/plans"

export const CustomPlanes = () => {
  return (
    <main className="relative w-full h-screen flex gap-[10px] overflow-hidden">
      <CustomSidebar />

      <section className="w-[80%] hide-scrollbar" style={{ height: "100%", overflowY: "auto" }}>
        <PlanClasses />
      </section>
    </main>
  )
}
