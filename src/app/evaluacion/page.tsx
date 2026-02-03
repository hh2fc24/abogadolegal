// src/app/evaluacion/page.tsx
import EvalLeadForm from '@/app/evaluacion/EvalLeadForm';
import BotonAbrirChat from './BotonAbrirChat';

export const metadata = {
  title: 'Evaluación Gratuita — DeudasCero',
  description:
    'Último paso: cuéntanos lo básico y te contactamos. También puedes conversar con un asesor legal por chat 24/7.',
};

export default async function EvaluacionPage() {
  return (
    <main className="bg-white">
      {/* Cintillo/hero corporativo */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_80%_-20%,#D1FAE5_0%,transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_400px_at_-10%_20%,#E0E7FF_0%,transparent_60%)]" />
        <div className="mx-auto max-w-6xl px-6 py-12 sm:py-14">
          <p className="text-xs font-semibold tracking-widest text-emerald-700/90">
            DEUDASCERO | ABOGADOS
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            Evaluación Gratuita
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600">
            Último paso: cuéntanos lo básico y te contactamos. Si prefieres, también puedes
            conversar con nuestro <span className="font-semibold text-slate-900">asesor legal</span> por chat 24/7.
          </p>

          {/* Mini KPIs / confianza */}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800">
              <svg width="16" height="16" viewBox="0 0 24 24" className="fill-current">
                <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              Evaluación sin costo
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
              Protección de datos
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
              Respuesta en menos de 24h
            </span>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Columna principal */}
          <section
            className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(2,6,23,0.06)]"
            aria-labelledby="form-title"
          >
            <h2 id="form-title" className="mb-4 text-sm font-semibold text-slate-900">
              Tus datos
            </h2>
            <EvalLeadForm />
            <p className="mt-3 text-xs text-slate-500">
              * Con nombre + (email o teléfono) ya podemos ayudarte.
            </p>
          </section>

          {/* Aside sticky con CTA al chat */}
          <aside className="lg:sticky lg:top-6 h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(2,6,23,0.06)]">
            <h3 className="text-lg font-semibold text-slate-900">¿Prefieres hablar ahora?</h3>
            <p className="mt-2 text-slate-600">
              Conversa con un <span className="font-semibold text-slate-900">asesor legal</span> por chat
              y obtén orientación en minutos.
            </p>

            <div className="mt-4">
              <BotonAbrirChat />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              También puedes terminar el formulario y te contactamos por teléfono o email.
            </p>

            {/* Trust bullets compactos */}
            <ul className="mt-6 space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Atención humana, 24/7
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Especialistas en prescripción y defensas
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Proceso simple y seguro
              </li>
            </ul>
          </aside>
        </div>

        {/* Franja de logos / prensa / confianza */}
        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
            Mencionados por
          </p>
          <div className="mt-4 grid grid-cols-2 items-center gap-6 opacity-80 sm:grid-cols-4">
            <div className="h-8 rounded bg-white/60 backdrop-blur-sm" />
            <div className="h-8 rounded bg-white/60 backdrop-blur-sm" />
            <div className="h-8 rounded bg-white/60 backdrop-blur-sm" />
            <div className="h-8 rounded bg-white/60 backdrop-blur-sm" />
          </div>
        </div>

        {/* Beneficios / garantías */}
        <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <div className="mb-1 text-base font-semibold text-slate-900">Atención humana, 24/7</div>
            <p className="text-slate-600">
              Siempre conversarás con un asesor legal real. Empatía y claridad ante todo.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <div className="mb-1 text-base font-semibold text-slate-900">Especialistas en deudas</div>
            <p className="text-slate-600">
              Experiencia en prescripción, defensas y negociaciones complejas.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <div className="mb-1 text-base font-semibold text-slate-900">Proceso simple y seguro</div>
            <p className="text-slate-600">
              Tus datos se resguardan de forma confidencial. Te guiamos paso a paso.
            </p>
          </div>
        </section>

        {/* Bloque final de cierre */}
        <section className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 sm:p-8">
          <div className="grid items-center gap-6 sm:grid-cols-2">
            <div>
              <h4 className="text-xl font-semibold text-slate-900">¿Listo para dar el primer paso?</h4>
              <p className="mt-2 text-slate-600">
                Completa la evaluación o inicia una conversación con nuestro asesor legal.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="#form-title"
                  className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  Completar evaluación
                </a>
                <div className="inline-flex">
                  <BotonAbrirChat />
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-700 backdrop-blur-sm">
              <p className="font-semibold text-slate-900">Nuestra promesa</p>
              <p className="mt-1 text-slate-600">
                Te daremos un plan claro y honesto. Si tu caso requiere acciones judiciales,
                contarás con representación formal y trazabilidad en cada etapa.
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}