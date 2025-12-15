import { CustomLayout } from "../layout/CustomLayout"
import { Hero } from "../../components/shop/Hero"
import { Grid } from "../../components/shop/Grid"

export const CustomStore = () => {
  return (
    <CustomLayout>
      <Hero />
      <Grid />
    </CustomLayout>
  )
}
