import React from "react";
import { UsersLayout } from "../layout/UsersLayout";
import { ShoppingCartContent } from "../../pages/ShoppingCart";

export const UsersShoppingCart = () => {
    return (
        <UsersLayout>
            <ShoppingCartContent />
        </UsersLayout>
    );
};