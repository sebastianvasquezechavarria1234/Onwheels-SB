
import Footer from "../../layout/Footer";
import { StudentHeader } from "./StudentHeader";

export const StudentLayout = ({ children }) => {
  return (
    <main>
      <StudentHeader />
        {children}
      <Footer />
    </main>
  );
};
