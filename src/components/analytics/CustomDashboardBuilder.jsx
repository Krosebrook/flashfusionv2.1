import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Settings, Save, X } from 'lucide-react';

const AVAILABLE_WIDGETS = [
  { id: 'metric', name: 'Metric Card', type: 'metric', size: 'small' },
  { id: 'chart', name: 'Line Chart', type: 'chart', size: 'medium' },
  { id: 'table', name: 'Data Table', type: 'table', size: 'large' },
  { id: 'goal', name: 'Goal Tracker', type: 'goal', size: 'small' },
  { id: 'insight', name: 'AI Insight', type: 'insight', size: 'medium' }
];

export default function CustomDashboardBuilder() {
  const [dashboards, setDashboards] = useState([]);
  const [currentDashboard, setCurrentDashboard] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardName, setDashboardName] = useState('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchDashboards();
  }, []);

  const fetchDashboards = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.AnalyticsDashboard.list('-updated_date', 50);
      setDashboards(data);
      if (data.length > 0) {
        const defaultDash = data.find(d => d.is_default) || data[0];
        setCurrentDashboard(defaultDash);
        setWidgets(defaultDash.widgets || []);
      }
    } catch (err) {
      console.error('Failed to fetch dashboards:', err);
    } finally {
      setLoading(false);
    }
  };

  const addWidget = async (widgetTemplate) => {
    const newWidget = {
      id: `widget_${Date.now()}`,
      type: widgetTemplate.type,
      title: widgetTemplate.name,
      position: widgets.length,
      size: widgetTemplate.size,
      config: {}
    };

    const updatedWidgets = [...widgets, newWidget];
    setWidgets(updatedWidgets);

    if (currentDashboard) {
      await base44.entities.AnalyticsDashboard.update(currentDashboard.id, {
        widgets: updatedWidgets
      });
    }
  };

  const removeWidget = async (widgetId) => {
    const updatedWidgets = widgets.filter(w => w.id !== widgetId);
    setWidgets(updatedWidgets);

    if (currentDashboard) {
      await base44.entities.AnalyticsDashboard.update(currentDashboard.id, {
        widgets: updatedWidgets
      });
    }
  };

  const createNewDashboard = async () => {
    if (!dashboardName.trim()) return;

    try {
      const newDash = await base44.entities.AnalyticsDashboard.create({
        name: dashboardName,
        widgets: [],
        is_default: dashboards.length === 0
      });

      setDashboards([...dashboards, newDash]);
      setCurrentDashboard(newDash);
      setWidgets([]);
      setDashboardName('');
    } catch (err) {
      console.error('Failed to create dashboard:', err);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading dashboards...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Custom Dashboards</h1>
          <p className="text-gray-600">Build personalized analytics dashboards with drag-and-drop widgets</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Dashboard
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Dashboard</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Dashboard name"
                value={dashboardName}
                onChange={e => setDashboardName(e.target.value)}
              />
              <Button onClick={createNewDashboard} className="w-full">
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dashboard Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {dashboards.map(dash => (
          <Button
            key={dash.id}
            variant={currentDashboard?.id === dash.id ? 'default' : 'outline'}
            onClick={() => {
              setCurrentDashboard(dash);
              setWidgets(dash.widgets || []);
            }}
          >
            {dash.name}
            {dash.is_default && <Badge className="ml-2">Default</Badge>}
          </Button>
        ))}
      </div>

      {currentDashboard && (
        <div className="space-y-4">
          {/* Widget Builder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Available Widgets</span>
                <Button
                  size="sm"
                  variant={editMode ? 'default' : 'outline'}
                  onClick={() => setEditMode(!editMode)}
                  className="gap-2"
                >
                  {editMode ? (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4" />
                      Edit
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {editMode && (
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {AVAILABLE_WIDGETS.map(widget => (
                    <Button
                      key={widget.id}
                      variant="outline"
                      onClick={() => addWidget(widget)}
                      className="justify-start h-auto flex-col items-start p-3"
                    >
                      <span className="font-medium">{widget.name}</span>
                      <span className="text-xs text-gray-600">{widget.size}</span>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Widgets Display */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {widgets.map(widget => (
              <Card key={widget.id} className={`${widget.size === 'large' ? 'lg:col-span-3' : ''} ${widget.size === 'medium' ? 'md:col-span-2' : ''}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base">{widget.title}</CardTitle>
                  {editMode && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeWidget(widget.id)}
                      className="h-6 w-6"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-50 rounded flex items-center justify-center text-gray-600 text-sm">
                    {widget.type} Widget
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}