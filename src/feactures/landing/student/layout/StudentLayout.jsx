
import Footer from "../../layout/Footer";
import { StudentHeader } from "./StudentHeader";

export const Layout = ({ children }) => {
  return (
    <main>
      <StudentHeader />
        {children}
      <Footer />
    </main>
  );
};
