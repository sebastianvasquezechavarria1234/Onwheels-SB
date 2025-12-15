import { Hero } from "../../components/landing/Hero"
import { AdminLayout } from "../layout/AdminLayout"
import { Grid } from "../../components/landing/Grid"

export const AdminHome = () => {
  return (
    <AdminLayout>
      <Hero></Hero>
      <Grid></Grid>
    </AdminLayout>
  )
}
