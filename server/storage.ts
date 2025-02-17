import { users, complaints, departments, type User, type InsertUser, type Complaint, type Department, type InsertDepartment, DEPARTMENT_LIST } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getComplaintsByUserId(userId: number): Promise<Complaint[]>;
  getComplaintsByDepartmentId(departmentId: number): Promise<Complaint[]>;
  createComplaint(complaint: Omit<Complaint, "id" | "createdAt">): Promise<Complaint>;
  getAllUsers(): Promise<User[]>;
  getAllComplaints(): Promise<Complaint[]>;
  updateComplaintStatus(id: number, status: string): Promise<Complaint>;
  assignComplaintToDepartment(id: number, departmentId: number): Promise<Complaint>;
  getDepartments(): Promise<Department[]>;
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  initializeDepartments(): Promise<void>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getComplaintsByUserId(userId: number): Promise<Complaint[]> {
    return db.select().from(complaints).where(eq(complaints.userId, userId));
  }

  async getComplaintsByDepartmentId(departmentId: number): Promise<Complaint[]> {
    return db.select().from(complaints).where(eq(complaints.departmentId, departmentId));
  }

  async createComplaint(
    complaint: Omit<Complaint, "id" | "createdAt">,
  ): Promise<Complaint> {
    const [newComplaint] = await db
      .insert(complaints)
      .values(complaint)
      .returning();
    return newComplaint;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getAllComplaints(): Promise<Complaint[]> {
    return db.select().from(complaints);
  }

  async updateComplaintStatus(id: number, status: string): Promise<Complaint> {
    const [complaint] = await db
      .update(complaints)
      .set({ status })
      .where(eq(complaints.id, id))
      .returning();

    if (!complaint) {
      throw new Error("Complaint not found");
    }

    return complaint;
  }

  async assignComplaintToDepartment(id: number, departmentId: number): Promise<Complaint> {
    const [complaint] = await db
      .update(complaints)
      .set({ 
        departmentId,
        status: "processing" // Actualizar estado al asignar departamento
      })
      .where(eq(complaints.id, id))
      .returning();

    if (!complaint) {
      throw new Error("Complaint not found");
    }

    return complaint;
  }

  async getDepartments(): Promise<Department[]> {
    return db.select().from(departments);
  }

  async getDepartment(id: number): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department;
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const [newDepartment] = await db
      .insert(departments)
      .values(department)
      .returning();
    return newDepartment;
  }

  async initializeDepartments(): Promise<void> {
    const existingDepartments = await this.getDepartments();
    if (existingDepartments.length === 0) {
      for (const dept of DEPARTMENT_LIST) {
        await this.createDepartment(dept);
      }
    }
  }
}

export const storage = new DatabaseStorage();