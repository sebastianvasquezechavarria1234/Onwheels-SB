"use client"

import { useState, useEffect, useRef } from "react"
import { StudentLayout } from "../layout/StudentLayout"
import CardProduct from "../../components/CardProduct"
import { BtnLinkIcon } from "../../components/BtnLinkIcon"
import { Check } from "lucide-react"

export const StudentCheckout = () => {
  const [form, setForm] = useState({
    nombre_completo: "",
    telefono: "",
    telefono_secundario: "",
    email: "",
    documento_identidad: "",
    numero_cc: "",
    direccion: "Carrera 7 #45-26, Medellín, Colombia",
    tipo_documento: "Cédula de Ciudadanía",
    tipo_cuenta: "Ahorros",
    numero_cuenta: "",
    instrucciones_entrega: "",
  })

  const [coords, setCoords] = useState({ lat: 6.2442, lng: -75.5812 }) // Coordenadas de Medellín por defecto
  const [addressError, setAddressError] = useState("")
  const [validAddress, setValidAddress] = useState(false)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    const geocodeAddress = async () => {
      if (!form.direccion.trim()) {
        setValidAddress(false)
        return
      }

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.direccion + ", Medellín")}&format=json&limit=1`,
          { headers: { Accept: "application/json" } },
        )

        const data = await response.json()

        if (data && data.length > 0) {
          const lat = Number.parseFloat(data[0].lat)
          const lng = Number.parseFloat(data[0].lon)

          if (lat >= 5.95 && lat <= 6.45 && lng >= -75.8 && lng <= -75.1) {
            setCoords({ lat, lng })
            setAddressError("")
            setValidAddress(true)
          } else {
            setAddressError("La dirección debe estar en Medellín, Colombia")
            setValidAddress(false)
          }
        } else {
          setAddressError("Dirección no encontrada en Medellín, Colombia")
          setValidAddress(false)
        }
      } catch (error) {
        console.error("Error geocodificando dirección:", error)
        setAddressError("Error al buscar la dirección")
        setValidAddress(false)
      }
    }

    const timer = setTimeout(() => {
      geocodeAddress()
    }, 800)

    return () => clearTimeout(timer)
  }, [form.direccion])

  useEffect(() => {
    if (!mapRef.current || !validAddress) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
    }

    const script = document.createElement("script")
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"

    const link = document.createElement("link")
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    link.rel = "stylesheet"
    document.head.appendChild(link)

    script.onload = () => {
      const L = window.L

      const map = L.map(mapRef.current).setView([coords.lat, coords.lng], 15)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map)

      L.marker([coords.lat, coords.lng]).addTo(map).bindPopup(`<b>${form.direccion}</b>`).openPopup()

      mapInstanceRef.current = map
    }

    document.head.appendChild(script)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [coords, validAddress])

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <StudentLayout>
      <section className="pt-[120px] max-w-[1500px] mx-auto p-[20px] flex gap-[30px] max-lg:flex-col max-md:p-[10px] max-md:pt-[80px]">
        <div className="w-[75%] max-lg:w-full">
          <h2 className="mb-[20px] max-md:mb-[20px]">Información de envío y pago</h2>

          <article className="p-[30px] border-1 border-black/20 rounded-[30px] max-md:p-[10px] max-md:rounded-[20px]">
            {/* Información Personal */}
            <div className="mb-[30px] max-md:mb-[20px]">
              <h3 className="text-lg font-bold mb-[20px] flex items-center gap-2">Información Personal</h3>
              <div className="grid grid-cols-2 gap-[10px] max-md:grid-cols-1">


                <label className="block col-span-1">
                  <p>Teléfono secundario</p>
                  <input
                    type="tel"
                    value={form.telefono_secundario}
                    onChange={(e) => handleInputChange("telefono_secundario", e.target.value)}
                    className="input w-full"
                    placeholder="+57 310 987 6543"
                  />
                </label>

                <label className="block col-span-1">
                  <p>Dirección completa en Medellín</p>
                  <input
                    type="text"
                    value={form.direccion}
                    onChange={(e) => handleInputChange("direccion", e.target.value)}
                    className="input w-full"
                    placeholder="Calle 123 #45-67, Medellín, Antioquia"
                    required
                  />
                </label>



              </div>
            </div>



            {/* Método de Pago */}
            <div className="mb-[30px] max-md:mb-[20px]">
              <h3 className="text-lg font-bold mb-[20px] flex items-center gap-2">Método de Pago - Bancolombia</h3>
              <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                <div className="flex flex-col">
                  <label className="block col-span-1">
                    <p>Tipo de documento</p>
                    <select
                      value={form.tipo_documento}
                      onChange={(e) => handleInputChange("tipo_documento", e.target.value)}
                      className="input w-full"
                    >
                      <option>Cédula de Ciudadanía</option>
                      <option>Tarjeta de Identidad</option>
                      <option>Pasaporte</option>
                    </select>
                  </label>
                </div>
                <div className="flex flex-col">
                  <label className="block col-span-1">
                    <p>Número de documento</p>
                    <input
                      type="text"
                      value={form.documento_identidad}
                      onChange={(e) => handleInputChange("documento_identidad", e.target.value)}
                      className="input w-full"
                      placeholder="Número de documento"
                      required
                    />
                  </label>
                </div>
                <div className="flex flex-col">
                  <label className="block col-span-1">
                    <p>Tipo de cuenta</p>
                    <select
                      value={form.tipo_cuenta}
                      onChange={(e) => handleInputChange("tipo_cuenta", e.target.value)}
                      className="input w-full"
                    >
                      <option>Ahorros</option>
                      <option>Corriente</option>
                    </select>
                  </label>
                </div>
                <div className="flex flex-col">
                  <label className="block col-span-1">
                    <p>Número de cuenta</p>
                    <input
                      type="text"
                      value={form.numero_cuenta}
                      onChange={(e) => handleInputChange("numero_cuenta", e.target.value)}
                      className="input w-full"
                      placeholder="Número de cuenta Bancolombia"
                      required
                    />
                  </label>
                </div>
              </div>

              <div className="mt-4 p-[20px] bg-blue-50 border border-blue-200 rounded-[20px]">
                <h4 className="font-bold text-blue-900 mb-2">⚠️ Requisitos Bancolombia</h4>
                <p className="text-sm text-blue-800">
                  Los datos bancarios deben coincidir exactamente con la información registrada en tu cuenta Bancolombia
                  para evitar rechazos en el pago.
                </p>
              </div>
            </div>

            <BtnLinkIcon title="Comfirmar compra" link="../student/orderConfirm" style="bg-[var(--color-blue)]! text-white!" styleIcon="bg-white!">
              <Check color="black" strokeWidth={1.8} size={18} />
            </BtnLinkIcon>
          </article>
        </div>

        <div className="w-[25%] mt-[115px] border-1 rounded-[30px] border-black/20 p-[30px] max-lg:w-full max-md:p-[10px] max-lg:pl-0 max-lg:mt-[0px] max-md:rounded-[20px]">
          <div className="top-[200px] max-lg:top-[0px]">
            <h3 className="text-lg font-bold mb-4">Resumen del pedido</h3>

            <div className="mb-6">
              <div className="flex justify-between mb-[10px]">
                <p className="font-bold">Camisa</p>
                <p>$1.200.000</p>
              </div>
              <div className="flex justify-between mb-[10px]">
                <p>camisa</p>
                <p>$15.000</p>
              </div>
              <div className="flex justify-between border-t border-black/20 pt-3">
                <p className="font-bold">Total</p>
                <p className="font-bold">$1.215.000</p>
              </div>
            </div>

            <div className="mt-[60px]">
              <label className="block mb-[20px]">
                <p className="mb-[10px]">Instrucciones de entrega:</p>
                <textarea
                  value={form.instrucciones_entrega}
                  onChange={(e) => handleInputChange("instrucciones_entrega", e.target.value)}
                  className="input w-full"
                  rows={3}
                  placeholder="Indicaciones especiales para el repartidor..."
                ></textarea>
              </label>
            </div>
          </div>
        </div>
      </section>
    </StudentLayout>
  )
}
