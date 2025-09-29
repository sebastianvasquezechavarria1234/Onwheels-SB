
import Footer from "../../layout/Footer";
import { InstructorHeader } from "./InstructorHeader";

export const InstructorLayout = ({ children }) => {
  return (
    <main>
      <InstructorHeader />
        {children}
      <Footer />
    </main>
  );
};
