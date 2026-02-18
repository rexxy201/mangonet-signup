import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  submissions,
  settings,
  adminUsers,
  type InsertSubmission,
  type Submission,
  type AdminUser,
} from "@shared/schema";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

export interface IStorage {
  createSubmission(data: InsertSubmission): Promise<Submission>;
  getSubmissions(): Promise<Submission[]>;
  getSubmission(id: string): Promise<Submission | undefined>;
  updateSubmissionStatus(id: string, status: string): Promise<Submission | undefined>;
  updateSubmissionPayment(id: string, paymentRef: string): Promise<Submission | undefined>;
  getSetting(key: string): Promise<string | undefined>;
  setSetting(key: string, value: string): Promise<void>;
  getAdminByUsername(username: string): Promise<AdminUser | undefined>;
  getAdminUsers(): Promise<AdminUser[]>;
  createAdmin(username: string, password: string, role?: string): Promise<AdminUser>;
  deleteAdmin(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createSubmission(data: InsertSubmission): Promise<Submission> {
    const [result] = await db.insert(submissions).values(data).returning();
    return result;
  }

  async getSubmissions(): Promise<Submission[]> {
    return db.select().from(submissions).orderBy(submissions.submittedAt);
  }

  async getSubmission(id: string): Promise<Submission | undefined> {
    const [result] = await db.select().from(submissions).where(eq(submissions.id, id));
    return result;
  }

  async updateSubmissionStatus(id: string, status: string): Promise<Submission | undefined> {
    const [result] = await db
      .update(submissions)
      .set({ status })
      .where(eq(submissions.id, id))
      .returning();
    return result;
  }

  async updateSubmissionPayment(id: string, paymentRef: string): Promise<Submission | undefined> {
    const [result] = await db
      .update(submissions)
      .set({ status: "paid", paymentRef })
      .where(eq(submissions.id, id))
      .returning();
    return result;
  }

  async getSetting(key: string): Promise<string | undefined> {
    const [result] = await db.select().from(settings).where(eq(settings.key, key));
    return result?.value;
  }

  async setSetting(key: string, value: string): Promise<void> {
    const existing = await this.getSetting(key);
    if (existing !== undefined) {
      await db.update(settings).set({ value }).where(eq(settings.key, key));
    } else {
      await db.insert(settings).values({ key, value });
    }
  }

  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    const [result] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return result;
  }

  async getAdminUsers(): Promise<AdminUser[]> {
    return db.select().from(adminUsers);
  }

  async createAdmin(username: string, password: string, role: string = "admin"): Promise<AdminUser> {
    const [result] = await db.insert(adminUsers).values({ username, password, role }).returning();
    return result;
  }

  async deleteAdmin(id: string): Promise<void> {
    await db.delete(adminUsers).where(eq(adminUsers.id, id));
  }
}

export const storage = new DatabaseStorage();
