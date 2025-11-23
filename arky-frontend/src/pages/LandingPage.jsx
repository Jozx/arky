import React, { useState } from 'react';
import {
    Menu,
    X,
    ArrowRight,
    Instagram,
    Mail,
    Phone,
    Building2,
    PenTool,
    Ruler,
    HardHat,
    Home,
    CheckCircle2,
    Users,
    Lightbulb
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

// Datos Parametrizados
const contactEmail = "arq.rodrigogonzaleza@gmail.com";
const contactPhone = "+595 971 428 333";
const instagramLink = "https://www.instagram.com/r.g.a.arquitectura/";

export default function LandingPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMenuOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-gray-900 font-sans text-neutral-800 dark:text-gray-200 transition-colors duration-300">
            {/* 1. Header */}
            <header className="fixed w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm z-50 transition-all duration-300 border-b border-transparent dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <span className="text-2xl font-bold tracking-widest text-neutral-900 dark:text-white">
                                R.G.A.<span className="text-blue-900 dark:text-blue-400">ARQUITECTURA</span>
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex space-x-8 items-center">
                            <button onClick={() => scrollToSection('servicios')} className="text-neutral-600 dark:text-gray-300 hover:text-blue-900 dark:hover:text-blue-400 font-medium transition-colors">Servicios</button>
                            <button onClick={() => scrollToSection('nosotros')} className="text-neutral-600 dark:text-gray-300 hover:text-blue-900 dark:hover:text-blue-400 font-medium transition-colors">Nosotros</button>
                            <button onClick={() => scrollToSection('contacto')} className="text-neutral-600 dark:text-gray-300 hover:text-blue-900 dark:hover:text-blue-400 font-medium transition-colors">Contacto</button>
                            <ThemeToggle />
                            <Link to="/login">
                                <button className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 py-2 rounded-full font-medium hover:bg-blue-900 dark:hover:bg-blue-100 transition-colors duration-300">
                                    Login
                                </button>
                            </Link>
                        </nav>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center gap-4">
                            <ThemeToggle />
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-neutral-900 dark:text-white p-2">
                                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white dark:bg-gray-900 border-t border-neutral-100 dark:border-gray-800 absolute w-full">
                        <div className="px-4 pt-2 pb-6 space-y-2 shadow-lg">
                            <button onClick={() => scrollToSection('servicios')} className="block w-full text-left px-3 py-3 text-neutral-600 dark:text-gray-300 font-medium hover:bg-neutral-50 dark:hover:bg-gray-800 rounded-md">Servicios</button>
                            <button onClick={() => scrollToSection('nosotros')} className="block w-full text-left px-3 py-3 text-neutral-600 dark:text-gray-300 font-medium hover:bg-neutral-50 dark:hover:bg-gray-800 rounded-md">Nosotros</button>
                            <button onClick={() => scrollToSection('contacto')} className="block w-full text-left px-3 py-3 text-neutral-600 dark:text-gray-300 font-medium hover:bg-neutral-50 dark:hover:bg-gray-800 rounded-md">Contacto</button>
                            <Link to="/login" className="block w-full">
                                <button className="w-full mt-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 py-3 rounded-md font-medium hover:bg-blue-900 dark:hover:bg-blue-100 transition-colors">
                                    Acceso Clientes
                                </button>
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            {/* 2. Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 bg-[url('https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-bold text-neutral-900 dark:text-white tracking-tight mb-8 leading-tight">
                            Diseñamos Espacios que <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-neutral-600 dark:from-blue-400 dark:to-gray-400">Inspiran Vida</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-neutral-600 dark:text-gray-300 mb-12 font-light leading-relaxed">
                            Arquitectura contemporánea, funcional y sostenible. Transformamos tus ideas en realidades tangibles con un enfoque integral y personalizado.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                onClick={() => scrollToSection('contacto')}
                                className="px-8 py-4 bg-blue-900 dark:bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-800 dark:hover:bg-blue-500 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                Inicia tu Proyecto Ahora <ArrowRight size={20} />
                            </button>
                            <Link to="/login">
                                <button className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 text-neutral-900 dark:text-white border-2 border-neutral-200 dark:border-gray-700 rounded-lg font-semibold text-lg hover:border-blue-900 dark:hover:border-blue-400 hover:text-blue-900 dark:hover:text-blue-400 transition-all flex items-center justify-center gap-2">
                                    <Users size={20} /> Acceso a Clientes (ARKY)
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Services Section */}
            <section id="servicios" className="py-24 bg-white dark:bg-gray-900 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-sm font-bold text-blue-900 dark:text-blue-400 uppercase tracking-widest mb-2">Nuestros Servicios</h2>
                        <h3 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">Soluciones Integrales de Arquitectura</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ServiceCard
                            icon={<PenTool className="w-8 h-8 text-blue-900 dark:text-blue-400" />}
                            title="Proyecto Ejecutivo"
                            description="Planos detallados, especificaciones técnicas y documentación completa para la correcta ejecución de la obra."
                        />
                        <ServiceCard
                            icon={<Building2 className="w-8 h-8 text-blue-900 dark:text-blue-400" />}
                            title="Dirección de Obras"
                            description="Supervisión técnica rigurosa para asegurar que la construcción cumpla con los estándares de calidad y diseño."
                        />
                        <ServiceCard
                            icon={<Home className="w-8 h-8 text-blue-900 dark:text-blue-400" />}
                            title="Diseño Residencial"
                            description="Creación de hogares únicos, adaptados al estilo de vida y necesidades de cada familia."
                        />
                        <ServiceCard
                            icon={<Ruler className="w-8 h-8 text-blue-900 dark:text-blue-400" />}
                            title="Relevamiento"
                            description="Medición y digitalización precisa de edificaciones existentes para reformas o regularizaciones."
                        />
                        <ServiceCard
                            icon={<Lightbulb className="w-8 h-8 text-blue-900 dark:text-blue-400" />}
                            title="Asesoramiento"
                            description="Consultoría experta en viabilidad, normativas y optimización de recursos para tus inversiones."
                        />
                        <ServiceCard
                            icon={<CheckCircle2 className="w-8 h-8 text-blue-900 dark:text-blue-400" />}
                            title="Regularización Municipal"
                            description="Gestión integral de trámites y planos para la aprobación municipal de obras nuevas o existentes."
                        />
                        <ServiceCard
                            icon={<HardHat className="w-8 h-8 text-blue-900 dark:text-blue-400" />}
                            title="Construcción"
                            description="Ejecución de obra llave en mano, garantizando plazos, costos y calidad constructiva."
                        />
                        <ServiceCard
                            icon={<Users className="w-8 h-8 text-blue-900 dark:text-blue-400" />}
                            title="Diseño de Interiores"
                            description="Ambientación y diseño de mobiliario para potenciar la funcionalidad y estética de cada espacio."
                        />
                    </div>
                </div>
            </section>

            {/* 4. Portfolio/About Section */}
            <section id="nosotros" className="py-24 bg-neutral-900 dark:bg-black text-white relative overflow-hidden transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-2">Sobre Nosotros</h2>
                            <h3 className="text-3xl md:text-4xl font-bold mb-6">Pasión por el Detalle y la Excelencia</h3>
                            <p className="text-neutral-300 text-lg leading-relaxed mb-6">
                                En R.G.A. Arquitectura, creemos que cada proyecto es una oportunidad para mejorar la calidad de vida de las personas. Nuestro enfoque combina la estética contemporánea con la funcionalidad práctica, asegurando espacios que perduran en el tiempo.
                            </p>
                            <p className="text-neutral-300 text-lg leading-relaxed mb-8">
                                Nos especializamos en brindar un servicio personalizado, acompañando a nuestros clientes desde el primer boceto hasta la entrega final de la obra.
                            </p>
                            <a
                                href={instagramLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-white border-b-2 border-blue-500 pb-1 hover:text-blue-400 transition-colors"
                            >
                                <Instagram size={20} />
                                Ver nuestro portafolio en Instagram
                            </a>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-blue-900/20 rounded-xl transform rotate-3"></div>
                            <img
                                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80"
                                alt="Arquitectura Moderna"
                                className="relative rounded-xl shadow-2xl w-full object-cover h-[500px]"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Footer/Contact Section */}
            <footer id="contacto" className="bg-neutral-50 dark:bg-gray-900 pt-24 pb-12 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
                        <div>
                            <span className="text-2xl font-bold tracking-widest text-neutral-900 dark:text-white block mb-6">
                                R.G.A.<span className="text-blue-900 dark:text-blue-400">ARQUITECTURA</span>
                            </span>
                            <p className="text-neutral-600 dark:text-gray-400 mb-6">
                                Construyendo sueños, diseñando futuro. Contáctanos para hacer realidad tu próximo proyecto.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Contacto</h4>
                            <div className="space-y-4">
                                <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 text-neutral-600 dark:text-gray-400 hover:text-blue-900 dark:hover:text-blue-400 transition-colors">
                                    <Mail size={20} className="text-blue-900 dark:text-blue-400" />
                                    {contactEmail}
                                </a>
                                <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-neutral-600 dark:text-gray-400 hover:text-blue-900 dark:hover:text-blue-400 transition-colors">
                                    <Phone size={20} className="text-blue-900 dark:text-blue-400" />
                                    {contactPhone}
                                </a>
                                <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-neutral-600 dark:text-gray-400 hover:text-blue-900 dark:hover:text-blue-400 transition-colors">
                                    <Instagram size={20} className="text-blue-900 dark:text-blue-400" />
                                    @r.g.a.arquitectura
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Horario de Atención</h4>
                            <p className="text-neutral-600 dark:text-gray-400 mb-2">Lunes a Viernes</p>
                            <p className="font-semibold text-neutral-900 dark:text-white mb-4">08:00 - 18:00</p>
                            <p className="text-neutral-600 dark:text-gray-400 mb-2">Sábados</p>
                            <p className="font-semibold text-neutral-900 dark:text-white">09:00 - 12:00</p>
                        </div>
                    </div>

                    <div className="border-t border-neutral-200 dark:border-gray-800 pt-8 text-center">
                        <p className="text-neutral-500 dark:text-gray-500 text-sm">
                            &copy; {new Date().getFullYear()} R.G.A. Arquitectura. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Componente auxiliar para tarjetas de servicios
function ServiceCard({ icon, title, description }) {
    return (
        <div className="bg-neutral-50 dark:bg-gray-800 p-8 rounded-xl hover:shadow-lg transition-all duration-300 border border-neutral-100 dark:border-gray-700 group">
            <div className="mb-6 p-4 bg-white dark:bg-gray-700 rounded-lg inline-block shadow-sm group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h4 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">{title}</h4>
            <p className="text-neutral-600 dark:text-gray-300 leading-relaxed">
                {description}
            </p>
        </div>
    );
}
