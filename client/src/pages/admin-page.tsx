import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Redirect } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { User, Complaint, Department } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const statusOptions = [
  { value: "pending", label: "Pendiente" },
  { value: "processing", label: "En Proceso" },
  { value: "resolved", label: "Resuelto" },
  { value: "rejected", label: "Rechazado" },
];

export default function AdminPage() {
  const { user } = useAuth();

  // Redirect if user is not admin
  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>

      <Tabs defaultValue="complaints" className="w-full">
        <TabsList>
          <TabsTrigger value="complaints">Solicitudes</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
        </TabsList>

        <TabsContent value="complaints">
          <ComplaintsList />
        </TabsContent>

        <TabsContent value="users">
          <UsersList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UsersList() {
  const { toast } = useToast();
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: departments } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ 
      id, 
      isDepartmentHead, 
      departmentId 
    }: { 
      id: number; 
      isDepartmentHead: boolean; 
      departmentId: number | null;
    }) => {
      const res = await apiRequest(
        "PATCH",
        `/api/admin/users/${id}/role`,
        { isDepartmentHead, departmentId }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Rol actualizado",
        description: "El rol del usuario ha sido actualizado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!users?.length) {
    return <EmptyState message="No hay usuarios registrados." />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Usuario</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Roles</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.id}</TableCell>
            <TableCell>{user.username}</TableCell>
            <TableCell>{user.fullName}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                {user.isAdmin && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Administrador
                  </Badge>
                )}
                {user.isDepartmentHead && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Jefe de Departamento
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Gestionar Roles
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Gestionar Roles - {user.fullName}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium">
                        Jefe de Departamento:
                      </label>
                      <Select
                        disabled={user.isAdmin}
                        value={user.departmentId?.toString() || ""}
                        onValueChange={(value) => {
                          if (value === "") {
                            updateRoleMutation.mutate({
                              id: user.id,
                              isDepartmentHead: false,
                              departmentId: null,
                            });
                          } else {
                            updateRoleMutation.mutate({
                              id: user.id,
                              isDepartmentHead: true,
                              departmentId: parseInt(value),
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Seleccionar departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Ninguno</SelectItem>
                          {departments?.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ComplaintsList() {
  const { toast } = useToast();
  const { data: complaints, isLoading: complaintsLoading } = useQuery<Complaint[]>({
    queryKey: ["/api/admin/complaints"],
  });

  const { data: departments, isLoading: departmentsLoading } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest(
        "PATCH",
        `/api/admin/complaints/${id}/status`,
        { status }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/complaints"] });
      toast({
        title: "Estado actualizado",
        description: "El estado de la solicitud ha sido actualizado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const assignDepartmentMutation = useMutation({
    mutationFn: async ({ id, departmentId }: { id: number; departmentId: number }) => {
      const res = await apiRequest(
        "PATCH",
        `/api/admin/complaints/${id}/department`,
        { departmentId }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/complaints"] });
      toast({
        title: "Departamento asignado",
        description: "La solicitud ha sido asignada al departamento exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (complaintsLoading || departmentsLoading) {
    return <LoadingSpinner />;
  }

  if (!complaints?.length) {
    return <EmptyState message="No hay solicitudes registradas." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Solicitudes</h2>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complaints.map((complaint) => (
              <TableRow key={complaint.id}>
                <TableCell>{complaint.id}</TableCell>
                <TableCell>{complaint.userId}</TableCell>
                <TableCell>{complaint.type}</TableCell>
                <TableCell className="max-w-md truncate">
                  {complaint.description}
                </TableCell>
                <TableCell>
                  <Select
                    defaultValue={complaint.status}
                    onValueChange={(value) =>
                      updateStatusMutation.mutate({
                        id: complaint.id,
                        status: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    defaultValue={complaint.departmentId?.toString()}
                    onValueChange={(value) =>
                      assignDepartmentMutation.mutate({
                        id: complaint.id,
                        departmentId: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Asignar departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {new Date(complaint.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      {message}
    </div>
  );
}