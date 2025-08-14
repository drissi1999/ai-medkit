// server/routes/medical.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authenticateToken } from '../middleware/auth.js';
import { db } from '../database/connection.js';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = file.fieldname === 'audio' ? 'uploads/audio/' : 'uploads/images/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image') {
      const allowedTypes = /jpeg|jpg|png|gif|dicom|dcm/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    } else if (file.fieldname === 'audio') {
      const allowedTypes = /mp3|wav|ogg|m4a|webm/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      if (extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed'));
      }
    }
  }
});

// ======================
// IMAGE ANALYSIS ROUTES
// ======================

// Upload and analyze medical image
router.post('/image/analyze', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { imageType, patientContext } = req.body;
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    // Save to database
    const imageRecord = await db.query(
      `INSERT INTO image_analyses (user_id, image_type, image_path, image_name, file_size, status)
       VALUES ($1, $2, $3, $4, $5, 'processing') RETURNING id`,
      [userId, imageType, req.file.path, req.file.originalname, req.file.size]
    );

    const imageId = imageRecord.rows[0].id;

    // Analyze image with AI
    const analysisResult = await analyzeMedicalImage(req.file.path, imageType, patientContext);

    // Update database with results
    await db.query(
      `UPDATE image_analyses 
       SET analysis_result = $1, confidence_score = $2, diagnosis = $3, 
           recommendations = $4, status = 'completed', analysis_completed_at = NOW()
       WHERE id = $5`,
      [
        JSON.stringify(analysisResult),
        analysisResult.confidence,
        analysisResult.diagnosis,
        analysisResult.recommendations,
        imageId
      ]
    );

    // Log analytics
    await db.query(
      `INSERT INTO analytics (user_id, action_type, details)
       VALUES ($1, 'image_analysis', $2)`,
      [userId, JSON.stringify({ imageType, imageId })]
    );

    res.json({
      success: true,
      imageId,
      analysis: analysisResult
    });

  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({ error: 'Image analysis failed' });
  }
});

// Get image analysis history
router.get('/image/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT id, image_type, image_name, diagnosis, confidence_score, 
              status, created_at, analysis_completed_at
       FROM image_analyses 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      success: true,
      analyses: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rowCount
      }
    });
  } catch (error) {
    console.error('Get image history error:', error);
    res.status(500).json({ error: 'Failed to get image history' });
  }
});

// ======================
// VOICE EXAMINATION ROUTES
// ======================

// Start voice examination
router.post('/voice/start', authenticateToken, async (req, res) => {
  try {
    const { examType, patientContext } = req.body;
    const userId = req.user.id;

    const examRecord = await db.query(
      `INSERT INTO voice_examinations (user_id, exam_type, patient_context, status)
       VALUES ($1, $2, $3, 'recording') RETURNING id`,
      [userId, examType, JSON.stringify(patientContext), ]
    );

    res.json({
      success: true,
      examId: examRecord.rows[0].id
    });
  } catch (error) {
    console.error('Start voice exam error:', error);
    res.status(500).json({ error: 'Failed to start voice examination' });
  }
});

