// src/features/dashboards/admin/pages/compras/productos/Products.jsx
import React, { useEffect, useState } from "react";
import { X, Plus, Trash2, Search, Eye, Pen, ImageIcon, Tag, MapPin, User, Calendar, Hash, ChevronLeft, ChevronRight, CheckCircle, Clock, Download, ChevronDown, TrendingUp, PlusCircle, AlertTriangle, FileText, Upload, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  getColores,
  createColor,
  getTallas,
  createTalla,
  createVariante,
  deleteVariante,
  getVariantes,
} from "../../services/productosServices";
import { getCategorias } from "../../services/categoriasService";
import { canManage } from "../../../../../../utils/permissions";
import { configUi } from "../../../config/configUi";

// Helper para clases condicionales
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
