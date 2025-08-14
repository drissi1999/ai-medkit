-- AI MedKit Database Schema
-- PostgreSQL 15+ with GDPR compliance features

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (Doctors)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    medical_license VARCHAR(50) UNIQUE,
    specialty VARCHAR(100),
    hospital_affiliation VARCHAR(255),
    phone VARCHAR(20),
    
    -- Authentication & Security
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    last_login TIMESTAMP,
    
    -- GDPR Compliance
    gdpr_consent BOOLEAN NOT NULL DEFAULT false,
    gdpr_consent_date TIMESTAMP,
    data_retention_until TIMESTAMP DEFAULT (NOW() + INTERVAL '7 years'),
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    
    -- Indexes for performance
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Patients table (encrypted PII)
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Patient identifiers (encrypted)
    patient_external_id VARCHAR(255), -- Hospital MRN or external ID
    
    -- Demographics (encrypted for GDPR)
    first_name_encrypted BYTEA,
    last_name_encrypted BYTEA,
    date_of_birth_encrypted BYTEA,
    gender VARCHAR(20),
    
    -- Contact info (encrypted)
    phone_encrypted BYTEA,
    email_encrypted BYTEA,
    address_encrypted BYTEA,
    
    -- Medical info (searchable but anonymized)
    blood_type VARCHAR(5),
    allergies JSONB DEFAULT '[]',
    chronic_conditions JSONB DEFAULT '[]',
    current_medications JSONB DEFAULT '[]',
    
    -- Emergency contacts (encrypted)
    emergency_contact_encrypted BYTEA,
    
    -- Privacy controls
    anonymized BOOLEAN DEFAULT false,
    data_retention_until TIMESTAMP DEFAULT (NOW() + INTERVAL '7 years'),
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_patients_doctor_id (doctor_id),
    INDEX idx_patients_external_id (patient_external_id),
    INDEX idx_patients_retention (data_retention_until)
);

-- Medical sessions (consultations)
CREATE TABLE medical_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    
    -- Session metadata
    session_type VARCHAR(50) DEFAULT 'consultation', -- consultation, follow_up, emergency
    session_status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled
    appointment_datetime TIMESTAMP,
    duration_minutes INTEGER,
    
    -- Clinical data
    chief_complaint TEXT,
    present_illness TEXT,
    vital_signs JSONB DEFAULT '{}', -- {"bp": "120/80", "hr": 72, "temp": 98.6}
    physical_exam JSONB DEFAULT '{}',
    assessment JSONB DEFAULT '[]', -- Diagnoses with ICD-10 codes
    plan JSONB DEFAULT '[]', -- Treatment plan
    
    -- AI-generated content
    ai_summary TEXT,
    ai_suggestions JSONB DEFAULT '[]',
    ai_confidence_scores JSONB DEFAULT '{}',
    
    -- Session recording metadata
    has_voice_recording BOOLEAN DEFAULT false,
    voice_recording_path VARCHAR(255),
    transcription_text TEXT,
    
    -- Privacy and compliance
    anonymized BOOLEAN DEFAULT false,
    data_retention_until TIMESTAMP DEFAULT (NOW() + INTERVAL '7 years'),
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_sessions_doctor_patient (doctor_id, patient_id),
    INDEX idx_sessions_datetime (appointment_datetime),
    INDEX idx_sessions_status (session_status),
    INDEX idx_sessions_retention (data_retention_until)
);

-- Chat messages within sessions
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES medical_sessions(id) ON DELETE CASCADE,
    
    -- Message content
    message_type VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    content_encrypted BYTEA, -- Encrypted version for sensitive data
    
    -- AI metadata
    ai_model VARCHAR(50), -- 'gpt-4', 'claude-3', etc.
    ai_confidence DECIMAL(3,2), -- 0.00 to 1.00
    tokens_used INTEGER,
    processing_time_ms INTEGER,
    
    -- Message context
    parent_message_id UUID REFERENCES chat_messages(id),
    medical_context JSONB DEFAULT '{}', -- Extracted medical entities
    
    -- Privacy
    contains_pii BOOLEAN DEFAULT false,
    anonymized BOOLEAN DEFAULT false,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_messages_session_id (session_id),
    INDEX idx_messages_created_at (created_at),
    INDEX idx_messages_type (message_type)
);

