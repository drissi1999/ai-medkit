CREATE TABLE `analytics` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`action_type` text NOT NULL,
	`details` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `chat_conversations` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`title` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` integer PRIMARY KEY NOT NULL,
	`conversation_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`message` text NOT NULL,
	`response` text,
	`message_type` text DEFAULT 'question',
	`ai_model_used` text,
	`response_time_ms` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `image_analyses` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`image_type` text NOT NULL,
	`image_path` text NOT NULL,
	`image_name` text NOT NULL,
	`file_size` integer,
	`analysis_result` text,
	`confidence_score` real,
	`diagnosis` text,
	`recommendations` text,
	`status` text DEFAULT 'processing',
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`analysis_completed_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`report_type` text,
	`related_id` integer,
	`report_data` text,
	`pdf_path` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`specialization` text,
	`hospital_name` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `voice_examinations` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`exam_type` text NOT NULL,
	`patient_context` text,
	`audio_file_path` text,
	`transcript` text,
	`summary` text,
	`diagnosis` text,
	`recommendations` text,
	`confidence_score` real,
	`duration_seconds` integer,
	`status` text DEFAULT 'recording',
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`completed_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
