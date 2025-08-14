import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  Download,
  FileText,
  Brain,
  Volume2,
  VolumeX,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface VoiceRecording {
  id: string;
  timestamp: Date;
  duration: number;
  transcript: string;
  summary?: string;
  patientName?: string;
  status: 'recording' | 'processing' | 'completed' | 'error';
}

interface VoiceAssistantProps {
  patientContext?: any;
  onExaminationComplete?: (summary: string) => void;
}

export default function VoiceAssistant({ patientContext, onExaminationComplete }: VoiceAssistantProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [recordings, setRecordings] = useState<VoiceRecording[]>([]);
  const [currentRecording, setCurrentRecording] = useState<VoiceRecording | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        processRecording(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      const newRecording: VoiceRecording = {
        id: Date.now().toString(),
        timestamp: new Date(),
        duration: 0,
        transcript: '',
        patientName: patientContext?.name,
        status: 'recording'
      };

      setCurrentRecording(newRecording);
      setRecordings(prev => [newRecording, ...prev]);
      
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      setError('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Update recording duration
      if (currentRecording) {
        setRecordings(prev => 
          prev.map(r => 
            r.id === currentRecording.id 
              ? { ...r, duration: recordingTime, status: 'processing' }
              : r
          )
        );
      }
    }
  };

  const processRecording = async (audioBlob: Blob) => {
    if (!currentRecording) return;

    setIsProcessing(true);

    try {
      // Simulate audio processing and transcription
      // In production, you would send the audio to a speech-to-text service
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('patientContext', JSON.stringify(patientContext));

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const result = await response.json();

      // Update recording with transcript and summary
      setRecordings(prev =>
        prev.map(r =>
          r.id === currentRecording.id
            ? {
                ...r,
                transcript: result.transcript,
                summary: result.summary,
                status: 'completed'
              }
            : r
        )
      );

      if (onExaminationComplete && result.summary) {
        onExaminationComplete(result.summary);
      }

    } catch (err) {
      setError('Failed to process recording');
      setRecordings(prev =>
        prev.map(r =>
          r.id === currentRecording.id
            ? { ...r, status: 'error' }
            : r
        )
      );
    } finally {
      setIsProcessing(false);
      setCurrentRecording(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recording': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Voice Assistant Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-blue-600" />
            Voice Assistant
            {patientContext && (
              <Badge variant="outline">
                Patient: {patientContext.name}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col items-center space-y-4">
            {/* Recording Status */}
            {isRecording && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-red-600">Recording</span>
                </div>
                <div className="text-2xl font-mono font-bold">
                  {formatTime(recordingTime)}
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-blue-600 animate-spin" />
                  <span className="text-sm font-medium text-blue-600">Processing...</span>
                </div>
                <p className="text-sm text-gray-600">
                  AI is transcribing and analyzing the examination
                </p>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex gap-4">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isProcessing}
                >
                  <Mic className="h-5 w-5 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  size="lg"
                  variant="destructive"
                >
                  <Square className="h-5 w-5 mr-2" />
                  Stop Recording
                </Button>
              )}

              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>

            <p className="text-sm text-gray-600 text-center max-w-md">
              Speak naturally during the patient examination. The AI will listen, transcribe, and generate a comprehensive summary.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recording History */}
      <Card>
        <CardHeader>
          <CardTitle>Recording History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recordings.map((recording) => (
              <div
                key={recording.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      <div className="font-medium">
                        {recording.timestamp.toLocaleString()}
                      </div>
                      <div className="text-gray-500">
                        Duration: {formatTime(recording.duration)}
                      </div>
                      {recording.patientName && (
                        <div className="text-gray-500">
                          Patient: {recording.patientName}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(recording.status)}>
                      {recording.status}
                    </Badge>
                    
                    {recording.status === 'completed' && (
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm">
                          <Play className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {recording.transcript && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium mb-1">Transcript:</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {recording.transcript}
                    </p>
                  </div>
                )}

                {recording.summary && (
                  <div>
                    <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      AI Summary:
                    </h4>
                    <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                      {recording.summary}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {recordings.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Mic className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recordings yet</p>
                <p className="text-sm">Start your first examination recording</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}