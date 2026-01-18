import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, Plus, MessageSquare, ListTodo, User, Calendar,
  CheckCircle, Clock, AlertCircle, Sparkles, TrendingUp, FileText
} from 'lucide-react';

export default function DealCollaboration({ deal, onClose, onUpdate }) {
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [newTask, setNewTask] = useState({ title: '', description: '', assigned_to_email: '', due_date: '' });
  const [user, setUser] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [deal.id]);

  const fetchData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const [dealNotes, dealTasks] = await Promise.all([
        base44.entities.DealNote.filter({ deal_id: deal.id }),
        base44.entities.DealTask.filter({ deal_id: deal.id })
      ]);
      
      setNotes(dealNotes);
      setTasks(dealTasks);
    } catch (error) {
      console.error('Failed to fetch collaboration data:', error);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      await base44.entities.DealNote.create({
        deal_id: deal.id,
        author_email: user.email,
        content: newNote,
        note_type: 'general'
      });
      setNewNote('');
      fetchData();
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const addTask = async () => {
    if (!newTask.title.trim() || !newTask.assigned_to_email.trim()) return;
    
    try {
      await base44.entities.DealTask.create({
        deal_id: deal.id,
        title: newTask.title,
        description: newTask.description,
        assigned_to_email: newTask.assigned_to_email,
        assigned_by_email: user.email,
        due_date: newTask.due_date,
        status: 'pending'
      });
      setNewTask({ title: '', description: '', assigned_to_email: '', due_date: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const updateData = { status };
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
      await base44.entities.DealTask.update(taskId, updateData);
      fetchData();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const runAIAnalysis = async (type) => {
    setAnalyzing(true);
    try {
      if (type === 'sentiment') {
        await base44.functions.invoke('analyzeDealSentiment', { deal_id: deal.id });
      } else if (type === 'summary') {
        await base44.functions.invoke('summarizeDealSource', { deal_id: deal.id });
      } else if (type === 'prediction') {
        await base44.functions.invoke('predictDealOutcome', { deal_id: deal.id });
      }
      onUpdate();
    } catch (error) {
      console.error('AI analysis failed:', error);
    }
    setAnalyzing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        <div className="flex justify-between items-start p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">{deal.company_name}</h2>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{deal.stage}</Badge>
              <Badge className={
                deal.pipeline_stage === 'invested' ? 'bg-green-600' :
                deal.pipeline_stage === 'interested' ? 'bg-blue-600' :
                deal.pipeline_stage === 'reviewing' ? 'bg-orange-600' : 'bg-gray-600'
              }>
                {deal.pipeline_stage}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start px-6 bg-gray-900 border-b border-gray-700">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
              <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
              <TabsTrigger value="ai">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-white mb-2">Description</h3>
                <p className="text-gray-400">{deal.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-gray-400">Funding Raised</h4>
                  <p className="text-white font-semibold">${deal.funding_raised}M</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-400">Valuation</h4>
                  <p className="text-white font-semibold">${deal.valuation}M</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-400">Location</h4>
                  <p className="text-white font-semibold">{deal.headquarters}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-400">Industry</h4>
                  <p className="text-white font-semibold">{deal.industry}</p>
                </div>
              </div>

              {deal.ai_scoring && (
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      AI Scoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Overall Score</span>
                      <span className="text-white font-bold">{deal.ai_scoring.overall_score}/100</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Key Strengths:</p>
                      <ul className="list-disc list-inside text-sm text-gray-300">
                        {deal.ai_scoring.key_strengths?.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="notes" className="p-6 space-y-4">
              <div className="space-y-2">
                <Textarea 
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white"
                />
                <Button onClick={addNote} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </div>

              <div className="space-y-3">
                {notes.map(note => (
                  <Card key={note.id} className="bg-gray-900 border-gray-700">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-400">{note.author_email}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(note.created_date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300">{note.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="p-6 space-y-4">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Create Task</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input 
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <Textarea 
                    placeholder="Task description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input 
                      type="email"
                      placeholder="Assign to (email)"
                      value={newTask.assigned_to_email}
                      onChange={(e) => setNewTask({...newTask, assigned_to_email: e.target.value})}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <Input 
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <Button onClick={addTask} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Task
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {tasks.map(task => (
                  <Card key={task.id} className="bg-gray-900 border-gray-700">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-white">{task.title}</h4>
                          {task.description && <p className="text-sm text-gray-400 mt-1">{task.description}</p>}
                        </div>
                        <Badge className={
                          task.status === 'completed' ? 'bg-green-600' :
                          task.status === 'in_progress' ? 'bg-blue-600' :
                          task.status === 'blocked' ? 'bg-red-600' : 'bg-gray-600'
                        }>
                          {task.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {task.assigned_to_email}
                        </span>
                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {task.status !== 'completed' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateTaskStatus(task.id, 'in_progress')}
                          >
                            In Progress
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateTaskStatus(task.id, 'completed')}
                          >
                            Complete
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ai" className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={() => runAIAnalysis('sentiment')}
                  disabled={analyzing}
                >
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  <div className="text-left">
                    <div className="font-semibold">Sentiment Analysis</div>
                    <div className="text-xs text-gray-400">Analyze founder enthusiasm & investor sentiment</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={() => runAIAnalysis('summary')}
                  disabled={analyzing}
                >
                  <FileText className="w-5 h-5 text-purple-500" />
                  <div className="text-left">
                    <div className="font-semibold">External Summary</div>
                    <div className="text-xs text-gray-400">Summarize news & press releases</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={() => runAIAnalysis('prediction')}
                  disabled={analyzing}
                >
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <div className="text-left">
                    <div className="font-semibold">Outcome Prediction</div>
                    <div className="text-xs text-gray-400">Predict acquisition/IPO potential</div>
                  </div>
                </Button>
              </div>

              {deal.sentiment_analysis && (
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Sentiment Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Overall Sentiment</span>
                      <Badge>{deal.sentiment_analysis.overall_sentiment}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Founder Enthusiasm</span>
                      <span className="text-white">{deal.sentiment_analysis.founder_enthusiasm}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Investor Sentiment</span>
                      <span className="text-white">{deal.sentiment_analysis.investor_sentiment}/10</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {deal.external_summary && (
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">External Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-gray-300">{deal.external_summary.summary}</p>
                    {deal.external_summary.key_highlights && (
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Key Highlights</h4>
                        <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                          {deal.external_summary.key_highlights.map((h, i) => <li key={i}>{h}</li>)}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {deal.outcome_prediction && (
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Outcome Prediction</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-400">Acquisition Likelihood</span>
                        <div className="text-2xl font-bold text-white">{deal.outcome_prediction.acquisition_likelihood}%</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-400">IPO Potential</span>
                        <div className="text-2xl font-bold text-white">{deal.outcome_prediction.ipo_potential}%</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-400">Unicorn Probability</span>
                        <div className="text-2xl font-bold text-white">{deal.outcome_prediction.unicorn_probability}%</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-400">Time to Exit</span>
                        <div className="text-2xl font-bold text-white">{deal.outcome_prediction.time_to_exit_years} years</div>
                      </div>
                    </div>
                    <div>
                      <Badge className="bg-purple-600">{deal.outcome_prediction.predicted_outcome}</Badge>
                      <Badge className="ml-2" variant="outline">{deal.outcome_prediction.confidence_level} confidence</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}