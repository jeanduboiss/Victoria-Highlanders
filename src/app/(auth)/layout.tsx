import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Victoria Highlanders | Acceso',
  description: 'Inicia sesión en la plataforma de gestión del club',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 lg:p-8 bg-[#7BA898] relative overflow-hidden">

      {/* Card principal — dos columnas */}
      <div className="w-full max-w-[950px] relative z-10 flex flex-col lg:flex-row min-h-[560px] rounded-3xl overflow-hidden shadow-2xl">

        {/* ====== IZQUIERDA — Zona visual futbolística ====== */}
        <div className="hidden lg:flex w-[48%] bg-[#C8F0D4] relative overflow-hidden items-end justify-center">

          {/* Íconos flotantes de fútbol (SVG inline, doodle style) */}
          <div className="absolute inset-0 pointer-events-none">

            {/* Marcador 2:0 */}
            <div className="absolute top-[8%] left-[18%] rotate-[-12deg]">
              <svg width="52" height="40" viewBox="0 0 52 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="48" height="36" rx="6" stroke="#2d2d2d" strokeWidth="2.5" fill="none" />
                <text x="26" y="26" textAnchor="middle" fontSize="16" fontWeight="700" fill="#2d2d2d">2:0</text>
              </svg>
            </div>

            {/* GOAL! badge */}
            <div className="absolute top-[12%] right-[32%] rotate-[6deg]">
              <svg width="60" height="38" viewBox="0 0 60 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M30 2L37 5L42 1L48 6L56 8L58 16L56 22L58 30L52 36L44 36L38 34L30 38L22 34L16 36L8 36L2 30L4 22L2 16L4 8L12 6L18 1L23 5L30 2Z" stroke="#2d2d2d" strokeWidth="2" fill="#C8F0D4" />
                <text x="30" y="24" textAnchor="middle" fontSize="11" fontWeight="800" fill="#2d2d2d">GOAL!</text>
              </svg>
            </div>

            {/* Bota de fútbol */}
            <div className="absolute top-[42%] right-[22%] rotate-[-8deg]">
              <svg width="40" height="36" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 28C8 28 4 24 6 18C8 12 14 8 20 6C26 4 32 6 34 10C36 14 34 20 30 24L28 26H24L20 28L14 30L8 28Z" stroke="#2d2d2d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M30 24L36 22L38 26L34 30L28 28" stroke="#2d2d2d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>

            {/* Estadio / estructura */}
            <div className="absolute top-[28%] left-[6%] rotate-[4deg]">
              <svg width="44" height="32" viewBox="0 0 44 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="22" cy="16" rx="20" ry="12" stroke="#2d2d2d" strokeWidth="2" fill="none" />
                <ellipse cx="22" cy="16" rx="12" ry="7" stroke="#2d2d2d" strokeWidth="1.5" fill="none" />
                <line x1="22" y1="4" x2="22" y2="28" stroke="#2d2d2d" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Tarjeta roja */}
            <div className="absolute top-[5%] right-[12%] rotate-[15deg]">
              <svg width="24" height="34" viewBox="0 0 24 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="30" rx="2" stroke="#2d2d2d" strokeWidth="2.5" fill="none" />
                <rect x="6" y="6" width="12" height="8" rx="1" fill="#2d2d2d" fillOpacity="0.15" />
              </svg>
            </div>

            {/* Camiseta #10 */}
            <div className="absolute bottom-[35%] left-[10%] rotate-[-6deg]">
              <svg width="40" height="44" viewBox="0 0 40 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L6 8L2 16L8 18L10 12V40H30V12L32 18L38 16L34 8L28 4H22L20 8L18 4H12Z" stroke="#2d2d2d" strokeWidth="2" fill="none" strokeLinejoin="round" />
                <text x="20" y="30" textAnchor="middle" fontSize="10" fontWeight="700" fill="#2d2d2d">10</text>
              </svg>
            </div>

            {/* Cancha (vista aérea) */}
            <div className="absolute bottom-[8%] right-[10%]">
              <svg width="56" height="40" viewBox="0 0 56 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="52" height="36" rx="2" stroke="#2d2d2d" strokeWidth="2" fill="none" />
                <line x1="28" y1="2" x2="28" y2="38" stroke="#2d2d2d" strokeWidth="1.5" />
                <circle cx="28" cy="20" r="6" stroke="#2d2d2d" strokeWidth="1.5" fill="none" />
                <rect x="2" y="10" width="10" height="20" stroke="#2d2d2d" strokeWidth="1.5" fill="none" />
                <rect x="44" y="10" width="10" height="20" stroke="#2d2d2d" strokeWidth="1.5" fill="none" />
              </svg>
            </div>

            {/* Red de portería */}
            <div className="absolute bottom-[50%] right-[6%]">
              <svg width="36" height="30" viewBox="0 0 36 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 28V6C4 4 6 2 8 2H28C30 2 32 4 32 6V28" stroke="#2d2d2d" strokeWidth="2" fill="none" />
                <line x1="4" y1="28" x2="32" y2="28" stroke="#2d2d2d" strokeWidth="2" />
                <line x1="10" y1="2" x2="10" y2="28" stroke="#2d2d2d" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="18" y1="2" x2="18" y2="28" stroke="#2d2d2d" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="26" y1="2" x2="26" y2="28" stroke="#2d2d2d" strokeWidth="1" strokeDasharray="3 3" />
              </svg>
            </div>

          </div>

          {/* Imagen del jugador — placeholder con silueta */}
          <div className="relative z-10 flex items-end justify-center h-full w-full pb-0">
            <div className="relative w-[320px] h-[420px] flex items-end justify-center">
              {/* Silueta SVG de jugador celebrando */}
              <svg viewBox="0 0 300 420" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
                {/* Cabeza */}
                <circle cx="150" cy="52" r="28" fill="#1a1a1a" />
                {/* Cuerpo/torso */}
                <path d="M110 80 Q150 75 190 80 L195 180 Q150 185 105 180 Z" fill="#1a1a1a" />
                {/* Número */}
                <text x="150" y="148" textAnchor="middle" fontSize="36" fontWeight="800" fill="#4ade80">V</text>
                {/* Brazo izquierdo extendido */}
                <path d="M110 90 L40 50 L35 55 L105 100" fill="#1a1a1a" />
                {/* Brazo derecho extendido */}
                <path d="M190 90 L260 50 L265 55 L195 100" fill="#1a1a1a" />
                {/* Shorts */}
                <path d="M108 178 L100 260 L130 260 L150 200 L170 260 L200 260 L192 178 Z" fill="#111" />
                {/* Pierna izquierda */}
                <path d="M100 258 L95 380 L88 380 L88 395 L125 395 L125 380 L118 380 L128 258 Z" fill="#1a1a1a" />
                {/* Pierna derecha */}
                <path d="M172 258 L182 380 L175 380 L175 395 L212 395 L212 380 L205 380 L200 258 Z" fill="#1a1a1a" />
                {/* Botas */}
                <rect x="85" y="392" width="43" height="12" rx="4" fill="#22c55e" />
                <rect x="172" y="392" width="43" height="12" rx="4" fill="#22c55e" />
              </svg>
            </div>
          </div>
        </div>

        {/* ====== DERECHA — Formulario ====== */}
        <div className="w-full lg:w-[52%] bg-[#0e0e0e] p-8 sm:p-10 lg:p-14 flex flex-col justify-center">
          {children}
        </div>

      </div>
    </div>
  )
}
