import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Victoria Highlanders | Ingreso",
    description: "Accede o crea una cuenta",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 lg:p-8 bg-zinc-950 relative overflow-hidden">
            {/* Background Gradient Mesh */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-purple-500/20 blur-[120px]" />
                <div className="absolute top-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-orange-500/20 blur-[120px]" />
                <div className="absolute bottom-[0%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-500/20 blur-[120px]" />

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>

            <div className="w-full max-w-5xl relative z-10 flex flex-col lg:flex-row min-h-[600px] border border-white/10 rounded-[2rem] overflow-hidden bg-black/40 backdrop-blur-xl shadow-2xl">

                {/* Leyenda izquierda: Formulario */}
                <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
                    {/* Logo falso - Velion */}
                    <div className="flex items-center gap-2 mb-12">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-purple-600 grid place-items-center">
                            <div className="w-3 h-3 bg-white rounded-full translate-x-1 -translate-y-1" />
                            <div className="w-2 h-2 bg-white/70 rounded-full -translate-x-1 translate-y-1" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">Velion</span>
                    </div>

                    {children}
                </div>

                {/* Leyenda derecha: Testimonial & Graphics */}
                <div className="hidden lg:flex w-1/2 bg-[#0A0A0A] p-12 flex-col justify-between relative overflow-hidden border-l border-white/5">
                    <div className="relative z-10">
                        <h2 className="text-4xl text-white font-semibold leading-tight mb-8">
                            What's our<br />Jobseekers Said.
                        </h2>

                        <div className="text-white/40 text-6xl font-serif">"</div>
                        <p className="text-white/80 text-lg leading-relaxed mb-6 -mt-2">
                            "Search and find your dream job is now easier than ever. Just browse a job and apply if you need to."
                        </p>

                        <div>
                            <p className="text-white font-medium">Mas Parjono</p>
                            <p className="text-white/50 text-sm">UI Designer at Google</p>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button className="w-12 h-12 rounded-xl bg-orange-400/80 hover:bg-orange-400 transition-colors flex items-center justify-center text-white">
                                ←
                            </button>
                            <button className="w-12 h-12 rounded-xl bg-teal-900/50 border border-teal-500/20 hover:bg-teal-900/80 transition-colors flex items-center justify-center text-teal-400">
                                →
                            </button>
                        </div>
                    </div>

                    {/* Star Graphic */}
                    <div className="absolute -bottom-24 -right-12 w-[400px] h-[400px]">
                        {/* Fake glowing star */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.4),transparent_50%)]" />
                        <svg viewBox="0 0 100 100" className="w-full h-full text-white/10 fill-current animate-pulse-slow">
                            <path d="M50 0 L55 45 L100 50 L55 55 L50 100 L45 55 L0 50 L45 45 Z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    )
}
