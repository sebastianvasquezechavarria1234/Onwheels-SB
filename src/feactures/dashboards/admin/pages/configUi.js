export const cn = (...classes) => classes.filter(Boolean).join(" ");

export const configUi = {
  pageShell: "flex h-full min-h-0 flex-col gap-4 overflow-hidden bg-white p-3 pt-4 md:p-5 md:pt-5",
  headerRow: "flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between",
  titleWrap: "flex flex-wrap items-start gap-3 sm:items-center",
  title: "text-[22px] font-black leading-tight tracking-tight text-[#16315f] md:text-[28px]",
  countBadge: "inline-flex items-center rounded-full border border-[#a9c7ef] bg-[#e8f2ff] px-3 py-1 text-[11px] font-bold text-[#1d4f91] shadow-sm",
  toolbar: "flex w-full flex-col gap-3 sm:flex-row sm:items-center xl:w-auto",
  searchWrap: "relative w-full sm:w-[290px]",
  input: "w-full rounded-2xl border border-[#bfd1f4] bg-white px-4 py-3 text-sm text-[#16315f] outline-none transition focus:border-[#7da7e8] focus:ring-4 focus:ring-[#dbeafe] placeholder:text-[#86a0c6]",
  inputWithIcon: "w-full rounded-2xl border border-[#bfd1f4] bg-white py-3 pl-11 pr-4 text-sm text-[#16315f] outline-none transition focus:border-[#7da7e8] focus:ring-4 focus:ring-[#dbeafe] placeholder:text-[#86a0c6]",
  select: "appearance-none rounded-2xl border border-[#bfd1f4] bg-white py-3 pl-4 pr-10 text-sm text-[#16315f] outline-none transition focus:border-[#7da7e8] focus:ring-4 focus:ring-[#dbeafe]",
  iconButton: "flex h-10 w-auto min-w-[100px] items-center justify-center gap-2 rounded-xl border border-[#bfd1f4] bg-white px-3 text-[13px] font-semibold text-[#3b5a9a] shadow-sm transition hover:border-[#9fbce7] hover:bg-[#f0f5ff] hover:text-[#16315f]",
  primaryButton: "inline-flex items-center justify-center gap-2 rounded-xl bg-[#223a63] px-5 py-2.5 text-[13px] font-bold text-white shadow-md transition hover:bg-[#16315f]",

  // ── TABLA ──────────────────────────────────────────────────────────────────
  tableCard: "flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm",
  tableScroll: "flex-1 overflow-auto",
  table: "w-full min-w-[900px] border-collapse text-left",

  // Header de tabla — fondo oscuro (dark navy/gray) #1f2937 (slate-800) como la captura
  thead: "sticky top-0 z-10 bg-[#1f2937] text-white",
  th: "border-b border-transparent px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-white",

  // Filas — separador muy sutil (gray-100), hover suave
  td: "border-b border-gray-100 px-4 py-3.5 text-[13px] font-medium text-gray-700 align-middle",
  row: "bg-white transition-colors hover:bg-gray-50",

  emptyState: "px-6 py-10 text-center text-sm text-gray-500",
  paginationBar: "flex items-center justify-between border-t border-gray-100 bg-white px-5 py-3",
  paginationButton: "flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-40 disabled:hover:bg-white",

  // ── PILLS / BADGES (Estilos de la captura) ──────────────────────────────
  // Pill azul claro (Medellín)
  pill: "inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold text-blue-600",
  // Pill gris sutil
  subtlePill: "inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-600",
  // Pill verde (éxito)
  successPill: "inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-[11px] font-bold text-green-700",
  // Pill rojo (error)
  dangerPill: "inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-[11px] font-bold text-red-600",
  // Pill cyan claro (Bogotá)
  tealPill: "inline-flex items-center rounded-full bg-cyan-100 px-3 py-1 text-[11px] font-bold text-cyan-700",
  // Pill verde claro (Pereira - en la captura es verde claro, no purple)
  purplePill: "inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-600",

  // ── BOTONES DE ACCIÓN (Derecha: ver / editar / eliminar) ────────────────
  // Ojo — fondo azul muy claro, icono azul (captura)
  actionButton: "flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-500 transition hover:bg-blue-100",
  // Lápiz — fondo verde muy claro, icono verde (captura)
  actionEditButton: "flex h-7 w-7 items-center justify-center rounded-md bg-green-50 text-green-500 transition hover:bg-green-100",
  // Basurero — fondo rojo muy claro, icono rojo (captura)
  actionDangerButton: "flex h-7 w-7 items-center justify-center rounded-md bg-red-50 text-red-500 transition hover:bg-red-100",

  // ── MODALES ───────────────────────────────────────────────────────────────
  modalBackdrop: "fixed inset-0 z-40 flex items-center justify-center bg-[#0e1d35]/18 p-4 backdrop-blur-sm",
  modalPanel: "w-full overflow-hidden rounded-[2rem] border border-[#d7e5f8] bg-white shadow-[0_30px_80px_-34px_rgba(20,35,70,0.65)]",
  modalSplit: "flex max-h-[78vh] min-h-[460px] overflow-hidden",
  modalSplitCompact: "flex max-h-[72vh] min-h-[340px] overflow-hidden",
  modalSide: "hidden w-[250px] flex-col justify-between border-r border-[#d7e5f8] bg-[linear-gradient(180deg,#eef5ff_0%,#f8fbff_100%)] p-8 lg:flex",
  modalSideIcon: "flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-[#c8dbf7] bg-white text-[#223a63] shadow-sm",
  modalEyebrow: "text-[10px] font-black uppercase tracking-[0.24em] text-[#6b84aa]",
  modalHeader: "flex items-start justify-between border-b border-[#d7e5f8] px-6 py-5",
  modalTitle: "text-xl font-black text-[#16315f]",
  modalSubtitle: "mt-1 text-sm text-[#6b84aa]",
  modalClose: "rounded-xl border border-transparent p-2 text-[#7c91b3] transition hover:border-[#d7e5f8] hover:bg-[#f8fbff] hover:text-[#16315f]",
  modalContent: "flex-1 overflow-y-auto px-6 py-5",
  modalFooter: "flex items-center justify-between gap-3 border-t border-[#d7e5f8] bg-[#fbfdff] px-6 py-4",
  fieldGroup: "space-y-1.5",
  fieldLabel: "pl-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#6b84aa]",
  fieldInput: "w-full rounded-2xl border border-[#bfd1f4] bg-white px-4 py-3 text-sm text-[#16315f] outline-none transition focus:border-[#7da7e8] focus:ring-4 focus:ring-[#dbeafe] placeholder:text-[#91a9cc]",
  fieldSelect: "w-full rounded-2xl border border-[#bfd1f4] bg-white px-4 py-3 text-sm text-[#16315f] outline-none transition focus:border-[#7da7e8] focus:ring-4 focus:ring-[#dbeafe] cursor-pointer",
  fieldTextarea: "h-28 w-full resize-none rounded-2xl border border-[#bfd1f4] bg-white px-4 py-3 text-sm text-[#16315f] outline-none transition focus:border-[#7da7e8] focus:ring-4 focus:ring-[#dbeafe] placeholder:text-[#91a9cc]",
  readOnlyField: "rounded-2xl border border-[#d7e5f8] bg-[#f8fbff] px-4 py-3 text-sm text-[#16315f]",
  formSection: "rounded-[1.5rem] border border-[#d7e5f8] bg-[#fbfdff] p-4",
  secondaryButton: "inline-flex items-center justify-center rounded-2xl border border-[#bfd1f4] bg-white px-4 py-3 text-sm font-bold text-[#5f7396] transition hover:bg-[#f8fbff] hover:text-[#16315f]",
  dangerButton: "inline-flex items-center justify-center rounded-2xl bg-[#df5b78] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#cc4563]",
  primarySoftButton: "inline-flex items-center justify-center gap-2 rounded-2xl bg-[#223a63] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#16315f]",
  stepBadge: "inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-[#bfd1f4] bg-[#edf5ff] px-2 text-[11px] font-black text-[#1d4f91]",
  toggleTrackOn: "bg-[#223a63]",
  toggleTrackOff: "bg-[#d3deef]",
  toggleThumb: "h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
};

