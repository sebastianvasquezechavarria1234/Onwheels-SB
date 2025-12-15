import { Grid } from "../../components/shop/Grid"
import { Hero } from "../../components/shop/Hero"
import { InstructorLayout } from "../layout/InstructorLayout";


export const InstructorStore = () => {
  return(
    <InstructorLayout>
       <Hero />
        <Grid />
    </InstructorLayout>
  )
}