"use client";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Sparkles,
  Zap,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  Rocket,
  FileText,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import WelcomeScreen from "../components/onboarding/WelcomeScreen";
import InteractiveTour from "../components/onboarding/InteractiveTour";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [intent, setIntent] = useState("");
  const [recentActivity, setRecentActivity] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [userGoal, setUserGoal] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [currentUser, usageLogs, workflows, schedules] = await Promise.all([
        base44.auth.me(),
        base44.entities.UsageLog.list("-created_date", 5),
        base44.entities.Workflow.list(),
        base44.entities.ContentSchedule.filter({ status: "scheduled" }),
      ]);

      setUser(currentUser);
      setRecentActivity(usageLogs);

      // Check onboarding
      const profiles = await base44.entities.UserProfile.filter({
        created_by: currentUser.email,
      });
      if (profiles.length > 0) {
        const profile = profiles[0];
        if (!profile.tour_completed) {
          if (profile.onboarding_goal) {
            setUserGoal(profile.onboarding_goal);
            setShowTour(true);
          } else {
            setShowWelcome(true);
          }
        }
      } else {
        setShowWelcome(true);
      }

      // Generate contextual suggestions
      const suggestionsData = [];
      if (usageLogs.length === 0) {
        suggestionsData.push({
          action: "Try Universal Generator",
          description: "Generate your first AI-powered application",
          href: createPageUrl("UniversalGenerator"),
          icon: Rocket,
          color: "purple",
        });
      }
      if (workflows.length === 0) {
        suggestionsData.push({
          action: "Create a workflow",
          description: "Automate repetitive tasks",
          href: createPageUrl("AdvancedWorkflows"),
          icon: Workflow,
          color: "blue",
        });
      }
      if (schedules.length > 0) {
        suggestionsData.push({
          action: "Review scheduled content",
          description: `${schedules.length} posts scheduled`,
          href: createPageUrl("ContentScheduling"),
          icon: Clock,
          color: "green",
        });
      }
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
    setLoading(false);
  };

  const handleIntentSubmit = (e) => {
    e.preventDefault();
    if (!intent.trim()) return;
    
    // Route to appropriate tool based on intent
    if (intent.toLowerCase().includes("content") || intent.toLowerCase().includes("post")) {
      window.location.href = createPageUrl("ContentCreator");
    } else if (intent.toLowerCase().includes("workflow") || intent.toLowerCase().includes("automat")) {
      window.location.href = createPageUrl("AdvancedWorkflows");
    } else if (intent.toLowerCase().includes("deal") || intent.toLowerCase().includes("invest")) {
      window.location.href = createPageUrl("DealSourcer");
    } else {
      window.location.href = createPageUrl("UniversalGenerator");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="spacing-section max-w-5xl mx-auto" data-tour="dashboard">
      {showWelcome && user && (
        <WelcomeScreen
          user={user}
          onComplete={(goal) => {
            setUserGoal(goal);
            setShowWelcome(false);
            setShowTour(true);
          }}
          onStartTour={() => setShowTour(true)}
        />
      )}

      {showTour && userGoal && user && (
        <InteractiveTour
          goal={userGoal}
          userEmail={user.email}
          onComplete={() => setShowTour(false)}
        />
      )}

      {/* Hero Action Zone */}
      <div className="surface-elevated p-8 text-center">
        <h1 className="text-hero mb-3">
          What do you want to create today?
        </h1>
        <p className="text-body mb-6">
          Describe your idea and we'll orchestrate the right AI agents
        </p>
        <form onSubmit={handleIntentSubmit} className="max-w-2xl mx-auto">
          <div className="relative">
            <Input
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              placeholder="e.g., Build a CRM for real estate agents with lead tracking..."
              className="h-14 pl-5 pr-32 text-base bg-[hsl(var(--surface-primary))] border-[hsl(var(--border-interactive))] focus:border-[hsl(var(--action-primary))]"
            />
            <Button
              type="submit"
              disabled={!intent.trim()}
              className="absolute right-2 top-2 btn-action-primary h-10"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate
            </Button>
          </div>
        </form>
        <div className="flex justify-center gap-3 mt-4 text-sm text-gray-400">
          <span>Try:</span>
          <button onClick={() => setIntent("Create a landing page")} className="text-purple-400 hover:text-purple-300">
            Landing page
          </button>
          <span>•</span>
          <button onClick={() => setIntent("Write social media content")} className="text-purple-400 hover:text-purple-300">
            Social content
          </button>
          <span>•</span>
          <button onClick={() => setIntent("Automate workflow")} className="text-purple-400 hover:text-purple-300">
            Workflow
          </button>
        </div>
      </div>

      {/* Context Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="surface-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Available Credits</p>
              <p className="text-2xl font-bold text-[hsl(var(--text-primary))]">
                {user?.credits_remaining?.toLocaleString() || 0}
              </p>
            </div>
            <Zap className="w-8 h-8 text-yellow-400" />
          </div>
          {user?.credits_remaining < 100 && (
            <Link to={createPageUrl("Billing")} className="text-xs text-yellow-400 hover:text-yellow-300 mt-2 inline-block">
              Add more →
            </Link>
          )}
        </div>

        <div className="surface-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Active Workflows</p>
              <p className="text-2xl font-bold text-[hsl(var(--text-primary))]">
                {suggestions.find(s => s.icon === Workflow) ? "0" : "3"}
              </p>
            </div>
            <Workflow className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="surface-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">This Week</p>
              <p className="text-2xl font-bold text-[hsl(var(--text-primary))]">
                {recentActivity.length}
              </p>
              <p className="text-xs text-gray-500">generations</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <h2 className="text-heading mb-4">Suggested Next Actions</h2>
          <div className="grid gap-3">
            {suggestions.map((suggestion, idx) => (
              <Link key={idx} to={suggestion.href}>
                <div className="surface-card-interactive p-4 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg bg-${suggestion.color}-500/20 flex items-center justify-center`}>
                        <suggestion.icon className={`w-5 h-5 text-${suggestion.color}-400`} />
                      </div>
                      <div>
                        <p className="font-medium text-[hsl(var(--text-primary))]">{suggestion.action}</p>
                        <p className="text-caption">{suggestion.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-gray-300 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity Stream */}
      {recentActivity.length > 0 && (
        <div>
          <h2 className="text-heading mb-4">Recent Activity</h2>
          <div className="surface-card p-4">
            <div className="space-y-3">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-700 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mt-1">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[hsl(var(--text-primary))] truncate">
                      {activity.details}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-gray-500">
                        {new Date(activity.created_date).toLocaleDateString()}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {activity.credits_used} credits
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Access */}
      <div>
        <h2 className="text-heading mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to={createPageUrl("UniversalGenerator")}>
            <div className="surface-card-interactive p-5 text-center group">
              <Rocket className="w-10 h-10 mx-auto mb-3 text-purple-400 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-[hsl(var(--text-primary))] mb-1">Universal Generator</h3>
              <p className="text-xs text-gray-500">Build complete apps</p>
            </div>
          </Link>
          <Link to={createPageUrl("ContentCreator")}>
            <div className="surface-card-interactive p-5 text-center group">
              <FileText className="w-10 h-10 mx-auto mb-3 text-blue-400 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-[hsl(var(--text-primary))] mb-1">Content Studio</h3>
              <p className="text-xs text-gray-500">AI-powered content</p>
            </div>
          </Link>
          <Link to={createPageUrl("DealSourcer")}>
            <div className="surface-card-interactive p-5 text-center group">
              <Zap className="w-10 h-10 mx-auto mb-3 text-teal-400 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-[hsl(var(--text-primary))] mb-1">Deal Sourcer</h3>
              <p className="text-xs text-gray-500">Find opportunities</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}