import { Grid } from "../../components/shop/Grid"
import { Hero } from "../../components/shop/Hero"
import { AdminLayout } from "../layout/AdminLayout"

export const AdminStore = () => {
  return (
    <AdminLayout>
      <Hero />
      <Grid />
    </AdminLayout>
  )
}
