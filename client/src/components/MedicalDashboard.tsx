import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import AiChatInterface from './AiChatInterface';
import { 
  MessageCircle, 
  FileText, 
  Users, 
  Activity, 
  Brain, 
  Camera,
  AlertTriangle,
  CheckCircle,
  Clock,
  Stethoscope,
  Calendar,
  Mic,
  LogOut,
  User
} from 'lucide-react';
import PatientCalendar from './PatientCalendar';
import VoiceAssistant from './VoiceAssistant';

interface MedicalDashboardProps {
  userRole?: 'doctor' | 'nurse' | 'admin' | 'readonly';
  user?: any;
  onLogout?: () => void;
}

interface Patient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  lastVisit: string;
  status: 'stable' | 'critical' | 'improving';
}

interface Examination {
  id: string;
  patientName: string;
  type: string;
  date: string;
  status: 'completed' | 'in-progress' | 'pending';
  chiefComplaint: string;
}

export default function MedicalDashboard({ userRole = 'doctor', user, onLogout }: MedicalDashboardProps) {
  const [recentPatients] = useState<Patient[]>([
    {
      id: '1',
      mrn: 'MRN001234',
      name: 'Sarah Johnson',
      age: 45,
      lastVisit: '2024-08-12',
      status: 'stable'
    },
    {
      id: '2', 
      mrn: 'MRN001235',
      name: 'Michael Chen',
      age: 32,
      lastVisit: '2024-08-11',
      status: 'improving'
    },
    {
      id: '3',
      mrn: 'MRN001236', 
      name: 'Emma Rodriguez',
      age: 67,
      lastVisit: '2024-08-10',
      status: 'critical'
    }
  ]);

  const [recentExaminations] = useState<Examination[]>([
    {
      id: '1',
      patientName: 'Sarah Johnson',
      type: 'Routine Check-up',
      date: '2024-08-12 14:30',
      status: 'completed',
      chiefComplaint: 'Annual physical examination'
    },
    {
      id: '2',
      patientName: 'Michael Chen', 
      type: 'Follow-up',
      date: '2024-08-12 15:15',
      status: 'in-progress',
      chiefComplaint: 'Chest pain follow-up'
    },
    {
      id: '3',
      patientName: 'Emma Rodriguez',
      type: 'Emergency',
      date: '2024-08-12 16:00',
      status: 'pending',
      chiefComplaint: 'Acute abdominal pain'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-green-100 text-green-800';
      case 'improving': return 'bg-blue-100 text-blue-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'stable': return <CheckCircle className="h-4 w-4" />;
      case 'improving': return <Activity className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              AI Medical Assistant
            </h1>
            <p className="text-gray-600 mt-1">
              Intelligent healthcare support powered by AI
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {userRole}
            </Badge>
            <Badge variant="secondary">
              HIPAA Compliant
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Patients</p>
                  <p className="text-2xl font-bold text-gray-900">127</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Exams</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">AI Consultations</p>
                  <p className="text-2xl font-bold text-gray-900">15</p>
                </div>
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                  <p className="text-2xl font-bold text-red-600">2</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai-chat">AI Assistant</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="voice">Voice Assistant</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="examinations">Examinations</TabsTrigger>
            <TabsTrigger value="imaging">Imaging</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Patients */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Recent Patients
                  </CardTitle>
                  <CardDescription>
                    Patients seen in the last 7 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {recentPatients.map((patient) => (
                        <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-sm text-gray-600">{patient.mrn} • Age {patient.age}</p>
                            <p className="text-xs text-gray-500">Last visit: {patient.lastVisit}</p>
                          </div>
                          <Badge className={getStatusColor(patient.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(patient.status)}
                              {patient.status}
                            </div>
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Recent Examinations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recent Examinations
                  </CardTitle>
                  <CardDescription>
                    Latest examination activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {recentExaminations.map((exam) => (
                        <div key={exam.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">{exam.patientName}</p>
                            <Badge className={getStatusColor(exam.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(exam.status)}
                                {exam.status}
                              </div>
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{exam.type}</p>
                          <p className="text-xs text-gray-500 mt-1">{exam.chiefComplaint}</p>
                          <p className="text-xs text-gray-400 mt-1">{exam.date}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-chat">
            <AiChatInterface 
              sessionType="general"
              patientContext={user}
            />
          </TabsContent>

          <TabsContent value="calendar">
            <PatientCalendar />
          </TabsContent>

          <TabsContent value="voice">
            <VoiceAssistant patientContext={user} />
          </TabsContent>

          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Patient Management
                </CardTitle>
                <CardDescription>
                  Search and manage patient records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input placeholder="Search patients by name or MRN..." className="flex-1" />
                    <Button>Search</Button>
                    <Button variant="outline">New Patient</Button>
                  </div>
                  <div className="text-center py-8">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Patient search and management will be integrated here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examinations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Examination Management
                </CardTitle>
                <CardDescription>
                  Create and manage patient examinations with AI assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full">New Examination</Button>
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Examination forms and AI summary generation will be available here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="imaging">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Medical Imaging Analysis
                </CardTitle>
                <CardDescription>
                  AI-powered medical imaging analysis and interpretation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Upload medical images for AI-assisted analysis
                  </p>
                  <Button variant="outline">Upload Images</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}