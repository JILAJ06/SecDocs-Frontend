/**
 * Tarjeta base de las vistas de detalle (Figma vista 04 y 12).
 * Muestra encabezado opcional con título, subtítulo y acción a la derecha.
 */
export default function Card({ title, subtitle, action, className = '', children }) {
  return (
    <section className={`flex flex-col gap-3 rounded-2xl border border-niebla bg-white p-5 ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            {title && <h2 className="text-lg font-semibold leading-7 text-bosque">{title}</h2>}
            {subtitle && <p className="text-xs leading-4 text-bosque-soft">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