const ACTION_ORDER = ["ver", "gestionar", "crear", "editar", "actualizar", "eliminar", "asignar", "activar", "desactivar"];

const normalizeText = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const humanize = (value = "") =>
  value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const getPermissionMeta = (permiso) => {
  const rawName = permiso?.nombre_permiso || permiso?.nombre || "";
  const normalized = normalizeText(rawName);
  const tokens = normalized.split(/[\s:_-]+/).filter(Boolean);
  const action = ACTION_ORDER.find((item) => tokens.includes(item)) || tokens[0] || "general";
  const moduleTokens = tokens.filter((token) => token !== action && !["de", "del", "la", "el", "los", "las"].includes(token));
  const moduleKey = moduleTokens.join(" ") || normalized || "general";

  return {
    action,
    actionLabel: humanize(action),
    moduleKey,
    moduleLabel: humanize(moduleKey),
    rawName
  };
};

export const groupPermissionsByModule = (permissions = []) => {
  const groups = new Map();

  permissions.forEach((permission) => {
    const meta = getPermissionMeta(permission);
    if (!groups.has(meta.moduleKey)) {
      groups.set(meta.moduleKey, {
        key: meta.moduleKey,
        label: meta.moduleLabel,
        items: []
      });
    }
    groups.get(meta.moduleKey).items.push({ ...permission, meta });
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      items: group.items.sort((a, b) => {
        const actionDiff = ACTION_ORDER.indexOf(a.meta.action) - ACTION_ORDER.indexOf(b.meta.action);
        if (actionDiff !== 0) return actionDiff;
        return a.meta.rawName.localeCompare(b.meta.rawName, "es", { sensitivity: "base" });
      })
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "es", { sensitivity: "base" }));
};
