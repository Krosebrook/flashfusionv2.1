import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, TrendingUp } from 'lucide-react';

export default function GoalTracker() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newGoal, setNewGoal] = useState({
    title: '',
    metric: 'revenue',
    target_value: 0,
    category: ''
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.PerformanceGoal.list('-created_date', 50);
      setGoals(data);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async () => {
    if (!newGoal.title || newGoal.target_value <= 0) return;

    try {
      const goal = await base44.entities.PerformanceGoal.create({
        ...newGoal,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        current_value: 0,
        progress_percentage: 0,
        status: 'on_track'
      });

      setGoals([...goals, goal]);
      setNewGoal({ title: '', metric: 'revenue', target_value: 0, category: '' });
    } catch (err) {
      console.error('Failed to create goal:', err);
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      await base44.entities.PerformanceGoal.delete(goalId);
      setGoals(goals.filter(g => g.id !== goalId));
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'on_track':
        return 'bg-green-100 text-green-800';
      case 'at_risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading goals...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <TrendingUp className="w-8 h-8" />
          Performance Goals
        </h1>
        <p className="text-gray-600">Set and track personal performance goals</p>
      </div>

      {/* Create New Goal */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Goal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-5">
            <Input
              placeholder="Goal title"
              value={newGoal.title}
              onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
            />
            <Select value={newGoal.metric} onValueChange={metric => setNewGoal({ ...newGoal, metric })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="content_created">Content Created</SelectItem>
                <SelectItem value="agent_tasks">Agent Tasks</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="conversion_rate">Conversion Rate</SelectItem>
                <SelectItem value="roi">ROI</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Target value"
              value={newGoal.target_value}
              onChange={e => setNewGoal({ ...newGoal, target_value: parseFloat(e.target.value) })}
            />
            <Input
              placeholder="Category"
              value={newGoal.category}
              onChange={e => setNewGoal({ ...newGoal, category: e.target.value })}
            />
            <Button onClick={createGoal} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Goal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      <div className="grid gap-4 md:grid-cols-2">
        {goals.map(goal => (
          <Card key={goal.id}>
            <CardHeader className="flex flex-row items-start justify-between pb-3">
              <div>
                <CardTitle className="text-lg">{goal.title}</CardTitle>
                <p className="text-xs text-gray-600 mt-1">{goal.metric}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteGoal(goal.id)}
                className="h-8 w-8"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-bold">{goal.progress_percentage || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(goal.progress_percentage || 0).toString()}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-gray-600">Current</p>
                  <p className="font-bold">{goal.current_value || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Target</p>
                  <p className="font-bold">{goal.target_value}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Status</p>
                  <Badge className={`mt-1 ${getStatusColor(goal.status)}`}>
                    {goal.status}
                  </Badge>
                </div>
              </div>

              <div className="text-xs text-gray-600">
                <p>Due: {new Date(goal.end_date).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}