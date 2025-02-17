import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  isDepartmentHead: boolean("is_department_head").notNull().default(false),
  departmentId: integer("department_id"),
});

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  departmentId: integer("department_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(3, "Full name is required"),
  email: z.string().email("Invalid email address"),
}).omit({ 
  isAdmin: true, 
  isDepartmentHead: true,
  departmentId: true 
});

export const insertDepartmentSchema = createInsertSchema(departments);

export const insertComplaintSchema = createInsertSchema(complaints).omit({
  id: true,
  userId: true,
  createdAt: true,
  status: true,
  departmentId: true,
}).extend({
  type: z.enum(["COMPLAINT", "QUERY", "SUGGESTION"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departments.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Complaint = typeof complaints.$inferSelect;

// Lista de departamentos predefinidos
export const DEPARTMENT_LIST = [
  { name: "Departamento de Vialidad", description: "Gestión de infraestructura vial" },
  { name: "Departamento de Educación", description: "Gestión educativa municipal" },
  { name: "Departamento de Obras Públicas", description: "Gestión de obras municipales" },
  { name: "Departamento de Seguridad", description: "Gestión de seguridad ciudadana" },
  { name: "Departamento de Salud", description: "Gestión de salud municipal" },
  { name: "Departamento de Desarrollo Social", description: "Gestión de programas sociales" },
];