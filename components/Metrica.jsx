/**
 * Tarjeta de métrica para el panel Mis bóvedas (Figma vista 03).
 * Muestra etiqueta en mayúsculas, valor grande, detalle y barra de progreso opcional.
 */
export default function Metrica({ label, value, detail, progress }) {
  return (
    <div className="flex flex-1 flex-col gap-1.5 rounded-2xl border border-niebla bg-white p-5">
      <span className="text-xs font-medium uppercase leading-4 tracking-[0.6px] text-bosque-soft">
        {label}
      </span>
      <span className="text-2xl font-bold leading-8 tracking-[-0.5px] text-bosque">
        {value}
      </span>
      {typeof progress === 'number' && (
        <div className="h-1.5 w-full rounded-full bg-niebla">
          <div
            className="h-1.5 rounded-[3px] bg-bosque"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
      <span className="text-xs leading-4 text-bosque-muted">{detail}</span>
    </div>
  );
}
