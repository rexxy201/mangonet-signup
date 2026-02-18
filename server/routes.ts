import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { insertSubmissionSchema } from "@shared/schema";
import { sendSubmissionEmail } from "./email";

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = "MangoNet@2026";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/submissions", async (req, res) => {
    try {
      const data = req.body;
      if (data.installationDate) {
        data.installationDate = new Date(data.installationDate).toISOString();
      }
      const parsed = insertSubmissionSchema.parse(data);
      const submission = await storage.createSubmission(parsed);
      res.status(201).json(submission);
    } catch (error: any) {
      console.error("Submission error:", error);
      res.status(400).json({ message: error.message || "Invalid submission data" });
    }
  });

  app.get("/api/submissions", async (_req, res) => {
    try {
      const subs = await storage.getSubmissions();
      res.json(subs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/submissions/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!["pending", "paid", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const updated = await storage.updateSubmissionStatus(id, status);
      if (!updated) {
        return res.status(404).json({ message: "Submission not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (username) {
        const user = await storage.getAdminByUsername(username);
        if (user && await bcrypt.compare(password, user.password)) {
          res.json({ success: true, role: user.role || "admin" });
          return;
        }
      }

      const storedHash = await storage.getSetting("admin_password_hash");
      let isValid = false;
      if (storedHash) {
        isValid = await bcrypt.compare(password, storedHash);
      } else {
        isValid = password === DEFAULT_PASSWORD;
      }
      if (isValid) {
        res.json({ success: true, role: "admin" });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/change-password", async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }
      const storedHash = await storage.getSetting("admin_password_hash");
      let isCurrentValid = false;
      if (storedHash) {
        isCurrentValid = await bcrypt.compare(currentPassword, storedHash);
      } else {
        isCurrentValid = currentPassword === DEFAULT_PASSWORD;
      }
      if (!isCurrentValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
      await storage.setSetting("admin_password_hash", newHash);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/submissions/:id/payment", async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentRef } = req.body;
      if (!paymentRef) {
        return res.status(400).json({ message: "Payment reference is required" });
      }

      const paystackSecretKey = await storage.getSetting("paystack_secret_key");
      if (paystackSecretKey) {
        const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${paymentRef}`, {
          headers: { Authorization: `Bearer ${paystackSecretKey}` },
        });
        const verifyData = await verifyRes.json() as { status: boolean; data?: { status: string } };
        if (!verifyData.status || verifyData.data?.status !== "success") {
          return res.status(400).json({ message: "Payment verification failed" });
        }
      }

      const submission = await storage.updateSubmissionPayment(id, paymentRef);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      sendSubmissionEmail(submission).catch((err) =>
        console.error("Email send failed:", err)
      );
      res.json(submission);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/users", async (_req, res) => {
    try {
      const users = await storage.getAdminUsers();
      const safeUsers = users.map(u => ({ id: u.id, username: u.username, role: u.role || "admin" }));
      res.json(safeUsers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/users", async (req, res) => {
    try {
      const { username, password, role } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      const validRole = role === "standard" ? "standard" : "admin";
      const existing = await storage.getAdminByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await storage.createAdmin(username, hashedPassword, validRole);
      res.status(201).json({ id: user.id, username: user.username, role: user.role });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAdmin(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/settings/:key", async (req, res) => {
    try {
      const value = await storage.getSetting(req.params.key);
      res.json({ value: value || "" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/settings/:key", async (req, res) => {
    try {
      const { value } = req.body;
      await storage.setSetting(req.params.key, value);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
