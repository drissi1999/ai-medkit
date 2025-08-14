import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Medical Users Table
export const medicalUsers = pgTable("medical_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'doctor', 'nurse', 'admin', 'readonly'
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  licenseNumber: text("license_number"),
  department: text("department"),
  specialization: text("specialization"),
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Patients Table
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  mrn: text("mrn").notNull().unique(), // Medical Record Number
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  gender: text("gender").notNull(), // 'male', 'female', 'other', 'unknown'
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  emergencyContact: jsonb("emergency_contact"), // {name, phone, relationship}
  allergies: jsonb("allergies").default([]), // Array of strings
  medications: jsonb("medications").default([]), // Array of strings
  medicalHistory: jsonb("medical_history").default([]), // Array of strings
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Medical Examinations Table
export const examinations = pgTable("examinations", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  type: text("type").notNull(), // 'routine', 'follow-up', 'emergency', 'consultation', 'procedure'
  chiefComplaint: text("chief_complaint").notNull(),
  historyOfPresentIllness: text("history_of_present_illness"),
  vitalSigns: jsonb("vital_signs"), // Complex object with temperature, BP, etc.
  physicalExam: text("physical_exam"),
  assessment: text("assessment"),
  plan: text("plan"),
  prescriptions: jsonb("prescriptions").default([]), // Array of prescription objects
  followUpInstructions: text("follow_up_instructions"),
  aiSummary: text("ai_summary"),
  aiRecommendations: jsonb("ai_recommendations").default([]), // Array of strings
  status: text("status").notNull().default('in-progress'), // 'in-progress', 'completed', 'cancelled'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// AI Chat Sessions Table
export const aiChatSessions = pgTable("ai_chat_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  patientId: integer("patient_id"),
  examinationId: integer("examination_id"),
  sessionType: text("session_type").notNull(), // 'general', 'patient-specific', 'decision-support', 'imaging-analysis'
  messages: jsonb("messages").default([]), // Array of message objects
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Medical Imaging Table
export const medicalImaging = pgTable("medical_imaging", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  examinationId: integer("examination_id"),
  type: text("type").notNull(), // 'xray', 'mri', 'ct', 'ultrasound', 'mammography', 'other'
  bodyPart: text("body_part").notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size").notNull(),
  aiAnalysis: jsonb("ai_analysis"), // {findings, confidence, recommendations, analysisDate}
  radiologistReport: text("radiologist_report"),
  status: text("status").notNull().default('pending'), // 'pending', 'analyzed', 'reviewed', 'completed'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Audit Logs Table for HIPAA Compliance
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(), // 'patient', 'examination', 'imaging', 'chat', 'user'
  resourceId: text("resource_id").notNull(),
  details: text("details"),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Lab Results Table
export const labResults = pgTable("lab_results", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  examinationId: integer("examination_id"),
  testType: text("test_type").notNull(),
  testName: text("test_name").notNull(),
  results: jsonb("results").notNull(), // Array of {parameter, value, unit, referenceRange, flag}
  orderedBy: integer("ordered_by").notNull(),
  collectedAt: timestamp("collected_at").notNull(),
  processedAt: timestamp("processed_at"),
  aiInterpretation: text("ai_interpretation"),
  status: text("status").notNull().default('ordered'), // 'ordered', 'collected', 'processing', 'completed', 'cancelled'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Create Zod schemas for validation
export const insertMedicalUserSchema = createInsertSchema(medicalUsers);
export const insertPatientSchema = createInsertSchema(patients);
export const insertExaminationSchema = createInsertSchema(examinations);
export const insertAiChatSessionSchema = createInsertSchema(aiChatSessions);
export const insertMedicalImagingSchema = createInsertSchema(medicalImaging);
export const insertAuditLogSchema = createInsertSchema(auditLogs);
export const insertLabResultSchema = createInsertSchema(labResults);

// Patient Schema for API validation
export const patientSchema = z.object({
  id: z.number().optional(),
  mrn: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.date(),
  gender: z.enum(['male', 'female', 'other', 'unknown']),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string(),
  }).optional(),
  allergies: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  medicalHistory: z.array(z.string()).default([]),
});

// Examination Schema for API validation
export const examinationSchema = z.object({
  id: z.number().optional(),
  patientId: z.number(),
  doctorId: z.number(),
  type: z.enum(['routine', 'follow-up', 'emergency', 'consultation', 'procedure']),
  chiefComplaint: z.string().min(1),
  historyOfPresentIllness: z.string().optional(),
  vitalSigns: z.object({
    temperature: z.number().optional(),
    bloodPressure: z.object({
      systolic: z.number(),
      diastolic: z.number(),
    }).optional(),
    heartRate: z.number().optional(),
    respiratoryRate: z.number().optional(),
    oxygenSaturation: z.number().optional(),
    weight: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
  physicalExam: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
  prescriptions: z.array(z.object({
    medication: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    duration: z.string(),
  })).default([]),
  followUpInstructions: z.string().optional(),
});

// AI Chat Message Schema
export const aiChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.date(),
  metadata: z.object({
    confidence: z.number().optional(),
    sources: z.array(z.string()).optional(),
    medicalReferences: z.array(z.string()).optional(),
  }).optional(),
});

// Export types
export type MedicalUser = typeof medicalUsers.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type Examination = typeof examinations.$inferSelect;
export type AiChatSession = typeof aiChatSessions.$inferSelect;
export type MedicalImaging = typeof medicalImaging.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type LabResult = typeof labResults.$inferSelect;

export type InsertMedicalUser = z.infer<typeof insertMedicalUserSchema>;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type InsertExamination = z.infer<typeof insertExaminationSchema>;
export type InsertAiChatSession = z.infer<typeof insertAiChatSessionSchema>;
export type InsertMedicalImaging = z.infer<typeof insertMedicalImagingSchema>;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type InsertLabResult = z.infer<typeof insertLabResultSchema>;

export type AiChatMessage = z.infer<typeof aiChatMessageSchema>;

// Legacy compatibility
export type User = MedicalUser;
export type InsertUser = InsertMedicalUser;
export const users = medicalUsers;
export const insertUserSchema = insertMedicalUserSchema;