// Upload and process voice recording
router.post('/voice/upload/:examId', authenticateToken, upload.single('audio'), async (req, res) => {
  try {
    const { examId } = req.params;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    // Update exam record with audio file
    await db.query(
      `UPDATE voice_examinations 
       SET audio_file_path = $1, status = 'processing'
       WHERE id = $2 AND user_id = $3`,
      [req.file.path, examId, userId]
    );

    // Process audio with AI
    const transcriptionResult = await transcribeAndAnalyzeAudio(req.file.path, examId);

    // Update database with results
    await db.query(
      `UPDATE voice_examinations 
       SET transcript = $1, summary = $2, diagnosis = $3, 
           recommendations = $4, confidence_score = $5, 
           duration_seconds = $6, status = 'completed', completed_at = NOW()
       WHERE id = $7`,
      [
        transcriptionResult.transcript,
        transcriptionResult.summary,
        transcriptionResult.diagnosis,
        transcriptionResult.recommendations,
        transcriptionResult.confidence,
        transcriptionResult.duration,
        examId
      ]
    );

    // Log analytics
    await db.query(
      `INSERT INTO analytics (user_id, action_type, details)
       VALUES ($1, 'voice_exam', $2)`,
      [userId, JSON.stringify({ examId, duration: transcriptionResult.duration })]
    );

    res.json({
      success: true,
      transcript: transcriptionResult.transcript,
      summary: transcriptionResult.summary,
      diagnosis: transcriptionResult.diagnosis,
      recommendations: transcriptionResult.recommendations
    });

  } catch (error) {
    console.error('Voice processing error:', error);
    res.status(500).json({ error: 'Voice processing failed' });
  }
});

// Get voice examination history
router.get('/voice/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT id, exam_type, summary, diagnosis, confidence_score, 
              duration_seconds, status, created_at, completed_at
       FROM voice_examinations 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      success: true,
      examinations: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rowCount
      }
    });
  } catch (error) {
    console.error('Get voice history error:', error);
    res.status(500).json({ error: 'Failed to get voice history' });
  }
});

// ======================
// CHAT ASSISTANT ROUTES
// ======================

