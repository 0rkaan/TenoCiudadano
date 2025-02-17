import { useQuery } from "@tanstack/react-query";
import type { Complaint } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const typeLabels: Record<string, string> = {
  COMPLAINT: "Reclamo",
  QUERY: "Consulta",
  SUGGESTION: "Sugerencia",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  processing: "En Proceso",
  resolved: "Resuelto",
  rejected: "Rechazado",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  processing: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  resolved: "bg-green-100 text-green-800 hover:bg-green-200",
  rejected: "bg-red-100 text-red-800 hover:bg-red-200",
};

export default function ComplaintList() {
  const { data: complaints, isLoading } = useQuery<Complaint[]>({
    queryKey: ["/api/complaints"],
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
      <div className="text-center py-8 text-muted-foreground">
        No hay solicitudes registradas.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {complaints.map((complaint) => (
          <TableRow key={complaint.id}>
            <TableCell>
              {format(new Date(complaint.createdAt), "dd/MM/yyyy")}
            </TableCell>
            <TableCell>{typeLabels[complaint.type] || complaint.type}</TableCell>
            <TableCell className="max-w-md truncate">
              {complaint.description}
            </TableCell>
            <TableCell>
              <Badge
                variant="secondary"
                className={statusColors[complaint.status] || ""}
              >
                {statusLabels[complaint.status] || complaint.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}