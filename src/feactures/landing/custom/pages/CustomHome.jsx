import { CustomLayout } from "../layout/CustomLayout"
import { Hero } from "../../components/landing/Hero"
import { Home } from "../../pages/Home"


export const CustomHome = () => {
  return (
    <CustomLayout>
      <Hero />
     <Home/>
    </CustomLayout>
  )
}
