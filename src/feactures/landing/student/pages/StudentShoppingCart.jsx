import React from "react";
import { StudentLayout } from "../layout/StudentLayout";
import { ShoppingCartContent } from "../../pages/ShoppingCart";

export const StudentShoppingCart = () => {
    return (
        <StudentLayout>
            <ShoppingCartContent />
        </StudentLayout>
    );
};