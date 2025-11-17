import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Download, Sparkles, CheckCircle2, User } from "lucide-react";

export default function TemplateDetail({ template, onInstall }) {
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const user = await base44.auth.me();

      if (template.credits_cost > 0 && user.credits_remaining < template.credits_cost) {
        alert(`Insufficient credits. You need ${template.credits_cost} credits to install this template.`);
        setIsInstalling(false);
        return;
      }

      // Create a new workflow from the template
      await base44.entities.Workflow.create({
        name: `${template.name} (Installed)`,
        description: template.description,
        nodes: template.workflow_definition.nodes || [],
        connections: template.workflow_definition.connections || [],
        status: "draft"
      });

      // Update template install count
      await base44.entities.AgentTemplate.update(template.id, {
        installs: (template.installs || 0) + 1
      });

      // Deduct credits if needed
      if (template.credits_cost > 0) {
        await base44.auth.updateMe({
          credits_remaining: user.credits_remaining - template.credits_cost
        });
      }

      alert("Template installed successfully! Check your workflows.");
      onInstall?.(template);
    } catch (error) {
      console.error("Failed to install template:", error);
      alert("Failed to install template. Please try again.");
    }
    setIsInstalling(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700 p-6">
        {template.preview_image && (
          <img 
            src={template.preview_image} 
            alt={template.name}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}

        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{template.name}</h1>
                {template.is_featured && (
                  <Badge className="bg-yellow-500/20 text-yellow-400">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>{template.rating?.toFixed(1) || "0.0"} ({template.reviews?.length || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  <span>{template.installs || 0} installs</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{template.author || "FlashFusion"}</span>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleInstall}
            disabled={isInstalling}
            className="w-full md:w-auto bg-purple-600 hover:bg-purple-700"
          >
            {isInstalling ? (
              "Installing..."
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Install Template {template.credits_cost > 0 && `(${template.credits_cost} credits)`}
              </>
            )}
          </Button>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usecases">Use Cases</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-gray-300 whitespace-pre-line">{template.description}</p>
          </Card>

          {template.tags && template.tags.length > 0 && (
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag, i) => (
                  <Badge key={i} variant="outline">{tag}</Badge>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="usecases" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Example Use Cases</h3>
            {template.use_cases && template.use_cases.length > 0 ? (
              <div className="space-y-3">
                {template.use_cases.map((useCase, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-300">{useCase}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No use cases provided yet.</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">User Reviews</h3>
            {template.reviews && template.reviews.length > 0 ? (
              <div className="space-y-4">
                {template.reviews.map((review, i) => (
                  <div key={i} className="bg-gray-900 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-400">{review.user_email}</span>
                    </div>
                    <p className="text-gray-300">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}