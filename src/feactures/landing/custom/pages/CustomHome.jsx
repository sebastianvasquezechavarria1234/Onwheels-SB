import { CustomLayout } from "../layout/CustomLayout"
import { Hero } from "../../components/landing/Hero"
import { Grid } from "../../components/landing/Grid"

export const CustomHome = () => {
  return (
    <CustomLayout>
      <Hero />
      <Grid />
    </CustomLayout>
  )
}
