import React from 'react';
import { Shield, Zap, Lock, ChevronRight, FileText, MapPin } from 'lucide-react';

interface Props {
    onStart: () => void;
}

export const HomePage: React.FC<Props> = ({ onStart }) => {
    return (
        <div className="min-h-full flex flex-col relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center max-w-5xl mx-auto">

                {/* Hero Section */}
                <div className="mb-12 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 text-xs font-medium text-zinc-400 mb-6 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Sistema de Estructuración Ciudadana v2.5
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
                        <span className="text-white">Tu voz tiene</span>
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-purple-600">
                            Poder Legal
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-8">
                        Estructure su reporte de manera segura, auditable y bajo gobernanza de inteligencia.
                        Transformamos la fragmentación en un activo legal para las autoridades.
                    </p>

                    <button
                        onClick={onStart}
                        className="group relative px-8 py-4 rounded-full font-bold text-white text-lg overflow-hidden transition-all hover:scale-105 shadow-[0_0_40px_rgba(236,72,153,0.3)] hover:shadow-[0_0_60px_rgba(236,72,153,0.5)]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 transition-all duration-300"></div>
                        <span className="relative flex items-center gap-3">
                            Iniciar Denuncia
                            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left animate-fade-in-up delay-100">
                    <FeatureCard
                        icon={<Shield className="text-pink-500" size={24} />}
                        title="Lógica Procedural"
                        description="Nuestra infraestructura analiza la competencia y estructura la denuncia con rigor jurídico."
                    />
                    <FeatureCard
                        icon={<Lock className="text-purple-500" size={24} />}
                        title="100% Anónimo"
                        description="Protegemos tu identidad con encriptación de grado militar. Tú decides qué compartir."
                    />
                    <FeatureCard
                        icon={<MapPin className="text-red-500" size={24} />}
                        title="Geolocalización"
                        description="Ubicación exacta del incidente para una respuesta más rápida de las autoridades."
                    />
                </div>

            </div>

            {/* Footer */}
            <footer className="relative z-10 p-6 text-center text-zinc-600 text-sm">
                <p>© 2026 Esoteria Governance Infrastructure. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all backdrop-blur-sm group">
        <div className="mb-4 p-3 rounded-xl bg-zinc-950 border border-zinc-800 w-fit group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
    </div>
);
