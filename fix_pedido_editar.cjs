const fs = require('fs');
const path = require('path');
const filePath = "c:\\Users\\hp\\Documents\\Onwheels-SB\\src\\feactures\\dashboards\\admin\\pages\\ventas\\pedidos\\PedidoEditar.jsx";
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Import ProductSelectorView
if (!content.includes('ProductSelectorView')) {
    content = content.replace(
        'import { configUi } from "../../configuracion/configUi";',
        'import { configUi } from "../../configuracion/configUi";\nimport ProductSelectorView from "../../compras/compras/ProductSelectorView";'
    );
}

// 2. State replacements
content = content.replace(
    /const \[modal, setModal\] = useState\(null\);[\s\S]*?const \[searchTerm, setSearchTerm\] = useState\(""\);/,
    'const [showProductSelector, setShowProductSelector] = useState(false);'
);

// 3. Remove product modal functions
content = content.replace(
    /const openProductModal = \(\) => \{[\s\S]*?(?=const handleSubmit = async \(e\) => \{)/,
    ''
);

// 4. Remove filteredProducts
content = content.replace(
    /const filteredProducts = useMemo\(\(\) =>[\s\S]*?\[productos, searchTerm\]\);/,
    ''
);

// 5. Handle UI insertion
content = content.replace('openProductModal', '() => setShowProductSelector(true)');

const returnStart = content.indexOf('return (\n        <div className={cn(configUi.pageShell, "pb-24")}>');
const firstDivIdx = content.indexOf('<div className={cn(configUi.headerRow, "sticky top-4', returnStart);

const beforeForm = content.slice(0, firstDivIdx);
const afterForm = content.slice(firstDivIdx);

const wrapperStart = `            <AnimatePresence mode="wait">\n                {showProductSelector ? (\n                    <ProductSelectorView\n                        key="product-selector"\n                        allProducts={productos}\n                        onAdd={(data) => {\n                            const { product, variant, cantidad, precio_unitario } = data;\n                            const variantData = product.variantes?.find(v => v.id_variante === variant.id_variante) || variant;\n                            const newItem = {\n                                id_producto: product.id_producto,\n                                nombre_producto: product.nombre_producto,\n                                id_variante: variantData.id_variante,\n                                id_color: variantData.id_color,\n                                nombre_color: variantData.nombre_color,\n                                id_talla: variantData.id_talla,\n                                nombre_talla: variantData.nombre_talla,\n                                qty: cantidad,\n                                price: precio_unitario,\n                                stockMax: variantData.stock\n                            };\n                            setForm(prev => ({ ...prev, items: [...prev.items, newItem] }));\n                            showNotification("Producto añadido", "success");\n                            setShowProductSelector(false);\n                        }}\n                        onClose={() => setShowProductSelector(false)}\n                    />\n                ) : (\n                    <motion.div key="pedido-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>\n                        `;

const notificationDivIdx = afterForm.indexOf('{/* NOTIFICATION */}');
const formContent = afterForm.slice(0, notificationDivIdx);
const restContent = afterForm.slice(notificationDivIdx);

const wrapperEnd = `\n                    </motion.div>\n                )}\n            </AnimatePresence>\n\n            `;

let finalContent = beforeForm + wrapperStart + formContent.trimEnd() + wrapperEnd + restContent;

// Finally delete the old modal from finalContent
finalContent = finalContent.replace(
    /\{\/\* CATALOG MODAL \*\/\}.*?(?=<\/div>\n    \);\n\})/gs,
    ''
);

fs.writeFileSync(filePath, finalContent, 'utf-8');
console.log('File rewritten successfully');
