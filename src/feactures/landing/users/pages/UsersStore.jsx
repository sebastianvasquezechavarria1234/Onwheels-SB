import { Grid } from "../../components/shop/Grid"
import { Hero } from "../../components/shop/Hero"
import { UsersLayout } from "../layout/UsersLayout";

export const UsersStore = () => {
  return(
    <UsersLayout>
       <Hero />
        <Grid />
    </UsersLayout>
  )
}