-- Lab results and medical tests
CREATE TABLE lab_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES medical_sessions(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Test information
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(100), -- 'blood', 'urine', 'imaging', etc.
    test_date TIMESTAMP NOT NULL,
    lab_name VARCHAR(255),
    reference_range VARCHAR(255),
    
    -- Results data
    results JSONB NOT NULL, -- Structured test results
    raw_data TEXT, -- Original lab report
    abnormal_flags JSONB DEFAULT '[]',
    
    -- AI analysis
    ai_interpretation TEXT,
    ai_flags JSONB DEFAULT '[]', -- Critical values, trends, etc.
    ai_confidence DECIMAL(3,2),
    
    -- File attachments
    report_file_path VARCHAR(255),
    report_file_type VARCHAR(50),
    
    -- Privacy
    anonymized BOOLEAN DEFAULT false,
    data_retention_until TIMESTAMP DEFAULT (NOW() + INTERVAL '7 years'),
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_lab_results_patient_id (patient_id),
    INDEX idx_lab_results_test_date (test_date),
    INDEX idx_lab_results_test_type (test_type)
);

-- Medical imaging files
CREATE TABLE medical_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES medical_sessions(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Image metadata
    image_type VARCHAR(50), -- 'xray', 'mri', 'ct', 'ultrasound'
    body_part VARCHAR(100),
    study_date TIMESTAMP,
    modality VARCHAR(20), -- DICOM modality
    
    -- File information
    file_path VARCHAR(255) NOT NULL,
    file_size BIGINT,
    file_format VARCHAR(20), -- 'DICOM', 'JPEG', 'PNG'
    dicom_metadata JSONB DEFAULT '{}',
    
    -- AI analysis
    ai_findings JSONB DEFAULT '[]',
    ai_annotations JSONB DEFAULT '[]', -- Bounding boxes, measurements
    ai_confidence DECIMAL(3,2),
    requires_radiologist_review BOOLEAN DEFAULT false,
    
    -- Privacy and compliance
    anonymized BOOLEAN DEFAULT false,
    phi_removed BOOLEAN DEFAULT false, -- PHI stripped from DICOM
    data_retention_until TIMESTAMP DEFAULT (NOW() + INTERVAL '7 years'),
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_medical_images_patient_id (patient_id),
    INDEX idx_medical_images_study_date (study_date),
    INDEX idx_medical_images_image_type (image_type)
);

-- Calendar appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    
    -- Appointment details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    appointment_datetime TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    appointment_type VARCHAR(50), -- 'consultation', 'follow_up', 'procedure'
    
    -- Status and logistics
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show
    location VARCHAR(255),
    is_virtual BOOLEAN DEFAULT false,
    meeting_link VARCHAR(255),
    
    -- External calendar integration
    external_calendar_id VARCHAR(255),
    external_event_id VARCHAR(255),
    calendar_provider VARCHAR(50), -- 'google', 'outlook', 'manual'
    
    -- Reminders and notifications
    reminder_sent BOOLEAN DEFAULT false,
    reminder_sent_at TIMESTAMP,
    patient_notified BOOLEAN DEFAULT false,
    
    -- Privacy
    anonymized BOOLEAN DEFAULT false,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_appointments_doctor_datetime (doctor_id, appointment_datetime),
    INDEX idx_appointments_patient_id (patient_id),
    INDEX idx_appointments_status (status),
    INDEX idx_appointments_external_id (external_calendar_id, external_event_id)
);

-- Email communications log
CREATE TABLE email_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    session_id UUID REFERENCES medical_sessions(id) ON DELETE SET NULL,
    
    -- Email details
    subject VARCHAR(255) NOT NULL,
    body_template VARCHAR(100), -- Template used
    recipient_email_encrypted BYTEA,
    sender_email VARCHAR(255),
    
    -- AI-generated content
    ai_generated_content TEXT,
    human_reviewed BOOLEAN DEFAULT false,
    reviewed_by UUID REFERENCES users(id),
    
    -- Delivery tracking
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    opened_at TIMESTAMP,
    email_provider VARCHAR(50), -- 'sendgrid', 'ses', 'smtp'
    external_message_id VARCHAR(255),
    
    -- Privacy and compliance
    contains_phi BOOLEAN DEFAULT false,
    gdpr_consent_verified BOOLEAN DEFAULT false,
    anonymized BOOLEAN DEFAULT false,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_email_communications_doctor_id (doctor_id),
    INDEX idx_email_communications_sent_at (sent_at)
);

