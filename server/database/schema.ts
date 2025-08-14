import { sqliteTable, integer, text, real, blob } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  specialization: text('specialization'),
  hospitalName: text('hospital_name'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const imageAnalyses = sqliteTable('image_analyses', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  imageType: text('image_type').notNull(),
  imagePath: text('image_path').notNull(),
  imageName: text('image_name').notNull(),
  fileSize: integer('file_size'),
  analysisResult: text('analysis_result'), // JSON as text in SQLite
  confidenceScore: real('confidence_score'),
  diagnosis: text('diagnosis'),
  recommendations: text('recommendations'),
  status: text('status').default('processing'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  analysisCompletedAt: text('analysis_completed_at')
});

export const voiceExaminations = sqliteTable('voice_examinations', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  examType: text('exam_type').notNull(),
  patientContext: text('patient_context'), // JSON as text
  audioFilePath: text('audio_file_path'),
  transcript: text('transcript'),
  summary: text('summary'),
  diagnosis: text('diagnosis'),
  recommendations: text('recommendations'),
  confidenceScore: real('confidence_score'),
  durationSeconds: integer('duration_seconds'),
  status: text('status').default('recording'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  completedAt: text('completed_at')
});

export const chatConversations = sqliteTable('chat_conversations', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const chatMessages = sqliteTable('chat_messages', {
  id: integer('id').primaryKey(),
  conversationId: integer('conversation_id').references(() => chatConversations.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  message: text('message').notNull(),
  response: text('response'),
  messageType: text('message_type').default('question'),
  aiModelUsed: text('ai_model_used'),
  responseTimeMs: integer('response_time_ms'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const analytics = sqliteTable('analytics', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  actionType: text('action_type').notNull(),
  details: text('details'), // JSON as text
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const reports = sqliteTable('reports', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  reportType: text('report_type'),
  relatedId: integer('related_id'),
  reportData: text('report_data'), // JSON as text
  pdfPath: text('pdf_path'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});
