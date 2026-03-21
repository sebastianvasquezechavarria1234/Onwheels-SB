const fs = require('fs');

const path = "c:\\Users\\hp\\Documents\\Onwheels-SB\\src\\feactures\\dashboards\\admin\\pages\\compras\\productos\\Products.jsx";
let content = fs.readFileSync(path, 'utf8');

// Replace the massive modal block
const modalStart = content.indexOf('{isProductModalOpen && (');
const modalEnd = content.indexOf('{/* === Modal de Vista === */}');

if (modalStart !== -1 && modalEnd !== -1) {
    // Find the nearest </AnimatePresence> before "Modal de Vista"
    let endCutIndex = content.lastIndexOf('</AnimatePresence>', modalEnd);

    if (endCutIndex !== -1) {
      const newModal = `{isProductModalOpen && (
            <motion.div
              className={configUi.modalBackdrop}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
            >
              <motion.div
                className={cn(configUi.modalPanel, "max-w-5xl h-[90vh] flex flex-col !p-0 overflow-hidden")}
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-8 border-b bg-slate-50 flex justify-between items-center shrink-0">
                  <div>
                    <h3 className="text-2xl font-black text-[#16315f] tracking-tight font-[Outfit]">
                      {productForm.id_producto ? "Actualizar Producto" : "Nuevo Producto"}
                    </h3>
                  </div>
                  <button onClick={() => setIsProductModalOpen(false)} className={configUi.modalClose}>
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    
                    {/* COL 1: Basic Info & Prices */}
                    <div className="space-y-8">
                      <section className="space-y-6">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3">
                          <Tag size={16} className="text-indigo-500" /> Información Básica
                        </h4>
                        <div className="space-y-4">
                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Nombre Comercial *</label>
                            <input autoFocus name="nombre_producto" value={productForm.nombre_producto} onChange={handleProductChange} onBlur={handleProductBlur} className={cn(configUi.fieldInput, formErrors.nombre_producto && "border-rose-400 bg-rose-50")} />
                            {formErrors.nombre_producto && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1">{formErrors.nombre_producto}</p>}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className={configUi.fieldGroup}>
                              <label className={configUi.fieldLabel}>Categoría *</label>
                              <div className="relative">
                                <select name="id_categoria" value={productForm.id_categoria ?? ""} onChange={handleProductChange} onBlur={handleProductBlur} className={cn(configUi.fieldSelect, formErrors.id_categoria && "border-rose-400 bg-rose-50")}>
                                  <option value="">Seleccionar...</option>
                                  {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                              </div>
                              {formErrors.id_categoria && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1">{formErrors.id_categoria}</p>}
                            </div>
                            <div className={configUi.fieldGroup}>
                              <label className={configUi.fieldLabel}>Estado</label>
                              <div className="relative">
                                <select name="estado" value={productForm.estado} onChange={handleProductChange} className={configUi.fieldSelect}>
                                  <option value="activo">Activo (Visible)</option>
                                  <option value="inactivo">Inactivo</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                              </div>
                            </div>
                          </div>

                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Descripción Técnica *</label>
                            <textarea name="descripcion" value={productForm.descripcion} onChange={handleProductChange} onBlur={handleProductBlur} rows={3} className={cn(configUi.fieldInput, "pt-3", formErrors.descripcion && "border-rose-400 bg-rose-50")} />
                            {formErrors.descripcion && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1">{formErrors.descripcion}</p>}
                          </div>
                        </div>
                      </section>

                      <section className="space-y-6">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3">
                          <TrendingUp size={16} className="text-emerald-500" /> Precios de Operación
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Inversión (Compra) *</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                              <input type="number" name="precio_compra" value={productForm.precio_compra} onChange={handleProductChange} onBlur={handleProductBlur} className={cn(configUi.fieldInput, "pl-8 text-[#16315f] font-black", formErrors.precio_compra && "border-rose-400 bg-rose-50")} />
                            </div>
                            {formErrors.precio_compra && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1">{formErrors.precio_compra}</p>}
                          </div>
                          
                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Precio Sugerido Venta *</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 font-bold">$</span>
                              <input type="number" name="precio" value={productForm.precio} onChange={handleProductChange} onBlur={handleProductBlur} className={cn(configUi.fieldInput, "pl-8 text-indigo-700 font-black bg-indigo-50 border-indigo-200 focus:border-indigo-400", formErrors.precio && "border-rose-400 bg-rose-50")} />
                            </div>
                            {formErrors.precio && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1">{formErrors.precio}</p>}
                          </div>

                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Descuento Promocional (%)</label>
                            <div className="relative">
                              <input type="number" name="descuento_producto" value={productForm.descuento_producto} onChange={handleProductChange} className={cn(configUi.fieldInput, "pr-8 text-rose-500 font-bold bg-rose-50 border-rose-200", formErrors.descuento_producto && "border-rose-400 bg-rose-50")} />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-400 font-bold">%</span>
                            </div>
                            {formErrors.descuento_producto && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1">{formErrors.descuento_producto}</p>}
                          </div>
                          
                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Margen de Utilidad (%)</label>
                            <div className="relative">
                              <input type="number" name="porcentaje_ganancia" value={productForm.porcentaje_ganancia} onChange={handleProductChange} className={cn(configUi.fieldInput, "pr-8 text-emerald-600 font-bold bg-emerald-50 border-emerald-200")} />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">%</span>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>

                    {/* COL 2: Media & Variants */}
                    <div className="space-y-8">
                      <section className="space-y-6">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3">
                          <ImageIcon size={16} className="text-indigo-500" /> Imágenes
                        </h4>
                        
                        <div className="flex flex-col gap-4">
                          <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                            <Upload className="h-4 w-4 text-slate-400 mb-1" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subir Archivos</span>
                            <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                          </label>

                          <div className="flex gap-2">
                            <input type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="Enlace de imagen externa..." className={cn(configUi.fieldInput, "flex-1 text-xs")} />
                            <button type="button" onClick={addUrlManual} className="px-4 bg-[#16315f] text-white rounded-xl hover:bg-[#0da081] transition-colors"><Plus size={16} /></button>
                          </div>

                          {(imagenesGuardadas.length > 0 || imagenesArchivos.length > 0 || imagenesUrls.length > 0) && (
                            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                              {imagenesGuardadas.map((img) => (
                                <div key={\`db-\${img.id_imagen}\`} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-white">
                                  <img src={img.url_imagen?.startsWith('http') ? img.url_imagen : \`\${API_URL}\${img.url_imagen}\`} className={\`w-full h-full object-cover \${!imagenesConservadas?.includes(img.id_imagen) ? 'opacity-30' : ''}\`} />
                                  <button type="button" onClick={() => toggleConservarImagen(img.id_imagen)} className={\`absolute inset-0 flex items-center justify-center bg-black/40 text-white \${!imagenesConservadas?.includes(img.id_imagen) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}\`}>
                                     {!imagenesConservadas?.includes(img.id_imagen) ? <CheckCircle size={14} /> : <Trash2 size={14} />}
                                  </button>
                                </div>
                              ))}
                              {imagenesArchivos.map((file, idx) => (
                                <div key={\`file-\${idx}\`} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-white">
                                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                  <button type="button" onClick={() => removeArchivo(idx)} className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100"><X size={14} /></button>
                                </div>
                              ))}
                              {imagenesUrls.map((url, idx) => (
                                <div key={\`url-\${idx}\`} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-white">
                                  <img src={url} className="w-full h-full object-cover" />
                                  <button type="button" onClick={() => removeUrlManual(idx)} className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100"><X size={14} /></button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </section>

                      <section className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Package size={16} className="text-indigo-500" /> Variantes y Stock
                          </h4>
                          <button type="button" onClick={saveVariant} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-slate-900 text-white rounded-lg shadow-sm hover:scale-105 transition-all">
                            Adicionar
                          </button>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                          <div className="flex gap-4">
                            <div className="flex-1 space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Color</label>
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <select value={currentVariant.color} onChange={(e) => handleVariantChange('color', e.target.value)} className={cn(configUi.fieldSelect, "bg-white")}>
                                    <option value="">Seleccionar...</option>
                                    {colores.map(c => <option key={c.id_color} value={c.nombre_color}>{c.nombre_color}</option>)}
                                  </select>
                                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                </div>
                                <button type="button" onClick={() => setIsCreateColorOpen(true)} className="px-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"><Plus size={16} /></button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tallas y Cantidades (Stock)</label>
                            {currentVariant.tallas.map((t, idx) => (
                              <div key={idx} className="flex gap-2">
                                <div className="relative flex-1">
                                  <select value={t.talla} onChange={(e) => handleTallaChange(idx, 'talla', e.target.value)} className={cn(configUi.fieldSelect, "bg-white")}>
                                    <option value="">Talla...</option>
                                    {tallas.map(tl => <option key={tl.id_talla} value={tl.nombre_talla}>{tl.nombre_talla}</option>)}
                                  </select>
                                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                </div>
                                <input type="number" value={t.cantidad} onChange={(e) => handleTallaChange(idx, 'cantidad', e.target.value)} placeholder="Und." className={cn(configUi.fieldInput, "w-24 bg-white font-black text-center")} />
                                {idx === currentVariant.tallas.length - 1 ? (
                                  <button type="button" onClick={addTalla} className="w-12 bg-white border border-slate-200 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors"><Plus size={16} /></button>
                                ) : (
                                  <button type="button" onClick={() => removeTalla(idx)} className="w-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-100 transition-colors"><Trash2 size={16} /></button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {variantError && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest ml-1">{variantError}</p>}

                        {variants.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mt-4">
                            {variants.map((v, idx) => (
                              <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center shadow-sm">
                                <div>
                                  <span className="text-[10px] font-black uppercase text-[#16315f]">{v.color || "—"}</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {v.tallas.map((t, ti) => (
                                      <span key={ti} className="text-[9px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">{t.talla}: {t.cantidad}</span>
                                    ))}
                                  </div>
                                </div>
                                <button type="button" onClick={() => removeVariant(v)} className="w-8 h-8 flex items-center justify-center text-rose-300 hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-colors"><X size={14} /></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </section>
                    </div>

                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                  <button onClick={() => setIsProductModalOpen(false)} className={configUi.secondaryButton}>
                    Cancelar
                  </button>
                  <button onClick={saveProduct} className={configUi.primaryButton}>
                    <CheckCircle size={18} />
                    <span>{productForm.id_producto ? "Guardar Cambios" : "Crear Producto"}</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

`;

      content = content.slice(0, modalStart) + newModal + content.slice(endCutIndex + '</AnimatePresence>'.length);
      fs.writeFileSync(path, content, 'utf8');
      console.log("Products modal rewritten successfully");
    } else {
      console.log("Could not find </AnimatePresence> ending");
    }
} else {
    console.log("Could not find the modal block correctly");
}
