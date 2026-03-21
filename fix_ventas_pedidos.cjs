const fs = require('fs');

const filesToFix = [
    "c:\\Users\\hp\\Documents\\Onwheels-SB\\src\\feactures\\dashboards\\admin\\pages\\ventas\\ventas\\VentaEditar.jsx",
    "c:\\Users\\hp\\Documents\\Onwheels-SB\\src\\feactures\\dashboards\\admin\\pages\\ventas\\pedidos\\PedidoEditar.jsx"
];

const stringReplacements = [
    ["Identidad Comercial / Facturación", "Datos del Cliente"],
    ["Identificación Comercial", "Datos del Cliente"],
    ["Búsqueda de Usuario en Sistema", "Buscar Cliente"],
    ["Seleccione el perfil de origen para autocompletar la trazabilidad", "Busque y seleccione el cliente para esta orden"],
    ["Punto de Despacho / Entrega *", "Dirección de Entrega *"],
    ["Dirección fiscal o logística...", "Ingrese la dirección..."],
    ["Contacto para Notificación *", "Teléfono de Contacto *"],
    ["Relación de Existencias", "Productos Seleccionados"],
    ["Sincronización con inventario global", "Agregue artículos a esta orden"],
    ["Liquidación Fiscal", "Resumen"],
    ["Subtotal Neto", "Subtotal"],
    ["Retenciones / Impuestos", "Impuestos / Envío"],
    ["Total Facturado", "Total"],
    ["Emitir & Conciliar", "Guardar Cambios"],
    ["TRANSACCIÓN ENTREGADA (FINALIZADA)", "Entregada"],
    ["Fecha de Operación", "Fecha"]
];

function convertModalToView(content) {
    if (content.includes('return (\n        <div className={configUi.pageShell}>')) {
        let replacement = '';
        replacement += '    if (showProductSelector) {\n';
        replacement += '        return (\n';
        replacement += '            <div className={cn(configUi.pageShell, "absolute inset-0 z-50 bg-slate-50 min-h-screen !p-0 overflow-y-auto")}>\n';
        replacement += '                <ProductSelectorView\n';
        replacement += '                    onAddProduct={(item) => {\n';
        replacement += '                        handleAddProduct(item);\n';
        replacement += '                        showNotification("Producto añadido a la orden", "success");\n';
        replacement += '                    }}\n';
        replacement += '                    onClose={() => setShowProductSelector(false)}\n';
        replacement += '                />\n';
        replacement += '            </div>\n';
        replacement += '        );\n';
        replacement += '    }\n\n';
        replacement += '    return (\n        <div className={cn(configUi.pageShell, "pb-24")}>';

        content = content.replace('return (\n        <div className={cn(configUi.pageShell, "pb-24")}>', replacement);
    }
    
    // Remove the old modal
    const modalStart = content.indexOf('{/* CATALOG MODAL REPLACEMENT */}');
    if (modalStart !== -1) {
        const modalEnd = content.indexOf('</AnimatePresence>', modalStart) + '</AnimatePresence>'.length;
        if (modalEnd > modalStart) {
            content = content.slice(0, modalStart) + content.slice(modalEnd);
        }
    }

    return content;
}

for (const path of filesToFix) {
    if (fs.existsSync(path)) {
        let content = fs.readFileSync(path, 'utf8');

        // Text replacements
        for (const [oldStr, newStr] of stringReplacements) {
            content = content.replaceAll(oldStr, newStr);
        }

        // Structural fix to render ProductSelectorView before the main form return
        if (!content.includes('if (showProductSelector) {')) {
            content = convertModalToView(content);
            console.log("Converted modal to full view correctly in: " + path);
        }

        fs.writeFileSync(path, content, 'utf8');
        console.log("Replaced text successfully in: " + path);
    } else {
        console.log("File not found: " + path);
    }
}
