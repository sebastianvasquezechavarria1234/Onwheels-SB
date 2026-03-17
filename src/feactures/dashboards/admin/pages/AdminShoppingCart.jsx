import React from "react";
import { AdminLayout } from "../../../landing/admin/layout/AdminLayout";
import { ShoppingCartContent } from "../../../landing/pages/ShoppingCart";

export const AdminShoppingCart = () => {
    return (
        <AdminLayout>
            <ShoppingCartContent />
        </AdminLayout>
    );
};

export default AdminShoppingCart;
