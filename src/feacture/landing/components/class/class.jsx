import React from "react"
const scheduleData = [
  {
    day: "Lunes",
    time: "9:00 AM - 11:00 AM",
    level: "Principiante",
    instructor: "Profesor: Daniel",
    limit: "Límite: 15",
  },
  {
    day: "Martes",
    time: "2:00 PM - 4:00 PM",
    level: "Intermedio",
    instructor: "Profesor: Hernan",
    limit: "Límite: 12",
  },
  {
    day: "Miércoles",
    time: "10:00 AM - 12:00 PM",
    level: "Principiante",
    instructor: "Profesor: Daniel",
    limit: "Límite: 15",
  },
  {
    day: "Jueves",
    time: "3:00 PM - 5:00 PM",
    level: "Avanzado",
    instructor: "Profesor: Sebas",
    limit: "Límite: 8",
  },
  {
    day: "Viernes",
    time: "4:00 PM - 6:00 PM",
    level: "Intermedio",
    instructor: "Profesor: Daniel",
    limit: "Límite: 12",
  },
  {
    day: "Sábado",
    time: "9:00 AM - 12:00 PM",
    level: "Todos los niveles",
    instructor: "Profesor: Hernan",
    limit: "Límite: 20",
  },
]

const pricingPlans = [
  {
    name: "Plan Popular",
    price: "$ 80.000",
    description: "Al mes\nMás de 150 estudiante eligieron este plan.",
  },
  {
    name: "Plan Pro",
    price: "$ 150.000",
    description: "Al mes\nMás de 100 estudiante eligieron este plan.",
  },
  {
    name: "Plan Premium",
    price: "$ 190.000",
    description: "Al mes\nMás de 80 estudiante eligieron este plan.",
  },
]

export const Class = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white">
      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <h1 className="text-4xl lg:text-5xl font-bold text-black leading-tight">
              Domina la Tabla: Clases de Skate que Rompen Límites
            </h1>
          </div>
          <div className="lg:w-1/2">
            <div className="w-full max-w-md mx-auto bg-gradient-to-br  from-gray-100  to-blue-950 rounded-2xl p-8 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-4"></div>
                <img src="https://www.madramps.eu/wp-content/uploads/go-x/u/a9e9dd96-5c5c-4e16-8f73-1c4a3adb8d8e/l0,t0,w1500,h2000/image-768x1024.jpg" alt="" className="rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-center text-black mb-12">Clases</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {scheduleData.map((item) => (
            <div key={item.day} className="p-6 hover:shadow-black transition-shadow rounded-lg bg-gray-200">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-black">{item.day}</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    
                    <span className="font-medium text-xl">{item.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                  
                    <span className="text-xl">{item.level}</span>
                  </div>
                  <div className="flex items-center gap-2">
                   
                    <span className="text-xl">{item.instructor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    
                    <span className="text-xl">{item.limit}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-center text-black mb-12">Planes</h1>

        <div className="grid grid-cols-6 md:grid-cols-3 gap-12 max-w-5/6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div
              key={plan.name}
              className={`p-8 text-center ${index === 1 ? "bg-gray-50" : "bg-white"} border border-gray-200 rounded-lg shadow`}
            >
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-black">{plan.name}</h2>
                <div className="text-3xl font-bold text-black">{plan.price}</div>
                <div className="text-gray-600 whitespace-pre-line text-xl">{plan.description}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-30">
          <button  className="bg-gradient-to-r from-red-400 to-red-500 hover:from-purple-600 hover:to-blue-500 text-white px-8 py-3 rounded-full text-3xl font-medium ">
            Preinscribirme
          </button>
        </div>
      </div>
    </div>
  )
}
export default Class