import { Star } from "lucide-react";

export const Coment = () => {

  const reseñas = [
    {
      id: 1,
      nombre: "Emanuel Gonzalez",
      foto: "https://i.pravatar.cc/100?img=1",
      reseña: "Excelente servicio, súper recomendado.",
      estrellas: 5,
    },
    {
      id: 2,
      nombre: "Laura Zapata",
      foto: "https://i.pravatar.cc/100?img=2",
      reseña: "Muy buena experiencia, los productos son de muy buena calidad. Volvería otra vez.",
      estrellas: 5,
    },
    {
      id: 3,
      nombre: "Carlos Vasquez",
      foto: "https://i.pravatar.cc/100?img=3",
      reseña: "Muy buena experiencia, una pagina super facil y util.",
      estrellas: 5,
    },
    {
      id: 4,
      nombre: "Ana Martinez",
      foto: "https://i.pravatar.cc/100?img=4",
      reseña: "Me encantó, atención 10/10.",
      estrellas: 5,
    },   
 
  ];

  return (
    <section className="flex gap-10 p-10 justify-center items-center w-full h-[500px]">
      
      {reseñas.map((item) => (
        <div
          key={item.id}
          className="relative flex flex-col items-center justify-center w-[300px] h-[300px] rounded-2xl border border-gray-300 shadow-md p-6"
        >
          
          {/* Foto */}
          <img
            src={item.foto}
            alt={item.nombre}
            className="absolute -top-10 w-20 h-20 rounded-full border-4 border-white shadow-md"
          />

          {/* Nombre */}
          <h3 className="mt-12 font-semibold text-lg">
            {item.nombre}
          </h3>

          {/* Reseña */}
          <p className="text-center text-sm text-gray-600 mt-2">
            {item.reseña}
          </p>

          {/* Estrellas */}
          <div className="flex gap-1 mt-3">
            {[...Array(item.estrellas)].map((_, index) => (
              <Star key={index} size={18} className="text-yellow-400 fill-yellow-400" />
            ))}
          </div>
        </div>
      ))}

    </section>
  );
};
