// src/features/instructor/components/StudentDeleteModal.jsx
import React from "react";
import { motion } from "framer-motion";

export const ModalDelete = ({ isOpen, onClose, student, onConfirm }) => {
  if (!isOpen || !student) return null;

  return (
    <motion.div
      className="modal fixed top-0 inset-0 w-full h-full z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Fondo blur clickeable */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Contenido */}
      <motion.div
        className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[450px] shadow-xl text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
      >
        <h3 className="font-primary text-xl mb-[20px]">
          Delete student
        </h3>
        <p className="text-gray-600 mb-[30px]">
          Are you sure you want to delete{" "}
          <span className="font-bold">{student.name} {student.lastName}</span>?
        </p>

        <div className="flex justify-center gap-4">
          <button
            className="px-5 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
            onClick={() => {
              onConfirm(student.id);
              onClose();
            }}
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
