import { motion } from "framer-motion";

export const ModalDetails = ({ usuarioSeleccionado, setUsuarioSeleccionado, setModalOpen }) => {
  if (!usuarioSeleccionado) return null;

  return (
    <motion.div
      className="modal fixed top-0 inset-0 w-full h-full z-50 flex items-center justify-center bg-black/40 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Fondo clickeable */}
      <div
        className="absolute inset-0"
        onClick={() => {
          setModalOpen(false);
          setUsuarioSeleccionado(null);
        }}
      />
      {/* Contenido modal */}
      <motion.div
        className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[600px] shadow-xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <h3 className="font-primary text-center mb-[40px]">Detalles del estudiante</h3>
        <div className="grid grid-cols-2">
          <div className="flex flex-col gap-[20px]">
            <p>Nombre:</p>
            <p>Correo:</p>
            <p>Teléfono:</p>
            <p>Nivel:</p>
            <p>Edad:</p>
          </div>
          <div className="flex flex-col gap-[20px]">
            <p>{usuarioSeleccionado.name} {usuarioSeleccionado.lastName}</p>
            <p>{usuarioSeleccionado.email}</p>
            <p>{usuarioSeleccionado.phone}</p>
            <p>{usuarioSeleccionado.nivel}</p>
            <p>23</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-[30px]">
          <button
            className="font-primary cursor-pointer p-[18px_20px_18px_20px] bg-red-100 text-red-600 rounded-full w-[200px]"
            onClick={() => {
              setModalOpen(false);
              setUsuarioSeleccionado(null);
            }}
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
