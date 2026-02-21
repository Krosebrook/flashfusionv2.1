import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  Sparkles,
  User,
  CreditCard,
  Plug,
  Rocket,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const setupTasks = [
  {
    id: "profile",
    title: "Complete Your Profile",
    description: "Add your name and preferences",
    icon: User,
    action: "Go to Settings",
    link: "/UserSettings",
    checkField: "profile_completed",
  },
  {
    id: "credits",
    title: "Understand Credits",
    description: "Learn how credits work and check your balance",
    icon: CreditCard,
    action: "View Billing",
    link: "/Billing",
    checkField: "credits_checked",
  },
  {
    id: "integration",
    title: "Connect Your First Tool",
    description: "Link Google Drive, Slack, or another integration",
    icon: Plug,
    action: "Browse Integrations",
    link: "/Integrations",
    checkField: "first_integration",
  },
  {
    id: "generate",
    title: "Generate Your First Feature",
    description: "Try the Feature Generator or Content Creator",
    icon: Sparkles,
    action: "Start Generating",
    link: "/FeatureGenerator",
    checkField: "first_generation",
  },
  {
    id: "explore",
    title: "Explore E-commerce Suite",
    description: "Check out marketing automation and analytics",
    icon: Rocket,
    action: "Open E-commerce",
    link: "/EcommerceSuite",
    checkField: "explored_ecommerce",
  },
];

export default function SetupChecklist({ user }) {
  const [checklist, setChecklist] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    fetchChecklist();
  }, [user]);

  const fetchChecklist = async () => {
    try {
      const profiles = await base44.entities.UserProfile.filter({
        created_by: user.email,
      });

      if (profiles.length > 0) {
        setChecklist(profiles[0]);
        // Auto-dismiss if all tasks completed
        if (isChecklistComplete(profiles[0])) {
          setIsDismissed(true);
        }
      } else {
        // Create initial profile
        const newProfile = await base44.entities.UserProfile.create({
          profile_completed: false,
          credits_checked: false,
          first_integration: false,
          first_generation: false,
          explored_ecommerce: false,
        });
        setChecklist(newProfile);
      }
    } catch (error) {
      console.error("Failed to fetch checklist:", error);
    }
  };

  const isChecklistComplete = (profile) => {
    return setupTasks.every((task) => profile[task.checkField]);
  };

  const markTaskComplete = async (taskId, checkField) => {
    if (!checklist) return;

    try {
      await base44.entities.UserProfile.update(checklist.id, {
        [checkField]: true,
      });
      fetchChecklist();
    } catch (error) {
      console.error("Failed to mark task complete:", error);
    }
  };

  const handleDismiss = async () => {
    setIsDismissed(true);
    if (checklist) {
      try {
        await base44.entities.UserProfile.update(checklist.id, {
          checklist_dismissed: true,
        });
      } catch (error) {
        console.error("Failed to dismiss checklist:", error);
      }
    }
  };

  if (!checklist || isDismissed) return null;

  const completedTasks = setupTasks.filter(
    (task) => checklist[task.checkField]
  ).length;
  const progress = (completedTasks / setupTasks.length) * 100;
  const isComplete = completedTasks === setupTasks.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/50 overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {isComplete ? "🎉 Setup Complete!" : "Getting Started"}
                </h3>
                <p className="text-sm text-gray-400">
                  {completedTasks} of {setupTasks.length} tasks completed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500/20 text-purple-300">
                {Math.round(progress)}%
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-white"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Progress value={progress} className="h-2 mb-4" />

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2"
              >
                {setupTasks.map((task) => {
                  const Icon = task.icon;
                  const isCompleted = checklist[task.checkField];

                  return (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                        isCompleted
                          ? "bg-green-500/10 border border-green-500/30"
                          : "bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        )}
                        <Icon
                          className={`w-5 h-5 flex-shrink-0 ${
                            isCompleted ? "text-green-400" : "text-purple-400"
                          }`}
                        />
                        <div className="flex-1">
                          <p
                            className={`font-medium text-sm ${
                              isCompleted
                                ? "text-green-400 line-through"
                                : "text-white"
                            }`}
                          >
                            {task.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {task.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isCompleted && (
                          <>
                            <Link to={createPageUrl(task.link.replace("/", ""))}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                              >
                                {task.action}
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                markTaskComplete(task.id, task.checkField)
                              }
                              className="text-xs text-gray-400 hover:text-white"
                            >
                              Mark Done
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {isComplete && isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center"
            >
              <p className="text-green-400 font-medium mb-2">
                🎉 Congratulations! You're all set up!
              </p>
              <p className="text-sm text-gray-400">
                You're ready to build amazing things with FlashFusion
              </p>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}