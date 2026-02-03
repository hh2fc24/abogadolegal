import Link from "next/link";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    breadcrumb?: string;
}

const PageHeader = ({ title, subtitle, breadcrumb }: PageHeaderProps) => {
    return (
        <div className="bg-legal-navy text-white py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" /> {/* Placeholder pattern */}
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col gap-4">
                    <div className="text-legal-gold-500 text-sm font-bold uppercase tracking-widest">
                        <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
                        {breadcrumb && <span className="mx-2">/</span>}
                        {breadcrumb && <span>{breadcrumb}</span>}
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl font-bold">{title}</h1>
                    {subtitle && <p className="text-xl text-gray-300 max-w-2xl mt-2">{subtitle}</p>}
                </div>
            </div>
        </div>
    );
};

export default PageHeader;
