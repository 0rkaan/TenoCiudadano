import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertComplaintSchema } from "@shared/schema";
import { z } from "zod";
import { db, users } from './db';
import { eq } from 'drizzle-orm';

function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).send("No autenticado");
  }
  if (!req.user?.isAdmin) {
    return res.status(403).send("No autorizado");
  }
  next();
}

function isDepartmentHead(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).send("No autenticado");
  }
  if (!req.user?.isDepartmentHead) {
    return res.status(403).send("No autorizado");
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Initialize departments if needed
  await storage.initializeDepartments();

  // Admin routes
  app.get("/api/admin/users", isAdmin, async (_req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.get("/api/admin/complaints", isAdmin, async (_req, res) => {
    const complaints = await storage.getAllComplaints();
    res.json(complaints);
  });

  app.patch("/api/admin/complaints/:id/status", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const status = z.enum(["pending", "processing", "resolved", "rejected"])
      .parse(req.body.status);

    try {
      const complaint = await storage.updateComplaintStatus(id, status);
      res.json(complaint);
    } catch (error) {
      res.status(404).json({ message: "Complaint not found" });
    }
  });

  app.patch("/api/admin/complaints/:id/department", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const departmentId = z.number().int().positive().parse(req.body.departmentId);

    try {
      const complaint = await storage.assignComplaintToDepartment(id, departmentId);
      res.json(complaint);
    } catch (error) {
      res.status(404).json({ message: "Complaint not found" });
    }
  });

  // User role management
  app.patch("/api/admin/users/:id/role", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const { isDepartmentHead, departmentId } = z.object({
      isDepartmentHead: z.boolean(),
      departmentId: z.number().int().positive().nullable(),
    }).parse(req.body);

    try {
      const [user] = await db
        .update(users)
        .set({ isDepartmentHead, departmentId })
        .where(eq(users.id, id))
        .returning();

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar el usuario" });
    }
  });

  // Department head routes
  app.get("/api/department/complaints", isDepartmentHead, async (req, res) => {
    if (!req.user?.departmentId) {
      return res.status(400).json({ message: "Usuario no asignado a un departamento" });
    }

    const complaints = await storage.getComplaintsByDepartmentId(req.user.departmentId);
    res.json(complaints);
  });

  app.patch("/api/department/complaints/:id/status", isDepartmentHead, async (req, res) => {
    const id = parseInt(req.params.id);
    const status = z.enum(["processing", "resolved", "rejected"])
      .parse(req.body.status);

    try {
      // Verificar que la queja pertenece al departamento del jefe
      const complaints = await storage.getComplaintsByDepartmentId(req.user!.departmentId!);
      const complaint = complaints.find(c => c.id === id);

      if (!complaint) {
        return res.status(403).json({ message: "La solicitud no pertenece a su departamento" });
      }

      const updatedComplaint = await storage.updateComplaintStatus(id, status);
      res.json(updatedComplaint);
    } catch (error) {
      res.status(404).json({ message: "Solicitud no encontrada" });
    }
  });

  // Department routes (public)
  app.get("/api/departments", async (_req, res) => {
    const departments = await storage.getDepartments();
    res.json(departments);
  });

  // Regular user routes
  app.get("/api/complaints", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("No autenticado");
    }

    const complaints = await storage.getComplaintsByUserId(req.user!.id);
    res.json(complaints);
  });

  app.post("/api/complaints", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("No autenticado");
    }

    try {
      const data = insertComplaintSchema.parse(req.body);
      const complaint = await storage.createComplaint({
        ...data,
        userId: req.user!.id,
        status: "pending",
        departmentId: null, // Inicialmente no está asignado a ningún departamento
      });
      res.status(201).json(complaint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(error.errors);
      } else {
        res.status(500).json({ message: "Error interno del servidor" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}