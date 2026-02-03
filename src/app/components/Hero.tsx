"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex h-screen items-center justify-center overflow-hidden bg-slate-900">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 z-0 h-full w-full object-cover opacity-20"
      >
        <source src="/1_1.mp4" type="video/mp4" />
      </video>

      <div className="pointer-events-none absolute z-10">
        <div className="absolute opacity-30 blur-[80px] w-[60vw] h-[50vh] top-[15vh] left-[10vw] rounded-full bg-[#007cf0]" />
        <div className="absolute opacity-30 blur-[80px] w-[50vw] h-[50vh] bottom-[15vh] right-[10vw] rounded-full bg-[#00dfd8]" />
      </div>

      <div className="relative z-20 mx-auto max-w-4xl p-6 text-white">
        <p className="mb-4 font-semibold tracking-widest text-slate-300">
          DEUDASCERO | ABOGADOS
        </p>
        <h1 className="text-5xl font-bold leading-tight text-slate-100 md:text-7xl">
          Claridad legal.
        </h1>
        <h2 className="mt-1 text-5xl font-bold leading-tight text-slate-300 md:text-7xl">
          Libertad financiera.
        </h2>

        <p className="mt-8 max-w-2xl text-lg font-light leading-relaxed text-slate-300 md:text-xl">
          Somos un estudio de abogados especialista en eliminar deudas complejas
          y restaurar tu historial. Deja que nuestra experiencia trace tu camino.
        </p>

        {/* CTA: SOLO NAVEGA A /evaluacion */}
        <div className="mt-12">
          <Link
            href="/evaluacion"
            className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-slate-900 shadow transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            Iniciar mi Evaluación Gratuita
          </Link>
        </div>
      </div>
    </section>
  );
}