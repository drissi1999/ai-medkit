# Overview

This is a comprehensive AI Medical Assistant ("AI Medkit") platform designed to help healthcare professionals with clinical decision support, patient examination summaries, appointment scheduling, voice-assisted examinations, and daily workflow optimization. The application features an intelligent chat interface powered by Google's Gemini AI, secure authentication system, patient calendar management, voice assistant for real-time examination transcription, and professional medical dashboard. Built with React, Node.js, and Google AI for modern medical practice workflows.

Based on user requirements: "I wanna build aan ai medkit for doctors an asitante that can help theme take disicions and also help theme in there work and summrize there examinations with patients and also can give help in MRI and also blood test and other test it will be like a chat or vocal assitante that can connect to email and also can connect the calendar of the docotrs so she can help theme in there everyday work"

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend uses React with TypeScript for a modern medical interface. The application follows a component-based architecture with:

- **Medical UI Components**: Specialized components for patient data, medical charts, examination forms, and clinical decision support
- **State Management**: Zustand stores manage medical data, patient sessions, AI conversations, and user authentication
- **AI Chat Interface**: Real-time chat with Google Gemini AI for clinical assistance and decision support
- **UI Components**: Radix UI provides accessible, HIPAA-compliant component primitives with medical-grade styling via Tailwind CSS
- **Query Management**: TanStack Query manages secure API interactions with patient data and medical services
- **Security**: End-to-end encryption for all patient data and HIPAA-compliant audit logging

The interface features specialized medical workflows including patient examination forms, imaging analysis tools, and clinical decision support dashboards.

## Backend Architecture
The backend uses Express.js with TypeScript designed for healthcare compliance. Key architectural decisions include:

- **Medical API Routes**: HIPAA-compliant endpoints for patient data, medical AI, examination summaries, and clinical decision support
- **AI Integration**: Google Gemini AI integration for medical analysis, decision support, and patient examination summaries
- **Security Middleware**: HIPAA-compliant authentication, audit logging, data encryption, and access controls
- **Storage Abstraction**: Secure interface for patient data with encryption at rest and in transit
- **Error Handling**: Medical-grade error handling with proper audit trails and compliance logging

The server structure supports secure medical data handling with comprehensive audit trails and regulatory compliance.

## Data Storage Solutions
The application uses PostgreSQL with HIPAA-compliant configurations and Drizzle ORM for secure database operations:

- **Medical Schema**: Specialized schemas for patients, examinations, medical imaging, AI analysis results, and audit logs
- **Encryption**: All patient data encrypted at rest and in transit with industry-standard AES-256 encryption
- **Audit Logging**: Comprehensive audit trails for all patient data access and modifications
- **Migration System**: Drizzle Kit handles secure database migrations with rollback capabilities
- **Production Ready**: PostgreSQL integration through Neon Database with HIPAA-compliant backup and disaster recovery

## Authentication and Authorization
Implements healthcare-grade authentication and authorization:

- **Multi-Factor Authentication**: Required for all medical personnel access
- **Role-Based Access Control**: Doctor, nurse, admin, and read-only roles with granular permissions
- **Session Management**: Secure session tokens with automatic timeout and audit logging
- **HIPAA Compliance**: All authentication events logged with user identification and access patterns

## External Service Integrations
The application integrates with healthcare-specific services and medical APIs:

- **Google Gemini AI**: Advanced medical AI for clinical decision support, examination summaries, and imaging analysis
- **Neon Database**: HIPAA-compliant serverless PostgreSQL for secure patient data storage
- **Medical APIs**: Integration ready for EHR systems, lab results, medical imaging, and pharmacy systems
- **Email/Calendar**: Secure integration with medical scheduling and communication systems
- **Audit Services**: Comprehensive logging and monitoring for HIPAA compliance

The architecture supports FHIR standards and easy extension for additional medical APIs, laboratory systems, and healthcare providers.

# External Dependencies

- **Database**: PostgreSQL via Neon Database serverless platform with HIPAA compliance
- **AI Services**: Google Gemini AI for medical analysis and clinical decision support
- **UI Framework**: Radix UI component primitives with medical-grade Tailwind CSS styling
- **State Management**: Zustand for secure client-side medical data state
- **Query Management**: TanStack React Query for secure server state and API interactions
- **Security**: Industry-standard encryption libraries and HIPAA-compliant audit logging
- **Build Tools**: Vite for development and bundling, ESBuild for production builds
- **ORM**: Drizzle ORM with PostgreSQL dialect for secure, type-safe database operations
- **Development**: TypeScript, medical data validation, and enhanced debugging tools