import { Eye, Pencil, Trash2 } from "lucide-react";

export const Table = ({ usuarios, setUsuarios, setUsuarioSeleccionado, setModalOpen }) => {
  return (
    <div className="px-[30px]">
      {/* Header tabla */}
      <div className="sticky top-[120px] z-50">
        <article className="font-semibold italic mt-[120px] flex items-center border-b border-black/20 pb-[20px]">
          <p className="w-[20%]">Nombre</p>
          <p className="w-[30%]">Correo electonico</p>
          <p className="w-[15%]">Telefono</p>
          <p className="w-[20%]">Nivel</p>
          <p className="w-[15%]">Acciones</p>
        </article>
      </div>

      {usuarios.map((element) => {
        const colores = [
          { fondo: "bg-red-100", texto: "text-red-700" },
          { fondo: "bg-green-100", texto: "text-green-700" },
          { fondo: "bg-blue-100", texto: "text-blue-700" },
          { fondo: "bg-yellow-100", texto: "text-yellow-700" },
          { fondo: "bg-purple-100", texto: "text-purple-700" },
          { fondo: "bg-pink-100", texto: "text-pink-700" },
          { fondo: "bg-indigo-100", texto: "text-indigo-700" },
          { fondo: "bg-teal-100", texto: "text-teal-700" },
          { fondo: "bg-orange-100", texto: "text-orange-700" },
        ];
        const color = colores[(element.id || 0) % colores.length];
        const inicial = element.name?.charAt(0).toUpperCase() || "?";

        return (
          <article key={element.id} className="py-[30px] border-b border-black/20 flex items-center">
            {/* Avatar */}
            <div className="w-[20%] flex gap-[15px] items-center">
              <span
                className={`w-[55px] h-[55px] ${color.fondo} ${color.texto} rounded-full flex justify-center items-center text-[2rem]`}
              >
                <h5 className="font-primary">{inicial}</h5>
              </span>
              <div className="flex flex-col">
                <p className="font-bold text-black/80 italic">{element.name}</p>
                <p>{element.lastName}</p>
              </div>
            </div>

            <p className="w-[30%] underline italic">{element.email}</p>
            <p className="w-[15%]">{element.phone}</p>

            {/* Nivel */}
            <div className="w-[20%]">
              <p
                className={`inline-flex items-center gap-[5px] px-[15px] py-[7px] rounded-full ${
                  element.nivel === "Principiante"
                    ? "text-green-700 bg-green-100"
                    : element.nivel === "Intermedio"
                    ? "text-yellow-700 bg-yellow-100"
                    : element.nivel === "Avanzado"
                    ? "text-blue-700 bg-blue-100"
                    : element.nivel === "Profesional"
                    ? "text-purple-700 bg-purple-100"
                    : "text-gray-700 bg-gray-200"
                }`}
              >
                <span className="w-[10px] h-[10px] block bg-[currentColor] rounded-full"></span>
                {element.nivel}
              </p>
            </div>

            {/* Acciones */}
            <div className="w-[15%] flex gap-[10px] items-center">
              <span
                className="w-[45px] h-[45px] bg-green-100 text-green-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-green-200 shadow-md hover:scale-125 transition-transform"
                style={{ transitionDuration: "450ms", transitionTimingFunction: "cubic-bezier(0.3, 1.8, 0.4, 1)" }}
                onClick={() => {
                  setUsuarioSeleccionado(element);
                  setModalOpen(true);
                }}
              >
                <Eye size={22} strokeWidth={1.3} />
              </span>

              <span
                className="w-[45px] h-[45px] bg-blue-100 text-blue-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-blue-200 shadow-md hover:scale-125 transition-transform"
                style={{ transitionDuration: "450ms", transitionTimingFunction: "cubic-bezier(0.3, 1.8, 0.4, 1)" }}
              >
                <Pencil size={22} strokeWidth={1.3} />
              </span>

              <span
                className="w-[45px] h-[45px] bg-red-100 text-red-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-red-200 shadow-md hover:scale-125 transition-transform"
                style={{ transitionDuration: "450ms", transitionTimingFunction: "cubic-bezier(0.3, 1.8, 0.4, 1)" }}
                onClick={() => {
                  if (window.confirm(`¿Eliminar a ${element.name} ${element.lastName}?`)) {
                    setUsuarios((prev) => prev.filter((u) => u.id !== element.id));
                  }
                }}
              >
                <Trash2 size={22} strokeWidth={1.3} />
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
};
