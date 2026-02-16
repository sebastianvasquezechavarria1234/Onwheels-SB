import { Hero } from "../../components/landing/Hero"
import { AdminLayout } from "../layout/AdminLayout"
import { Home } from "../../pages/Home"

export const AdminHome = () => {
  return (
    <AdminLayout>
      <Hero></Hero>
      <Home></Home>
    </AdminLayout>
  )
}
