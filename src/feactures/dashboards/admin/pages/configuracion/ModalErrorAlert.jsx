import React from "react";
import { AlertCircle } from "lucide-react";
import { configUi } from "./configUi";

export default function ModalErrorAlert({ error }) {
  if (!error) return null;

  return (
    <div className={configUi.modalErrorBox}>
      <AlertCircle className="shrink-0 text-[#d44966]" size={20} />
      <div>
        <p className={configUi.modalErrorTitle}>Motivo de Bloqueo</p>
        <p className={configUi.modalErrorText}>{error}</p>
      </div>
    </div>
  );
}
