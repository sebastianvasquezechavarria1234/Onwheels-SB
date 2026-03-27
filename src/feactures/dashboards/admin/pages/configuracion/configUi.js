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
  iconButton: "flex h-12 w-12 items-center justify-center rounded-2xl border border-[#bfd1f4] bg-white text-[#6a85ad] shadow-sm transition hover:border-[#9fbce7] hover:bg-[#f8fbff] hover:text-[#16315f]",
  primaryButton: "inline-flex items-center justify-center gap-2 rounded-2xl bg-[#223a63] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_24px_-16px_rgba(34,58,99,0.95)] transition hover:bg-[#16315f]",
  tableCard: "flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.6rem] border border-[#bfd1f4] bg-white shadow-[0_16px_40px_-28px_rgba(34,58,99,0.8)]",
  tableScroll: "flex-1 overflow-auto",
  table: "w-full min-w-[900px] border-separate border-spacing-0 text-left",
  thead: "sticky top-0 z-10 bg-[#dbeafe] text-[#16315f]",
  th: "border-b border-[#9ec1ef] px-3 py-3 text-[10px] font-black uppercase tracking-[0.14em]",
  td: "border-b border-[#d7e5f8] px-3 py-2.5 text-[12px] text-[#16315f] align-middle",
  row: "transition-colors hover:bg-[#f8fbff]",
  emptyState: "px-6 py-10 text-center text-sm text-[#6b84aa]",
  paginationBar: "mt-auto flex items-center justify-between border-t border-[#d7e5f8] bg-[#fbfdff] px-5 py-4",
  paginationButton: "flex h-10 w-10 items-center justify-center rounded-xl border border-[#bfd1f4] bg-white text-[#6a85ad] shadow-sm transition hover:bg-[#f8fbff] hover:text-[#16315f] disabled:opacity-50",
  pill: "inline-flex items-center rounded-full border border-[#bfd1f4] bg-[#edf5ff] px-3 py-1 text-xs font-bold text-[#1d4f91]",
  subtlePill: "inline-flex items-center rounded-full border border-[#d7e5f8] bg-[#f8fbff] px-3 py-1 text-xs font-semibold text-[#5b7398]",
  successPill: "inline-flex items-center gap-2 rounded-full border border-[#bde7d0] bg-[#edfdf4] px-3 py-1 text-xs font-bold text-[#0d8a4d]",
  dangerPill: "inline-flex items-center gap-2 rounded-full border border-[#f3c0c8] bg-[#fff1f3] px-3 py-1 text-xs font-bold text-[#d44966]",
  actionButton: "flex h-9 w-9 items-center justify-center rounded-xl border border-[#bfd1f4] bg-white text-[#6a85ad] shadow-sm transition hover:border-[#9fbce7] hover:bg-[#f8fbff] hover:text-[#16315f]",
  actionDangerButton: "flex h-9 w-9 items-center justify-center rounded-xl border border-[#f5c4cc] bg-[#fff1f3] text-[#d44966] shadow-sm transition hover:bg-[#ffe4e8]",
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
  modalErrorBox: "mx-auto mb-6 max-w-md p-4 rounded-2xl bg-[#fff1f3] border border-[#f5c4cc] flex items-start gap-3 text-left shadow-sm",
  modalErrorTitle: "text-xs font-black uppercase tracking-[0.1em] text-[#d44966] mb-1",
  modalErrorText: "text-[13px] font-medium text-[#b0304a] leading-relaxed",
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
