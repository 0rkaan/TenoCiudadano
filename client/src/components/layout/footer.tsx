export default function Footer() {
  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-700">
          <div className="transition-all hover:translate-y-[-2px] duration-200">
            <h3 className="font-semibold mb-4 text-white/90">Contacto</h3>
            <p className="text-sm text-white/70">
              Arturo Prat 298, Teno<br />
              Teléfono: (75) 241 4100<br />
              Email: contacto@teno.cl
            </p>
          </div>
          <div className="transition-all hover:translate-y-[-2px] duration-200">
            <h3 className="font-semibold mb-4 text-white/90">Horario de Atención</h3>
            <p className="text-sm text-white/70">
              Lunes a Viernes<br />
              8:30 - 14:00 hrs<br />
              15:00 - 17:30 hrs
            </p>
          </div>
          <div className="transition-all hover:translate-y-[-2px] duration-200">
            <h3 className="font-semibold mb-4 text-white/90">Enlaces Útiles</h3>
            <ul className="text-sm text-white/70 space-y-2">
              <li className="hover:text-white transition-colors cursor-pointer">
                Transparencia Municipal
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                Trámites Online
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                Portal de Pagos
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-white/60">
          © {new Date().getFullYear()} Municipalidad de Teno. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}