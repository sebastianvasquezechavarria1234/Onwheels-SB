import React from "react";
import { HomeContent } from "../../pages/Home"
import { UsersLayout } from "../layout/UsersLayout";

export const UsersHome = () => {
    return (
        <UsersLayout>
            <HomeContent />
        </UsersLayout>
    )
}