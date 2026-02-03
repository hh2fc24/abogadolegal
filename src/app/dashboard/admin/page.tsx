// src/app/dashboard/admin/page.tsx
import { Settings, MessageSquareCode, Users2, ShieldCheck, Database, Sparkles } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_8px_30px_rgba(2,6,23,0.06)] backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-500">Configuración</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
              Panel de Administración
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Ajustes globales del asistente, usuarios y seguridad.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-600 shadow-sm">
            <Settings size={16} className="text-sky-600" />
            Preferencias
          </div>
        </div>
      </header>

      {/* Tarjetas principales */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AdminCard
          icon={<MessageSquareCode size={18} />}
          title="Chatbot & Prompts"
          subtitle="Ajustes del sistema y revisión de conversaciones."
          cta="Configurar"
        >
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• System Prompt centralizado</li>
            <li>• Listado de conversaciones marcadas</li>
            <li>• Tono y políticas de respuesta</li>
          </ul>
        </AdminCard>

        <AdminCard
          icon={<Users2 size={18} />}
          title="Usuarios & Permisos"
          subtitle="Gestión de cuentas internas y roles."
          cta="Abrir módulo"
        >
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• Altas / bajas / edición</li>
            <li>• Roles (ejec., abogado, admin)</li>
            <li>• Activity log básico</li>
          </ul>
        </AdminCard>

        <AdminCard
          icon={<ShieldCheck size={18} />}
          title="Seguridad & Cumplimiento"
          subtitle="Lineamientos y controles básicos."
          cta="Revisar"
        >
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• Política de datos personales</li>
            <li>• Accesos por ambiente</li>
            <li>• Retención de logs</li>
          </ul>
        </AdminCard>
      </section>

      {/* Sección secundaria: mantenimiento y herramientas */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(2,6,23,0.05)]">
          <div className="mb-3 flex items-center gap-2">
            <Database size={18} className="text-sky-600" />
            <h3 className="text-sm font-semibold text-slate-900">Mantenimiento</h3>
          </div>
          <p className="mb-4 text-sm text-slate-600">
            Acciones utilitarias para la operación diaria.
          </p>
          <div className="flex flex-wrap gap-2">
            <ActionButton label="Reindexar búsquedas" />
            <ActionButton label="Validar integridad" variant="neutral" />
            <ActionButton label="Purgar temporales" variant="danger" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(2,6,23,0.05)]">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={18} className="text-sky-600" />
            <h3 className="text-sm font-semibold text-slate-900">Herramientas rápidas</h3>
          </div>
          <p className="mb-4 text-sm text-slate-600">
            Utilidades de apoyo: exportaciones y diagnóstico.
          </p>
          <div className="flex flex-wrap gap-2">
            <ActionButton label="Exportar leads CSV" />
            <ActionButton label="Exportar casos CSV" />
            <ActionButton label="Diagnóstico API" variant="neutral" />
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- UI atoms ---------- */

function AdminCard({
  icon,
  title,
  subtitle,
  cta,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  cta?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(2,6,23,0.05)] transition-all hover:shadow-[0_16px_40px_rgba(2,6,23,0.08)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-sky-200 bg-gradient-to-br from-sky-50 to-white text-sky-600">
            {icon}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
          </div>
        </div>
        {cta && (
          <button className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:border-sky-300 hover:text-sky-700">
            {cta}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function ActionButton({
  label,
  variant = 'primary',
}: {
  label: string;
  variant?: 'primary' | 'neutral' | 'danger';
}) {
  const styles =
    variant === 'primary'
      ? 'border-sky-200 text-sky-700 hover:border-sky-300 hover:text-sky-800'
      : variant === 'danger'
      ? 'border-rose-200 text-rose-700 hover:border-rose-300 hover:text-rose-800'
      : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-800';

  return (
    <button className={`rounded-md border bg-white px-3 py-1.5 text-xs font-medium shadow-sm transition-colors ${styles}`}>
      {label}
    </button>
  );
}