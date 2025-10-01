import { Grid } from "../../components/shop/Grid"
import { Hero } from "../../components/shop/Hero"
import { StudentLayout } from "../layout/StudentLayout";


export const StudentStore = () => {
  return(
    <StudentLayout>
       <Hero />
        <Grid />
    </StudentLayout>
  )
}