import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Loader2, Clock, Film, MessageSquare, Download } from "lucide-react";

const videoFormats = [
  { id: "short", name: "Short Form (15-60s)", platforms: ["TikTok", "Instagram Reels", "YouTube Shorts"] },
  { id: "medium", name: "Medium Form (1-5 min)", platforms: ["YouTube", "Facebook", "LinkedIn"] },
  { id: "long", name: "Long Form (5-15 min)", platforms: ["YouTube", "IGTV"] }
];

export default function VideoScriptGenerator({ onScriptGenerated, brandKitId }) {
  const [formData, setFormData] = useState({
    topic: "",
    format: "short",
    platform: "TikTok",
    tone: "engaging",
    targetLength: "30"
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState(null);

  const handleGenerate = async () => {
    if (!formData.topic.trim()) return;

    setIsGenerating(true);
    try {
      const user = await base44.auth.me();
      
      if (user.credits_remaining < 120) {
        alert("Insufficient credits. You need at least 120 credits to generate a video script.");
        setIsGenerating(false);
        return;
      }

      const format = videoFormats.find(f => f.id === formData.format);

      const prompt = `Create a complete video script for ${formData.platform}:

Topic: ${formData.topic}
Format: ${format.name}
Target Length: ${formData.targetLength} seconds
Tone: ${formData.tone}

Generate:
1. Hook (first 3 seconds to grab attention)
2. Full script with timing marks
3. Detailed storyboard with 5-8 scenes including:
   - Scene description
   - Visual elements
   - Camera angles/movements
   - On-screen text suggestions
   - Background music mood
4. Call-to-action
5. Hashtag suggestions
6. Voiceover notes and pacing guidelines

Make it engaging, platform-optimized, and ready to film.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            hook: { type: "string" },
            script: { type: "string" },
            storyboard: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  scene_number: { type: "number" },
                  duration: { type: "string" },
                  description: { type: "string" },
                  visuals: { type: "string" },
                  camera: { type: "string" },
                  text_overlay: { type: "string" },
                  music_mood: { type: "string" }
                }
              }
            },
            call_to_action: { type: "string" },
            hashtags: { type: "array", items: { type: "string" } },
            voiceover_notes: { type: "string" }
          }
        }
      });

      const script = {
        title: formData.topic,
        type: "video_script",
        platform: formData.platform,
        content: result.script,
        storyboard: result.storyboard,
        metadata: {
          hook: result.hook,
          call_to_action: result.call_to_action,
          hashtags: result.hashtags,
          voiceover_notes: result.voiceover_notes,
          format: formData.format,
          target_length: formData.targetLength
        },
        brand_kit_id: brandKitId,
        status: "draft"
      };

      setGeneratedScript(script);

      await base44.auth.updateMe({
        credits_remaining: user.credits_remaining - 120
      });

      await base44.entities.UsageLog.create({
        feature: "VideoScriptGenerator",
        credits_used: 120,
        details: `Generated video script: ${formData.topic}`
      });

    } catch (error) {
      console.error("Script generation failed:", error);
      alert("Failed to generate video script. Please try again.");
    }
    setIsGenerating(false);
  };

  const handleSave = async () => {
    try {
      const saved = await base44.entities.ContentPiece.create(generatedScript);
      onScriptGenerated?.(saved);
      setGeneratedScript(null);
      setFormData({ topic: "", format: "short", platform: "TikTok", tone: "engaging", targetLength: "30" });
    } catch (error) {
      console.error("Failed to save script:", error);
      alert("Failed to save script. Please try again.");
    }
  };

  const handleDownload = () => {
    const content = `VIDEO SCRIPT: ${generatedScript.title}
${'='.repeat(50)}

PLATFORM: ${generatedScript.platform}
FORMAT: ${generatedScript.metadata.format}
TARGET LENGTH: ${generatedScript.metadata.target_length}s

HOOK (First 3 seconds)
${generatedScript.metadata.hook}

FULL SCRIPT
${generatedScript.content}

STORYBOARD
${generatedScript.storyboard.map(scene => `
Scene ${scene.scene_number} (${scene.duration})
Description: ${scene.description}
Visuals: ${scene.visuals}
Camera: ${scene.camera}
Text Overlay: ${scene.text_overlay}
Music: ${scene.music_mood}
`).join('\n')}

CALL TO ACTION
${generatedScript.metadata.call_to_action}

HASHTAGS
${generatedScript.metadata.hashtags.join(' ')}

VOICEOVER NOTES
${generatedScript.metadata.voiceover_notes}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedScript.title.replace(/\s+/g, '_')}_Script.txt`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Video className="w-5 h-5 text-red-400" />
          <h3 className="text-xl font-semibold">Video Script Generator</h3>
          <Badge className="ml-auto">120 credits</Badge>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Video Topic *</label>
            <Input
              placeholder="e.g., 5 Tips for Better Morning Routine"
              value={formData.topic}
              onChange={(e) => setFormData({...formData, topic: e.target.value})}
              className="bg-gray-900 border-gray-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Format</label>
              <Select value={formData.format} onValueChange={(value) => setFormData({...formData, format: value})}>
                <SelectTrigger className="bg-gray-900 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {videoFormats.map((format) => (
                    <SelectItem key={format.id} value={format.id}>
                      {format.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Platform</label>
              <Select value={formData.platform} onValueChange={(value) => setFormData({...formData, platform: value})}>
                <SelectTrigger className="bg-gray-900 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TikTok">TikTok</SelectItem>
                  <SelectItem value="Instagram">Instagram Reels</SelectItem>
                  <SelectItem value="YouTube">YouTube</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Length (seconds)</label>
              <Input
                type="number"
                placeholder="30"
                value={formData.targetLength}
                onChange={(e) => setFormData({...formData, targetLength: e.target.value})}
                className="bg-gray-900 border-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tone</label>
            <Select value={formData.tone} onValueChange={(value) => setFormData({...formData, tone: value})}>
              <SelectTrigger className="bg-gray-900 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="engaging">Engaging & Upbeat</SelectItem>
                <SelectItem value="educational">Educational & Informative</SelectItem>
                <SelectItem value="inspirational">Inspirational & Motivational</SelectItem>
                <SelectItem value="humorous">Humorous & Fun</SelectItem>
                <SelectItem value="professional">Professional & Polished</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !formData.topic.trim()}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Script & Storyboard...
              </>
            ) : (
              <>
                <Film className="w-4 h-4 mr-2" />
                Generate Video Script
              </>
            )}
          </Button>
        </div>
      </Card>

      {generatedScript && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">{generatedScript.title}</h3>
            <div className="flex gap-3">
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700" size="sm">
                Save Script
              </Button>
            </div>
          </div>

          <Tabs defaultValue="script" className="w-full">
            <TabsList className="bg-gray-900">
              <TabsTrigger value="script">Script</TabsTrigger>
              <TabsTrigger value="storyboard">Storyboard</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="script" className="space-y-4">
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-yellow-400" />
                  <h4 className="font-semibold">Hook (First 3 seconds)</h4>
                </div>
                <p className="text-yellow-300">{generatedScript.metadata.hook}</p>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Full Script</h4>
                <p className="text-gray-300 whitespace-pre-line leading-relaxed">{generatedScript.content}</p>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Call to Action</h4>
                <p className="text-green-300">{generatedScript.metadata.call_to_action}</p>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Hashtags</h4>
                <div className="flex flex-wrap gap-2">
                  {generatedScript.metadata.hashtags.map((tag, i) => (
                    <Badge key={i} variant="outline">#{tag}</Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="storyboard" className="space-y-4">
              {generatedScript.storyboard.map((scene) => (
                <div key={scene.scene_number} className="bg-gray-900 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Scene {scene.scene_number}</h4>
                    <Badge className="bg-blue-500/20 text-blue-400">
                      <Clock className="w-3 h-3 mr-1" />
                      {scene.duration}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Description:</span>
                      <p className="text-gray-300">{scene.description}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Visuals:</span>
                      <p className="text-gray-300">{scene.visuals}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Camera:</span>
                      <p className="text-gray-300">{scene.camera}</p>
                    </div>
                    {scene.text_overlay && (
                      <div>
                        <span className="text-gray-400">Text Overlay:</span>
                        <p className="text-yellow-300 font-semibold">{scene.text_overlay}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-400">Music Mood:</span>
                      <p className="text-purple-300">{scene.music_mood}</p>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="bg-gray-900 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Video Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Platform:</span>
                    <p className="font-medium">{generatedScript.platform}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Format:</span>
                    <p className="font-medium">{generatedScript.metadata.format}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Target Length:</span>
                    <p className="font-medium">{generatedScript.metadata.target_length}s</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Scenes:</span>
                    <p className="font-medium">{generatedScript.storyboard.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Voiceover Notes</h4>
                <p className="text-sm text-gray-300 whitespace-pre-line">{generatedScript.metadata.voiceover_notes}</p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}