// Start new chat conversation
router.post('/chat/conversation', authenticateToken, async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user.id;

    const conversation = await db.query(
      `INSERT INTO chat_conversations (user_id, title)
       VALUES ($1, $2) RETURNING id`,
      [userId, title || 'New Consultation']
    );

    res.json({
      success: true,
      conversationId: conversation.rows[0].id
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Send chat message
router.post('/chat/message', authenticateToken, async (req, res) => {
  try {
    const { conversationId, message, messageType = 'question' } = req.body;
    const userId = req.user.id;

    const startTime = Date.now();

    // Get AI response
    const aiResponse = await getMedicalAiResponse(message, userId);
    const responseTime = Date.now() - startTime;

    // Save message and response
    const messageRecord = await db.query(
      `INSERT INTO chat_messages (conversation_id, user_id, message, response, 
                                  message_type, ai_model_used, response_time_ms)
       VALUES ($1, $2, $3, $4, $5, 'gemini-pro', $6) RETURNING id`,
      [conversationId, userId, message, aiResponse, messageType, responseTime]
    );

    // Update conversation timestamp
    await db.query(
      `UPDATE chat_conversations SET updated_at = NOW() WHERE id = $1`,
      [conversationId]
    );

    // Log analytics
    await db.query(
      `INSERT INTO analytics (user_id, action_type, details)
       VALUES ($1, 'chat_message', $2)`,
      [userId, JSON.stringify({ conversationId, messageLength: message.length })]
    );

    res.json({
      success: true,
      messageId: messageRecord.rows[0].id,
      response: aiResponse,
      responseTime: responseTime
    });

  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Get chat history
router.get('/chat/history/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const messages = await db.query(
      `SELECT message, response, message_type, created_at
       FROM chat_messages 
       WHERE conversation_id = $1 AND user_id = $2 
       ORDER BY created_at ASC`,
      [conversationId, userId]
    );

    res.json({
      success: true,
      messages: messages.rows
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});

// ======================
// DASHBOARD & ANALYTICS
// ======================

// Get dashboard statistics
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Promise.all([
      // Images analyzed
      db.query(
        `SELECT COUNT(*) as count FROM image_analyses WHERE user_id = $1 AND status = 'completed'`,
        [userId]
      ),
      // Voice exams
      db.query(
        `SELECT COUNT(*) as count FROM voice_examinations WHERE user_id = $1 AND status = 'completed'`,
        [userId]
      ),
      // Chat messages
      db.query(
        `SELECT COUNT(*) as count FROM chat_messages WHERE user_id = $1`,
        [userId]
      ),
      // Recent activity
      db.query(
        `SELECT action_type, details, created_at 
         FROM analytics 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 10`,
        [userId]
      )
    ]);

    res.json({
      success: true,
      stats: {
        imagesAnalyzed: parseInt(stats[0].rows[0].count),
        voiceExams: parseInt(stats[1].rows[0].count),
        chatMessages: parseInt(stats[2].rows[0].count),
        totalDiagnoses: parseInt(stats[0].rows[0].count) + parseInt(stats[1].rows[0].count)
      },
      recentActivity: stats[3].rows
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard statistics' });
  }
});

// ======================
// PDF REPORT GENERATION
// ======================

// Generate PDF report
router.post('/report/generate', authenticateToken, async (req, res) => {
  try {
    const { reportType, relatedId, reportData } = req.body;
    const userId = req.user.id;

    // Generate PDF (you'll need to implement this with a PDF library)
    const pdfPath = await generatePDFReport(reportType, reportData, userId);

    // Save report record
    const report = await db.query(
      `INSERT INTO reports (user_id, report_type, related_id, report_data, pdf_path)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [userId, reportType, relatedId, JSON.stringify(reportData), pdfPath]
    );

    res.json({
      success: true,
      reportId: report.rows[0].id,
      downloadUrl: `/api/report/download/${report.rows[0].id}`
    });

  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// ======================
// AI HELPER FUNCTIONS
// ======================

async function analyzeMedicalImage(imagePath, imageType, patientContext) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    
    // Read image file
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');

    const prompt = `You are a medical AI assistant analyzing a ${imageType} medical image. 
                   Please provide a detailed analysis including:
                   1. Key findings
                   2. Potential diagnosis
                   3. Recommendations for further examination
                   4. Confidence level (0-1)
                   
                   Patient context: ${patientContext || 'None provided'}
                   
                   Format your response as a structured medical report.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg"
        }
      }
    ]);

    const response = await result.response;
    const analysisText = response.text();

    return {
      diagnosis: extractDiagnosis(analysisText),
      findings: extractFindings(analysisText),
      recommendations: extractRecommendations(analysisText),
      confidence: extractConfidence(analysisText),
      fullAnalysis: analysisText
    };

  } catch (error) {
    console.error('AI image analysis error:', error);
    throw new Error('AI analysis failed');
  }
}

async function transcribeAndAnalyzeAudio(audioPath, examId) {
  // This would integrate with speech-to-text service
  // For now, returning mock data
  return {
    transcript: "Patient reports chest pain and shortness of breath...",
    summary: "Cardiovascular examination reveals potential concerns...",
    diagnosis: "Possible angina, requires further testing",
    recommendations: "ECG, stress test, cardiology consultation recommended",
    confidence: 0.85,
    duration: 180
  };
}

async function getMedicalAiResponse(message, userId) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `You are a medical AI assistant helping a doctor. 
                   Provide professional, evidence-based medical guidance.
                   Patient safety is paramount - always recommend proper examination and testing.
                   
                   Doctor's question: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error('AI chat response error:', error);
    return "I apologize, but I'm unable to process your request at the moment. Please try again.";
  }
}

// Helper functions for parsing AI responses
function extractDiagnosis(text) {
  // Implementation to extract diagnosis from AI response
  return "Analysis pending - detailed diagnosis will be provided";
}

function extractFindings(text) {
  // Implementation to extract key findings
  return "Key findings extracted from AI analysis";
}

function extractRecommendations(text) {
  // Implementation to extract recommendations
  return "Recommendations based on AI analysis";
}

function extractConfidence(text) {
  // Implementation to extract confidence score
  return 0.85;
}

async function generatePDFReport(reportType, reportData, userId) {
  // Implementation for PDF generation using libraries like jsPDF or Puppeteer
  return `reports/report_${Date.now()}.pdf`;
}

export default router;