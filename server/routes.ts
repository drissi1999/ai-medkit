import type { Express } from "express";
import { createServer, type Server } from "http";
// WebSocket disabled to prevent conflicts with Vite dev server
import { GoogleGenerativeAI } from "@google/generative-ai";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import { storage } from "./storage";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

// Rate limiting for API endpoints
const medicalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

const aiChatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit AI chat to 10 requests per minute
  message: "AI chat rate limit exceeded, please wait before sending another message.",
});

// Medical AI Assistant specialized for healthcare
async function getMedicalAiResponse(prompt: string, context?: any): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const medicalSystemPrompt = `You are a medical AI assistant designed to help healthcare professionals with clinical decision support. 
    
    IMPORTANT GUIDELINES:
    - You are assisting licensed medical professionals, not providing direct patient care
    - Always recommend consulting with specialists when appropriate
    - Provide evidence-based information with medical references when possible
    - Never diagnose patients or replace professional medical judgment
    - Focus on differential diagnosis, treatment options, and clinical guidelines
    - If asked about emergency situations, always recommend immediate medical attention
    
    Patient Context: ${context ? JSON.stringify(context, null, 2) : 'No specific patient context provided'}
    
    Healthcare Professional Query: ${prompt}`;

    const result = await model.generateContent(medicalSystemPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Error:", error);
    throw new Error("AI service temporarily unavailable");
  }
}

// Generate examination summary using AI
async function generateExaminationSummary(examination: any): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Generate a professional medical examination summary for the following patient encounter:

    Chief Complaint: ${examination.chiefComplaint}
    History of Present Illness: ${examination.historyOfPresentIllness || 'Not provided'}
    Physical Examination: ${examination.physicalExam || 'Not documented'}
    Assessment: ${examination.assessment || 'Pending'}
    Plan: ${examination.plan || 'To be determined'}
    
    Please provide:
    1. A concise clinical summary
    2. Key findings and observations
    3. Recommended follow-up actions
    4. Any potential concerns or red flags to monitor
    
    Format this as a professional medical summary suitable for medical records.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Summary Generation Error:", error);
    return "AI summary generation failed. Please review examination manually.";
  }
}

