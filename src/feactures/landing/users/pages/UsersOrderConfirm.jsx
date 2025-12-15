import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BtnLinkIcon } from "../../components/BtnLinkIcon";
import { CreditCard, DownloadCloud, Copy } from "lucide-react";
import confettiLib from "canvas-confetti";
import { UsersLayout } from "../layout/UsersLayout";

export const UsersOrderConfirm = () => {
  const { orderId: paramOrderId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const seguirBtnRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  const orderId = paramOrderId || "OW-2025-001234";
  const invoiceUrl = `/invoices/${orderId}.pdf`;
  const order = {
    id: orderId,
    name: "Sebastián Vásquez",
    email: "sebasvasquez@example.com",
    items: [
      { title: "Camiseta Oficial", qty: 1, price: 30000 },
      { title: "Gorra", qty: 2, price: 15000 },
    ],
    subtotal: 60000,
    taxes: 0,
    total: 60000,
    status: "Pago recibido — Procesando pedido",
    etaText: "3–5 días hábiles",
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("No se pudo copiar el ID", err);
    }
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(n);

  /**
   * CONFETTI FINAL
   * - Menos partículas.
   * - Sale solo desde la parte inferior central (mitad abajo).
   * - Movimiento fluido y fade al final.
   */
  useEffect(() => {
    if (!showConfetti) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.opacity = "1";

    const myConfetti = confettiLib.create(canvas, { resize: true, useWorker: false });

    // origen: centro inferior
    const originCenterBottom = { x: 0.5, y: 0.95 };

    const baseOptions = {
      particleCount: 35, // menos partículas
      spread: 80,
      scalar: 1.2, // tamaño medio-grande
      gravity: 0.5,
      drift: 0.1,
      ticks: 130,
    };

    const intervalMs = 90;
    const activeDuration = 1400;
    const endTime = Date.now() + activeDuration;

    let intervalId = null;
    let finalTimeoutId = null;
    let visibilityIntervalId = null;
    let fallbackTimeoutId = null;

    const fireBurst = () => {
      // todas las ráfagas desde el centro inferior, con pequeñas variaciones
      const offsetX = (Math.random() - 0.5) * 0.1;
      myConfetti({
        ...baseOptions,
        particleCount: baseOptions.particleCount + (Math.random() > 0.8 ? 8 : 0),
        startVelocity: 85 + Math.floor(Math.random() * 25),
        spread: baseOptions.spread + Math.random() * 30 - 15,
        origin: { x: originCenterBottom.x + offsetX, y: originCenterBottom.y },
      });
    };

    // lanzamientos continuos durante un tiempo breve
    intervalId = window.setInterval(() => {
      if (Date.now() < endTime) {
        fireBurst();
      } else {
        clearInterval(intervalId);
        intervalId = null;

        // ráfaga final más ancha
        myConfetti({
          particleCount: 60,
          spread: 160,
          scalar: 1.15,
          gravity: 0.55,
          startVelocity: 100,
          ticks: 150,
          origin: originCenterBottom,
        });

        startVisibilityPollingAndFade();
      }
    }, intervalMs);

    const startVisibilityPollingAndFade = () => {
      const ctx = canvas.getContext && canvas.getContext("2d");
      if (!ctx) {
        fallbackTimeoutId = window.setTimeout(() => smoothHideCanvas(), 900);
        return;
      }

      const pollInterval = 250;
      const sampleStep = 48;
      const alphaThreshold = 10;

      const checkVisiblePixels = () => {
        try {
          const w = canvas.width;
          const h = canvas.height;
          if (!w || !h) return false;
          const data = ctx.getImageData(0, 0, w, h).data;
          for (let i = 3; i < data.length; i += sampleStep) {
            if (data[i] > alphaThreshold) return true;
          }
          return false;
        } catch (e) {
          console.warn("Vis check failed:", e);
          return null;
        }
      };

      visibilityIntervalId = window.setInterval(() => {
        const visible = checkVisiblePixels();
        if (visible === null) {
          clearInterval(visibilityIntervalId);
          startTimeoutFade();
          return;
        }
        if (!visible) {
          clearInterval(visibilityIntervalId);
          smoothHideCanvas();
        }
      }, pollInterval);
    };

    const startTimeoutFade = () => {
      fallbackTimeoutId = window.setTimeout(() => smoothHideCanvas(), 700);
    };

    const smoothHideCanvas = () => {
      const durationMs = 700;
      const frames = 25;
      let frame = 0;
      const stepFn = () => {
        frame++;
        const newOp = Math.max(1 - frame / frames, 0);
        if (canvas) canvas.style.opacity = String(newOp);
        if (frame < frames) requestAnimationFrame(stepFn);
        else {
          try {
            myConfetti && myConfetti.reset && myConfetti.reset();
          } catch (_) {}
          setShowConfetti(false);
        }
      };
      requestAnimationFrame(stepFn);
    };

    finalTimeoutId = window.setTimeout(() => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      startTimeoutFade();
    }, 3500);

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (finalTimeoutId) clearTimeout(finalTimeoutId);
      if (visibilityIntervalId) clearInterval(visibilityIntervalId);
      if (fallbackTimeoutId) clearTimeout(fallbackTimeoutId);
      try {
        myConfetti && myConfetti.reset && myConfetti.reset();
      } catch (e) {}
    };
  }, [showConfetti]);

  return (
    <UsersLayout>
      {showConfetti && (
        <canvas
          ref={canvasRef}
          className="pointer-events-none fixed inset-0 z-[60] w-full h-full"
          aria-hidden="true"
          style={{ opacity: 1 }}
        />
      )}

      <section className="pt-[120px] max-w-[1200px] mx-auto p-[20px] max-md:p-[10px] max-md:pt-[80px]">
        <div className="w-full">
          <h2 className="mb-[20px] text-[28px] font-bold">¡Gracias por tu compra!</h2>

          <article className="p-[30px] border-1 border-black/20 rounded-[30px] max-md:p-[15px]">
            <div className="flex justify-between border-b border-black/20 pb-[20px] max-md:flex-col">
              <div>
                <h3 className="text-[20px] font-semibold">
                  Pedido <span className="font-bold">#{order.id}</span>
                </h3>
                <p className="text-[13px] text-black/60 mt-[6px]">
                  Estado: <strong>{order.status}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3 mt-[10px]">
                <button
                  onClick={() => handleCopy(order.id)}
                  className="flex gap-[10px] p-[8px_18px] border-1 border-green-600 text-green-700 cursor-pointer bg-green-100 rounded-full"
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-[13px]">{copied ? "Copiado!" : "Copiar ID"}</span>
                </button>

                <a
                  href={invoiceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex gap-[10px] p-[8px_18px] border-1 border-orange-600 text-orange-700 cursor-pointer bg-orange-100 rounded-full"
                >
                  <DownloadCloud className="w-4 h-4" />
                  <span className="text-[13px]">Ver factura</span>
                </a>
              </div>
            </div>

            <div className="pt-[30px]">
              <h4 className="mb-[6px] text-[18px] font-semibold">Resumen del pedido</h4>
              <div className="flex flex-col gap-[12px]">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center p-[12px] border border-black/10 rounded-[18px]">
                    <div>
                      <p className="font-medium">{it.title}</p>
                      <span className="text-[13px] text-black/80">Cantidad: {it.qty}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(it.price * it.qty)}</p>
                      <span className="text-[12px] text-black/80">c/u {formatCurrency(it.price)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-[20px] border-t border-black/10 pt-[15px]">
                <div className="flex justify-between mb-[8px]">
                  <span className="text-[14px]">Subtotal</span>
                  <span className="font-bold">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between mb-[8px]">
                  <span className="text-[14px]">Impuestos</span>
                  <span className="font-bold">{formatCurrency(order.taxes)}</span>
                </div>
                <div className="flex justify-between mt-[6px]">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-[18px]">{formatCurrency(order.total)}</span>
                </div>
                <p className="mt-[12px] text-[13px] text-black/60">ETA estimado: <strong>{order.etaText}</strong></p>
              </div>
            </div>

            <div className="mt-[24px] flex gap-3 flex-wrap">
              <BtnLinkIcon
                title="Seguir comprando"
                style="bg-[var(--color-blue)]! text-white"
                styleIcon="bg-white!"
                link="../users/store"
              >
                <CreditCard className="text-[var(--color-blue)]!" />
              </BtnLinkIcon>

        
            </div>
          </article>

          <article className="mt-[18px] p-[20px] rounded-[20px] border border-black/10">
            <h4 className="mb-[8px] font-semibold">¿Necesitas ayuda?</h4>
            <div className="text-[13px] text-black/60">
              Responde este correo o contacta a <span className="font-medium">soporte@tutienda.com</span> • +57 300 000 0000
            </div>
            <div className="mt-[10px] flex gap-3">
              <button className="text-[13px] underline" onClick={() => navigate(`/student/orders/${order.id}`)}>Ver estado en detalle</button>
              <button className="text-[13px] underline" onClick={() => navigate("/student/support")}>Contactar soporte</button>
            </div>
          </article>
        </div>
      </section>
    </UsersLayout>
  );
};

export default UsersOrderConfirm;