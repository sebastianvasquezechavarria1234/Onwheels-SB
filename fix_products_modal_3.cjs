const fs = require('fs');
const path = 'c:\\Users\\hp\\Documents\\Onwheels-SB\\src\\feactures\\dashboards\\admin\\pages\\compras\\productos\\Products.jsx';

let content = fs.readFileSync(path, 'utf8');

// Find the old modal section start and end markers
const MODAL_START = '        {/* --- MODALS --- */}';
const MODAL_END = '        </AnimatePresence>\n\n\n\r\n\r\n                  {/* === Modal de Vista === */}';

const startIdx = content.indexOf(MODAL_START);
const endMarker = '        </AnimatePresence>\n\n\n\r\n\r\n                  {/* === Modal de Vista === */}';
const endIdx = content.indexOf(endMarker);

if (startIdx === -1) {
  console.error('Could not find modal start marker');
  process.exit(1);
}

if (endIdx === -1) {
  console.error('Could not find modal end marker');
  // Let's try to find it differently
  const altEnd = '=== Modal de Vista ===';
  const altIdx = content.indexOf(altEnd);
  console.log('Alt marker at index:', altIdx);
  console.log('Context:', JSON.stringify(content.substring(altIdx - 100, altIdx + 20)));
  process.exit(1);
}

console.log('Start at:', startIdx, 'End at:', endIdx);