// Medical imaging analysis using AI
async function analyzemedicalImaging(imagingData: any): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Analyze this medical imaging study:
    
    Type: ${imagingData.type}
    Body Part: ${imagingData.bodyPart}
    Clinical Context: ${imagingData.description || 'No clinical context provided'}
    
    Please provide:
    1. Systematic analysis of key anatomical structures
    2. Any abnormal findings or areas of concern
    3. Differential diagnosis considerations
    4. Recommendations for additional imaging or follow-up
    5. Confidence level of analysis
    
    Note: This is AI-assisted analysis and requires radiologist review for final interpretation.`;

    // For demo purposes, return structured analysis
    // In production, you would send the actual image data to the AI
    return {
      findings: [
        "Systematic review of anatomical structures",
        "Areas requiring attention identified",
        "Differential considerations noted"
      ],
      confidence: 0.85,
      recommendations: [
        "Radiologist review required",
        "Consider additional views if clinically indicated",
        "Correlate with clinical findings"
      ],
      analysisDate: new Date()
    };
  } catch (error) {
    console.error("Imaging Analysis Error:", error);
    throw new Error("Imaging analysis service unavailable");
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Security middleware with relaxed CSP for development
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", "ws:", "wss:"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
  }));
  
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : true,
    credentials: true
  }));
  
  // Trust proxy for proper rate limiting
  app.set('trust proxy', 1);
  
  // Apply rate limiting to all API routes
  app.use('/api', medicalApiLimiter);

  const httpServer = createServer(app);
  // Disable custom WebSocket to avoid conflicts with Vite dev server

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ 
      status: "ok", 
      service: "Medical AI Assistant",
      timestamp: new Date().toISOString()
    });
  });

  // Medical AI Chat endpoint
  app.post("/api/ai/chat", aiChatLimiter, async (req, res) => {
    try {
      const { prompt, patientContext, sessionId } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const aiResponse = await getMedicalAiResponse(prompt, patientContext);
      
      res.json({
        response: aiResponse,
        sessionId: sessionId || randomUUID(),
        timestamp: new Date().toISOString(),
        disclaimer: "AI-assisted information. Always consult with healthcare professionals for patient care decisions."
      });
    } catch (error) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ error: "AI service temporarily unavailable" });
    }
  });

  // Generate examination summary
  app.post("/api/ai/examination-summary", async (req, res) => {
    try {
      const examination = req.body;
      const summary = await generateExaminationSummary(examination);
      
      res.json({
        summary,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Summary Generation Error:", error);
      res.status(500).json({ error: "Summary generation failed" });
    }
  });

  // Medical imaging analysis
  app.post("/api/ai/imaging-analysis", async (req, res) => {
    try {
      const imagingData = req.body;
      const analysis = await analyzemedicalImaging(imagingData);
      
      res.json({
        analysis,
        disclaimer: "AI analysis requires radiologist review for clinical interpretation"
      });
    } catch (error) {
      console.error("Imaging Analysis Error:", error);
      res.status(500).json({ error: "Imaging analysis failed" });
    }
  });

  // Patient search and management endpoints
  app.get("/api/patients/search", async (req, res) => {
    try {
      const { query } = req.query;
      // In production, implement proper patient search with privacy controls
      res.json({
        patients: [],
        message: "Patient search requires implementation with your EHR system"
      });
    } catch (error) {
      res.status(500).json({ error: "Patient search failed" });
    }
  });

  // Create new patient
  app.post("/api/patients", async (req, res) => {
    try {
      const patientData = req.body;
      // In production, validate and store patient data securely
      res.json({
        message: "Patient creation requires database implementation",
        patientId: randomUUID()
      });
    } catch (error) {
      res.status(500).json({ error: "Patient creation failed" });
    }
  });

  // Create new examination
  app.post("/api/examinations", async (req, res) => {
    try {
      const examinationData = req.body;
      const summary = await generateExaminationSummary(examinationData);
      
      res.json({
        message: "Examination created with AI summary",
        examinationId: randomUUID(),
        aiSummary: summary
      });
    } catch (error) {
      res.status(500).json({ error: "Examination creation failed" });
    }
  });

  // Medical decision support
  app.post("/api/ai/decision-support", async (req, res) => {
    try {
      const { symptoms, patientHistory, vitalSigns } = req.body;
      
      const prompt = `Provide clinical decision support for a patient presenting with:
      
      Symptoms: ${symptoms}
      Medical History: ${patientHistory || 'Unknown'}
      Vital Signs: ${JSON.stringify(vitalSigns || {})}
      
      Please provide:
      1. Differential diagnosis considerations
      2. Recommended diagnostic workup
      3. Red flags to monitor
      4. Treatment considerations
      5. When to consider specialist referral`;

      const aiResponse = await getMedicalAiResponse(prompt);
      
      res.json({
        decisionSupport: aiResponse,
        disclaimer: "AI-generated suggestions for licensed healthcare professionals. Not a substitute for clinical judgment.",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Decision Support Error:", error);
      res.status(500).json({ error: "Decision support service unavailable" });
    }
  });

  // Authentication endpoints
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // In production, validate against secure database
      // For demo, accept any email with password "demo123"
      if (password === "demo123") {
        const user = {
          id: randomUUID(),
          email,
          firstName: "Dr. John",
          lastName: "Doe",
          specialty: "Internal Medicine",
          licenseNumber: "MD-123456",
          role: "doctor"
        };
        
        res.json({
          user,
          token: jwt.sign(user, "demo-secret", { expiresIn: "24h" }),
          message: "Login successful"
        });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { firstName, lastName, email, password, licenseNumber, specialty } = req.body;
      
      // In production, validate license and save to secure database
      const user = {
        id: randomUUID(),
        email,
        firstName,
        lastName,
        specialty,
        licenseNumber,
        role: "doctor"
      };
      
      res.json({
        user,
        token: jwt.sign(user, "demo-secret", { expiresIn: "24h" }),
        message: "Registration successful"
      });
    } catch (error) {
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Voice assistant endpoints
  app.post("/api/voice/transcribe", async (req, res) => {
    try {
      // In production, use speech-to-text service like Google Cloud Speech-to-Text
      // For demo, return sample transcription and summary
      
      const sampleTranscript = "Patient presents with chest pain, shortness of breath, and mild fever. Blood pressure 140/90, heart rate 95 BPM. Chest examination reveals slight wheezing. Patient reports symptoms started 2 days ago.";
      
      const sampleSummary = await getMedicalAiResponse(
        `Generate a professional examination summary based on this transcription: "${sampleTranscript}". Include assessment and recommendations.`,
        req.body.patientContext ? JSON.parse(req.body.patientContext) : null
      );

      res.json({
        transcript: sampleTranscript,
        summary: sampleSummary,
        confidence: 0.95,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Voice transcription error:", error);
      res.status(500).json({ error: "Transcription failed" });
    }
  });

  return httpServer;
}