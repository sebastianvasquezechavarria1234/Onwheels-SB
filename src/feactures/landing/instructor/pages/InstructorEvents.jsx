import React from "react";
import { InstructorLayout } from "../layout/InstructorLayout";
import { EventsContent } from "../../pages/Events";


export const InstructorEvents = () => {
  return (
    <InstructorLayout>
      <EventsContent />
    </InstructorLayout>
  )
}