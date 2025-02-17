import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Header() {
  const { user, logoutMutation } = useAuth();

  return (
    <header className="bg-primary text-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between transition-all duration-200 ease-in-out">
        <div className="flex items-center gap-4">
          <Link href="/">
            <span className="text-xl font-bold hover:opacity-80 transition-opacity cursor-pointer">
              Municipalidad de Teno
            </span>
          </Link>
        </div>

        {user && (
          <div className="flex items-center gap-4 animate-in slide-in-from-right duration-500">
            <span className="text-sm text-white/80">
              Bienvenido, {user.fullName}
            </span>
            {user.isAdmin && (
              <Link href="/admin">
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="hover:bg-white/90 transition-colors"
                >
                  Panel Admin
                </Button>
              </Link>
            )}
            {user.isDepartmentHead && (
              <Link href="/department">
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="hover:bg-white/90 transition-colors"
                >
                  Panel Departamento
                </Button>
              </Link>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="hover:bg-white/90 transition-colors"
            >
              Cerrar Sesión
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}