const newModal = `        {/* --- MODALS --- */}
        <AnimatePresence>
          {isProductModalOpen && (
            <motion.div
              className={configUi.modalBackdrop}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
            >
              <motion.div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col overflow-hidden border border-slate-100"
                style={{ maxHeight: "92vh" }}
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="px-7 pt-7 pb-5 border-b border-slate-100 shrink-0">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-xl font-black text-[#16315f] tracking-tight" style={{ fontFamily: '"Outfit", sans-serif' }}>
                        {productForm.id_producto ? "Editar Producto" : "Nuevo Producto"}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {productForm.id_producto ? "Actualiza la información del producto" : "Completa los campos para agregar un producto"}
                      </p>
                    </div>
                    <button onClick={() => setIsProductModalOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all">
                      <X size={18} />
                    </button>
                  </div>
                  {/* Tabs */}
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                    {[
                      { id: 1, label: "Información" },
                      { id: 2, label: "Precios" },
                      { id: 3, label: "Fotos y Stock" },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setCurrentStep(tab.id)}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                          currentStep === tab.id
                            ? "bg-white text-[#16315f] shadow-sm"
                            : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <AnimatePresence mode="wait">
                    {/* ── TAB 1: INFORMACIÓN ── */}
                    {currentStep === 1 && (
                      <motion.div key="tab1" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="p-7 space-y-5">
                        <div className={configUi.fieldGroup}>
                          <label className={configUi.fieldLabel}>Nombre del producto *</label>
                          <input
                            autoFocus
                            name="nombre_producto"
                            value={productForm.nombre_producto}
                            onChange={handleProductChange}
                            onBlur={handleProductBlur}
                            placeholder="Ej: Camiseta Deportiva Premium"
                            className={cn(configUi.fieldInput, formErrors.nombre_producto && "border-rose-400 bg-rose-50")}
                          />
                          {formErrors.nombre_producto && <p className="text-rose-500 text-xs font-bold mt-1">{formErrors.nombre_producto}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Categoría *</label>
                            <div className="relative">
                              <select name="id_categoria" value={productForm.id_categoria ?? ""} onChange={handleProductChange} onBlur={handleProductBlur} className={cn(configUi.fieldSelect, formErrors.id_categoria && "border-rose-400 bg-rose-50")}>
                                <option value="">Seleccionar...</option>
                                {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>)}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                            </div>
                            {formErrors.id_categoria && <p className="text-rose-500 text-xs font-bold mt-1">{formErrors.id_categoria}</p>}
                          </div>
                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Visibilidad</label>
                            <div className="relative">
                              <select name="estado" value={productForm.estado} onChange={handleProductChange} className={configUi.fieldSelect}>
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                            </div>
                          </div>
                        </div>

                        <div className={configUi.fieldGroup}>
                          <label className={configUi.fieldLabel}>Descripción *</label>
                          <textarea name="descripcion" value={productForm.descripcion} onChange={handleProductChange} onBlur={handleProductBlur} rows={4} placeholder="Describe el producto: materiales, uso, características..." className={cn(configUi.fieldInput, "pt-3 resize-none", formErrors.descripcion && "border-rose-400 bg-rose-50")} />
                          {formErrors.descripcion && <p className="text-rose-500 text-xs font-bold mt-1">{formErrors.descripcion}</p>}
                          <p className="text-[10px] text-slate-300 mt-1 text-right">{(productForm.descripcion || "").length}/500</p>
                        </div>
                      </motion.div>
                    )}

                    {/* ── TAB 2: PRECIOS ── */}
                    {currentStep === 2 && (
                      <motion.div key="tab2" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="p-7 space-y-5">
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-600 font-medium">
                          💡 Ingresa el <strong>costo</strong> y el <strong>margen</strong> para calcular el precio de venta automáticamente, o ajústalo manualmente.
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Costo de compra *</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                              <input type="number" name="precio_compra" value={productForm.precio_compra} onChange={handleProductChange} onBlur={handleProductBlur} placeholder="0" className={cn(configUi.fieldInput, "pl-8 font-bold", formErrors.precio_compra && "border-rose-400 bg-rose-50")} />
                            </div>
                            {formErrors.precio_compra && <p className="text-rose-500 text-xs font-bold mt-1">{formErrors.precio_compra}</p>}
                          </div>

                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Margen de ganancia (%)</label>
                            <div className="relative">
                              <input type="number" name="porcentaje_ganancia" value={productForm.porcentaje_ganancia} onChange={handleProductChange} placeholder="0" className={cn(configUi.fieldInput, "pr-8 font-bold text-emerald-700 bg-emerald-50 border-emerald-200 focus:border-emerald-400")} />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-sm">%</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Precio de venta *</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 font-bold text-sm">$</span>
                              <input type="number" name="precio" value={productForm.precio} onChange={handleProductChange} onBlur={handleProductBlur} placeholder="0" className={cn(configUi.fieldInput, "pl-8 font-bold text-indigo-700 bg-indigo-50 border-indigo-200 focus:border-indigo-400", formErrors.precio && "border-rose-400 bg-rose-50")} />
                            </div>
                            {formErrors.precio && <p className="text-rose-500 text-xs font-bold mt-1">{formErrors.precio}</p>}
                          </div>

                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Descuento promocional (%)</label>
                            <div className="relative">
                              <input type="number" name="descuento_producto" value={productForm.descuento_producto} onChange={handleProductChange} placeholder="0" className={cn(configUi.fieldInput, "pr-8 font-bold text-rose-600 bg-rose-50 border-rose-200 focus:border-rose-400", formErrors.descuento_producto && "border-rose-400 bg-rose-50")} />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-400 font-bold text-sm">%</span>
                            </div>
                            {formErrors.descuento_producto && <p className="text-rose-500 text-xs font-bold mt-1">{formErrors.descuento_producto}</p>}
                          </div>
                        </div>

                        {Number(productForm.precio) > 0 && (
                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precio final al cliente</p>
                              {Number(productForm.descuento_producto) > 0 ? (
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-slate-300 line-through text-base font-bold">\${Number(productForm.precio).toLocaleString()}</span>
                                  <span className="text-2xl font-black text-[#16315f]">\${(Number(productForm.precio) * (1 - Number(productForm.descuento_producto) / 100)).toLocaleString()}</span>
                                  <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">-{productForm.descuento_producto}%</span>
                                </div>
                              ) : (
                                <span className="text-2xl font-black text-[#16315f] mt-1 block">\${Number(productForm.precio).toLocaleString()}</span>
                              )}
                            </div>
                            {Number(productForm.precio_compra) > 0 && Number(productForm.precio) > 0 && (
                              <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ganancia unitaria</p>
                                <span className="text-lg font-black text-emerald-600">\${(Number(productForm.precio) - Number(productForm.precio_compra)).toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* ── TAB 3: FOTOS & STOCK ── */}
                    {currentStep === 3 && (
                      <motion.div key="tab3" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="p-7 space-y-6">
                        {/* Images */}
                        <div>
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Imágenes del producto</h4>
                          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                            <Upload className="h-5 w-5 text-slate-300 mb-1" />
                            <span className="text-[11px] font-bold text-slate-400">Haz clic para subir imágenes</span>
                            <span className="text-[10px] text-slate-300 mt-0.5">PNG, JPG, WEBP</span>
                            <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                          </label>

                          <div className="flex gap-2 mt-3">
                            <input type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addUrlManual()} placeholder="O pega una URL de imagen externa..." className={cn(configUi.fieldInput, "flex-1 text-xs")} />
                            <button type="button" onClick={addUrlManual} className="px-4 bg-[#16315f] text-white rounded-xl hover:bg-[#0d2248] transition-colors text-sm font-bold">+</button>
                          </div>

                          {(imagenesGuardadas.length > 0 || imagenesArchivos.length > 0 || imagenesUrls.length > 0) && (
                            <div className="flex flex-wrap gap-2 mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                              {imagenesGuardadas.map((img) => (
                                <div key={\`db-\${img.id_imagen}\`} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                                  <img src={img.url_imagen?.startsWith('http') ? img.url_imagen : \`\${API_URL}\${img.url_imagen}\`} alt="" className={\`w-full h-full object-cover \${!imagenesConservadas?.includes(img.id_imagen) ? 'opacity-25' : ''}\`} />
                                  <button type="button" onClick={() => toggleConservarImagen(img.id_imagen)} className={\`absolute inset-0 flex items-center justify-center bg-black/40 text-white transition-opacity \${!imagenesConservadas?.includes(img.id_imagen) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}\`}>
                                    {!imagenesConservadas?.includes(img.id_imagen) ? <CheckCircle size={16} /> : <Trash2 size={16} />}
                                  </button>
                                </div>
                              ))}
                              {imagenesArchivos.map((file, idx) => (
                                <div key={\`file-\${idx}\`} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                  <button type="button" onClick={() => removeArchivo(idx)} className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100"><X size={16} /></button>
                                </div>
                              ))}
                              {imagenesUrls.map((url, idx) => (
                                <div key={\`url-\${idx}\`} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                                  <img src={url} alt="" className="w-full h-full object-cover" />
                                  <button type="button" onClick={() => removeUrlManual(idx)} className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100"><X size={16} /></button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Variants */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Color y Tallas (Stock)</h4>
                            <button type="button" onClick={saveVariant} className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-[#16315f] text-white rounded-lg hover:bg-[#0d2248] transition-all">
                              + Agregar variante
                            </button>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                            <div className={configUi.fieldGroup}>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Color</label>
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <select value={currentVariant.color} onChange={(e) => handleVariantChange('color', e.target.value)} className={cn(configUi.fieldSelect, "bg-white")}>
                                    <option value="">Seleccionar color...</option>
                                    {colores.map(c => <option key={c.id_color} value={c.nombre_color}>{c.nombre_color}</option>)}
                                  </select>
                                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                                </div>
                                <button type="button" onClick={() => setIsCreateColorOpen(true)} title="Nuevo color" className="px-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#16315f] hover:border-[#16315f] transition-all text-xs font-bold">+ Color</button>
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tallas y cantidad</label>
                                <button type="button" onClick={() => setIsCreateTallaOpen(true)} className="text-[10px] font-black text-slate-400 hover:text-[#16315f] uppercase tracking-widest">+ Talla</button>
                              </div>
                              <div className="space-y-2">
                                {currentVariant.tallas.map((t, idx) => (
                                  <div key={idx} className="flex gap-2 items-center">
                                    <div className="relative flex-1">
                                      <select value={t.talla} onChange={(e) => handleTallaChange(idx, 'talla', e.target.value)} className={cn(configUi.fieldSelect, "bg-white")}>
                                        <option value="">Talla...</option>
                                        {tallas.map(tl => <option key={tl.id_talla} value={tl.nombre_talla}>{tl.nombre_talla}</option>)}
                                      </select>
                                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                                    </div>
                                    <input type="number" value={t.cantidad} onChange={(e) => handleTallaChange(idx, 'cantidad', e.target.value)} placeholder="Und." className={cn(configUi.fieldInput, "w-24 bg-white font-bold text-center")} />
                                    {idx === currentVariant.tallas.length - 1 ? (
                                      <button type="button" onClick={addTalla} className="w-10 h-10 bg-white border border-slate-200 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0"><Plus size={14} /></button>
                                    ) : (
                                      <button type="button" onClick={() => removeTalla(idx)} className="w-10 h-10 bg-rose-50 text-rose-400 rounded-xl flex items-center justify-center hover:bg-rose-100 transition-colors shrink-0"><Trash2 size={14} /></button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {variantError && <p className="text-rose-500 text-xs font-bold mt-2">{variantError}</p>}

                          {variants.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Variantes agregadas</p>
                              {variants.map((v, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                                  <div>
                                    <span className="text-xs font-black text-[#16315f]">{v.color || "—"}</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {v.tallas.map((t, ti) => (
                                        <span key={ti} className="text-[9px] font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">{t.talla}: {t.cantidad} und.</span>
                                      ))}
                                    </div>
                                  </div>
                                  <button type="button" onClick={() => removeVariant(v)} className="w-8 h-8 flex items-center justify-center text-rose-300 hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-colors shrink-0"><X size={13} /></button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Modal Footer */}
                <div className="px-7 py-5 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
                  <div className="flex gap-1">
                    {[1, 2, 3].map(step => (
                      <button
                        key={step}
                        type="button"
                        onClick={() => setCurrentStep(step)}
                        className={cn("w-7 h-1.5 rounded-full transition-all", currentStep === step ? "bg-[#16315f]" : "bg-slate-200 hover:bg-slate-300")}
                      />
                    ))}
                  </div>
                  <div className="flex gap-3 items-center">
                    <button type="button" onClick={() => setIsProductModalOpen(false)} className="text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors px-3">
                      Cancelar
                    </button>
                    {currentStep > 1 && (
                      <button type="button" onClick={() => setCurrentStep(s => s - 1)} className={configUi.secondaryButton}>
                        ← Atrás
                      </button>
                    )}
                    {currentStep < 3 ? (
                      <button type="button" onClick={() => setCurrentStep(s => s + 1)} className={configUi.primaryButton}>
                        Siguiente →
                      </button>
                    ) : (
                      <button type="button" onClick={saveProduct} className={configUi.primaryButton}>
                        <CheckCircle size={16} />
                        <span>{productForm.id_producto ? "Guardar Cambios" : "Crear Producto"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

`;

// Locate the exact slice: from modal start to the line just before === Modal de Vista ===
const vistaMarker = '{/* === Modal de Vista === */}';
const vistaIdx = content.indexOf(vistaMarker);

if (vistaIdx === -1) {
  console.error('Cannot find Vista modal marker');
  process.exit(1);
}

// Find the beginning of the AnimatePresence block that contains the Vista modal
// Walk backwards from vistaIdx to find "        <AnimatePresence>"
let viewModalStart = content.lastIndexOf('\r\n        <AnimatePresence>', vistaIdx);
if (viewModalStart === -1) {
  viewModalStart = content.lastIndexOf('\n        <AnimatePresence>', vistaIdx);
  if (viewModalStart === -1) {
    console.error('Cannot find AnimatePresence before Vista modal');
    process.exit(1);
  }
  viewModalStart += 1; // skip \n
} else {
  viewModalStart += 2; // skip \r\n
}

console.log('Product modal start:', startIdx);
console.log('View modal AnimatePresence start:', viewModalStart);

const before = content.substring(0, startIdx);
const after = content.substring(viewModalStart);

const result = before + newModal + after;
fs.writeFileSync(path, result, 'utf8');
console.log('Done! Successfully rewrote product creation modal.');
