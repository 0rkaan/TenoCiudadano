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
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Complaint } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const statusOptions = [
  { value: "processing", label: "En Proceso" },
  { value: "resolved", label: "Resuelto" },
  { value: "rejected", label: "Rechazado" },
];

export default function DepartmentHeadPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Redirect if user is not department head
  if (!user?.isDepartmentHead) {
    return <Redirect to="/" />;
  }

  const { data: complaints, isLoading } = useQuery<Complaint[]>({
    queryKey: ["/api/department/complaints"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest(
        "PATCH",
        `/api/department/complaints/${id}/status`,
        { status }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/department/complaints"] });
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!complaints?.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Panel de Departamento</h1>
        <div className="text-center py-8 text-muted-foreground">
          No hay solicitudes asignadas a su departamento.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Panel de Departamento</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {complaints.map((complaint) => (
            <TableRow key={complaint.id}>
              <TableCell>{complaint.id}</TableCell>
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
                {new Date(complaint.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
