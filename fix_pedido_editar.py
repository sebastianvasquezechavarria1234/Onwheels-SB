import re
import os

file_path = r"c:\Users\hp\Documents\Onwheels-SB\src\feactures\dashboards\admin\pages\ventas\pedidos\PedidoEditar.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Import ProductSelectorView
if "ProductSelectorView" not in content:
    content = content.replace(
        'import { configUi } from "../../configuracion/configUi";',
        'import { configUi } from "../../configuracion/configUi";\nimport ProductSelectorView from "../../compras/compras/ProductSelectorView";'
    )

# 2. State replacements
content = re.sub(
    r"const \[modal, setModal\] = useState\(null\);.*?const \[searchTerm, setSearchTerm\] = useState\(\"\"\);",
    r"const [showProductSelector, setShowProductSelector] = useState(false);",
    content,
    flags=re.DOTALL
)

# 3. Remove product modal functions
# Look for: const openProductModal = () => { ... } until const handleSubmit = async (e) => {
content = re.sub(
    r"const openProductModal = \(\) => \{.+?(?=const handleSubmit = async \(e\) => \{)",
    "",
    content,
    flags=re.DOTALL
)

# 4. Remove filteredProducts
content = re.sub(
    r"const filteredProducts = useMemo\(\(\) =>.+?\[productos, searchTerm\]\);",
    "",
    content,
    flags=re.DOTALL
)

# 5. Handle UI insertion
# First, change Ver Catalogo button onClick
content = content.replace("openProductModal", "() => setShowProductSelector(true)")

# Second, wrap the main UI with AnimatePresence
# Find the start of the return
return_start = content.find('return (\n        <div className={cn(configUi.pageShell, "pb-24")}>')
# Find the first div inside
first_div_idx = content.find('<div className={cn(configUi.headerRow, "sticky top-4', return_start)

before_form = content[:first_div_idx]
after_form = content[first_div_idx:]

# Before form we put AnimatePresence
wrapper_start = """            <AnimatePresence mode="wait">
                {showProductSelector ? (
                    <ProductSelectorView
                        key="product-selector"
                        allProducts={productos}
                        onAdd={(data) => {
                            const { product, variant, cantidad, precio_unitario } = data;
                            const variantData = product.variantes?.find(v => v.id_variante === variant.id_variante) || variant;
                            const newItem = {
                                id_producto: product.id_producto,
                                nombre_producto: product.nombre_producto,
                                id_variante: variantData.id_variante,
                                id_color: variantData.id_color,
                                nombre_color: variantData.nombre_color,
                                id_talla: variantData.id_talla,
                                nombre_talla: variantData.nombre_talla,
                                qty: cantidad,
                                price: precio_unitario,
                                stockMax: variantData.stock
                            };
                            setForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
                            showNotification("Producto añadido", "success");
                            setShowProductSelector(false);
                        }}
                        onClose={() => setShowProductSelector(false)}
                    />
                ) : (
                    <motion.div key="pedido-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                        """

# Now find the end of the form, which ends right before {/* NOTIFICATION */}
notification_div_idx = after_form.find('{/* NOTIFICATION */}')
form_content = after_form[:notification_div_idx]
rest_content = after_form[notification_div_idx:]

wrapper_end = """
                    </motion.div>
                )}
            </AnimatePresence>

            """

content = before_form + wrapper_start + form_content.rstrip() + wrapper_end + rest_content

# Finally delete the old modal from rest_content
content = re.sub(
    r"\{\/\* CATALOG MODAL \*\/\}.+?(?=\<\/div\>\n    \);\n\})",
    "",
    content,
    flags=re.DOTALL
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("File rewritten successfully")