-- Audit log for GDPR compliance
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Who performed the action
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255), -- Stored separately in case user is deleted
    ip_address INET,
    user_agent TEXT,
    
    -- What action was performed
    action VARCHAR(100) NOT NULL, -- 'login', 'view_patient', 'export_data', 'delete_data'
    resource_type VARCHAR(50), -- 'patient', 'session', 'lab_result'
    resource_id UUID,
    
    -- Additional context
    details JSONB DEFAULT '{}',
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for compliance reporting
    INDEX idx_audit_log_user_id (user_id),
    INDEX idx_audit_log_action (action),
    INDEX idx_audit_log_created_at (created_at),
    INDEX idx_audit_log_resource (resource_type, resource_id)
);

-- Data retention and anonymization jobs
CREATE TABLE data_retention_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Job details
    job_type VARCHAR(50) NOT NULL, -- 'anonymize', 'delete', 'export'
    status VARCHAR(20) DEFAULT 'pending', -- pending, running, completed, failed
    table_name VARCHAR(100),
    records_processed INTEGER DEFAULT 0,
    records_total INTEGER,
    
    -- Scheduling
    scheduled_at TIMESTAMP NOT NULL,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Results
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    errors JSONB DEFAULT '[]',
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_retention_jobs_scheduled_at (scheduled_at),
    INDEX idx_retention_jobs_status (status)
);

-- Functions for GDPR compliance

-- Function to encrypt PII data
CREATE OR REPLACE FUNCTION encrypt_pii(data TEXT, key_id TEXT DEFAULT 'default')
RETURNS BYTEA AS $$
BEGIN
    -- Use pgcrypto to encrypt PII data
    RETURN pgp_sym_encrypt(data, key_id);
END;
$$ LANGUAGE plpgsql;

-- Function to decrypt PII data
CREATE OR REPLACE FUNCTION decrypt_pii(encrypted_data BYTEA, key_id TEXT DEFAULT 'default')
RETURNS TEXT AS $$
BEGIN
    -- Decrypt data with audit logging
    INSERT INTO audit_log (action, details) 
    VALUES ('decrypt_pii', jsonb_build_object('timestamp', NOW()));
    
    RETURN pgp_sym_decrypt(encrypted_data, key_id);
END;
$$ LANGUAGE plpgsql;

-- Function to anonymize patient data
CREATE OR REPLACE FUNCTION anonymize_patient_data(patient_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Anonymize patient data while preserving medical relevance
    UPDATE patients 
    SET 
        first_name_encrypted = encrypt_pii('ANONYMIZED'),
        last_name_encrypted = encrypt_pii('ANONYMIZED'),
        date_of_birth_encrypted = encrypt_pii('1900-01-01'),
        phone_encrypted = encrypt_pii('ANONYMIZED'),
        email_encrypted = encrypt_pii('ANONYMIZED'),
        address_encrypted = encrypt_pii('ANONYMIZED'),
        emergency_contact_encrypted = encrypt_pii('ANONYMIZED'),
        anonymized = true,
        updated_at = NOW()
    WHERE id = patient_uuid;
    
    -- Log the anonymization
    INSERT INTO audit_log (action, resource_type, resource_id, details)
    VALUES ('anonymize_patient', 'patient', patient_uuid, 
            jsonb_build_object('anonymized_at', NOW()));
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to all main tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_sessions_updated_at BEFORE UPDATE ON medical_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_results_updated_at BEFORE UPDATE ON lab_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) for data isolation
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies - doctors can only see their own patients
CREATE POLICY doctor_patient_isolation ON patients
    FOR ALL TO authenticated_users
    USING (doctor_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY doctor_session_isolation ON medical_sessions
    FOR ALL TO authenticated_users
    USING (doctor_id = current_setting('app.current_user_id')::UUID);