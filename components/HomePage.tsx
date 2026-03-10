import React from 'react';
import { Shield, Zap, Lock, ChevronRight, FileText, MapPin } from 'lucide-react';

interface Props {
    onStart: () => void;
}

export const HomePage: React.FC<Props> = ({ onStart }) => {
    return (
        <div className="min-h-full flex flex-col relative overflow-hidden">
            {/* Background Effects — Esoteria Blue Edge Glow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[150px]"></div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center max-w-5xl mx-auto">

                {/* Hero Section */}
                <div className="mb-12 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-zinc-800 text-xs font-mono text-zinc-500 mb-6 backdrop-blur-sm">
                        <span className="text-red-600">&gt;</span>
                        Infraestructura de Inteligencia Pública v3.0
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 font-mono">
                        <span className="text-white">Tu voz tiene</span>
                        <br />
                        <span className="text-red-600">
                            Poder Legal
                        </span>
                    </h1>

                    <p className="text-base md:text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed mb-8 font-mono">
                        Estructure su reporte de manera segura, auditable y bajo gobernanza de inteligencia.
                        Transformamos la fragmentación en un activo legal para las autoridades.
                    </p>

                    <button
                        onClick={onStart}
                        className="group relative px-8 py-4 font-bold text-white text-lg overflow-hidden transition-all hover:scale-105 shadow-[0_0_30px_rgba(204,0,0,0.2)] hover:shadow-[0_0_50px_rgba(204,0,0,0.4)] bg-red-800 hover:bg-red-700 border border-red-700"
                    >
                        <span className="relative flex items-center gap-3 font-mono">
                            &gt; Iniciar Denuncia
                            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left animate-fade-in-up delay-100">
                    <FeatureCard
                        icon={<Shield className="text-red-600" size={24} />}
                        title="> Lógica Procedural"
                        description="Nuestra infraestructura analiza la competencia y estructura la denuncia con rigor jurídico."
                    />
                    <FeatureCard
                        icon={<Lock className="text-zinc-400" size={24} />}
                        title="> 100% Anónimo"
                        description="Protegemos tu identidad con encriptación de grado militar. Tú decides qué compartir."
                    />
                    <FeatureCard
                        icon={<MapPin className="text-zinc-400" size={24} />}
                        title="> Geolocalización"
                        description="Ubicación exacta del incidente para una respuesta más rápida de las autoridades."
                    />
                </div>

            </div>

            {/* Footer */}
            <footer className="relative z-10 p-6 text-center text-zinc-600 text-xs font-mono">
                <p>© 2026 Esoteria Intelligence Infrastructure. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="p-6 bg-zinc-950/60 border border-zinc-800/60 hover:border-zinc-700 transition-all backdrop-blur-sm group">
        <div className="mb-4 p-3 bg-zinc-900 border border-zinc-800 w-fit group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-base font-bold text-white mb-2 font-mono">{title}</h3>
        <p className="text-zinc-500 text-sm leading-relaxed font-mono">{description}</p>
    </div>
);
