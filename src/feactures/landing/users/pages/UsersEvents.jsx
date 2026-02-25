import React from "react";
import { EventsContent } from "../../pages/Events";
import { UsersLayout } from "../layout/UsersLayout";


export const UsersEvents = () => {
  return (
    <UsersLayout>
      <EventsContent />
    </UsersLayout>
  )
}