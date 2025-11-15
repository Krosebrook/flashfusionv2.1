import { useState } from "react";
import { InvokeLLM } from "@/integrations/Core";
import { User, UsageLog } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Play, Loader2, Copy, Check, Download, FileText, History
} from "lucide-react";

export default function PluginRunner({ plugin, onClose }) {
  const [input, setInput] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [outputFormat, setOutputFormat] = useState("text");
  const [temperature, setTemperature] = useState(0.7);
  const [output, setOutput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const runPlugin = async () => {
    setIsProcessing(true);
    setError(null);
    setOutput("");

    const creditsToUse = 25;

    try {
      const user = await User.me();
      if (user.credits_remaining < creditsToUse) {
        setError("Insufficient credits. Please upgrade your plan.");
        setIsProcessing(false);
        return;
      }

      // Enhanced prompt with user customizations
      let enhancedPrompt = plugin.system_prompt;
      
      if (customInstructions) {
        enhancedPrompt += `\n\nAdditional Instructions: ${customInstructions}`;
      }
      
      if (outputFormat !== "text") {
        enhancedPrompt += `\n\nOutput Format: Please format the response as ${outputFormat.toUpperCase()}.`;
      }

      enhancedPrompt += `\n\nUser Input: "${input}"`;

      const requestOptions = {
        prompt: enhancedPrompt,
      };

      // Add JSON schema if output format is JSON
      if (outputFormat === "json") {
        requestOptions.response_json_schema = {
          type: "object",
          properties: {
            result: { type: "string" },
            metadata: { type: "object" }
          }
        };
      }

      const result = await InvokeLLM(requestOptions);
      
      const formattedResult = typeof result === 'object' ? JSON.stringify(result, null, 2) : result;
      setOutput(formattedResult);

      // Add to history
      const newHistoryItem = {
        input: input.substring(0, 100) + (input.length > 100 ? "..." : ""),
        output: formattedResult.substring(0, 200) + (formattedResult.length > 200 ? "..." : ""),
        timestamp: new Date().toISOString(),
        credits_used: creditsToUse
      };
      setHistory([newHistoryItem, ...history.slice(0, 9)]); // Keep last 10 runs

      // Update user credits and log usage
      await User.updateMyUserData({ 
        credits_remaining: user.credits_remaining - creditsToUse 
      });
      
      await UsageLog.create({
        feature: "PluginRunner",
        credits_used: creditsToUse,
        details: `Ran plugin: ${plugin.name} - ${input.substring(0, 50)}${input.length > 50 ? "..." : ""}`
      });

    } catch (e) {
      console.error(e);
      setError("Plugin execution failed. Please try again or contact support.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadOutput = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plugin.name.toLowerCase().replace(/\s+/g, '-')}-output.${outputFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadFromHistory = (historyItem) => {
    setInput(historyItem.input.replace("...", ""));
    setOutput(historyItem.output);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <Tabs defaultValue="input" className="w-full">
          <TabsList className="bg-gray-700 mb-6">
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-4">
            <div className="space-y-2">
              <Label>Your Input</Label>
              <Textarea
                placeholder="Enter your input here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-gray-900 border-gray-600 min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Additional Instructions (Optional)</Label>
              <Textarea
                placeholder="Any specific requirements or formatting preferences..."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="bg-gray-900 border-gray-600 h-20"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label>Output Format</Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger className="bg-gray-900 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Plain Text</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="code">Code</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={runPlugin} 
                disabled={isProcessing || !input}
                className="bg-blue-600 hover:bg-blue-700 self-end"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Plugin (25 Credits)
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Plugin System Prompt</h3>
              <p className="text-sm text-gray-300 bg-gray-800 p-3 rounded border">
                {plugin.system_prompt}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Response Style (Temperature: {temperature})</Label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>More Focused</span>
                <span>More Creative</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No previous runs yet</p>
                <p className="text-sm">Your plugin execution history will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="font-medium">Previous Runs</h3>
                {history.map((item, index) => (
                  <div 
                    key={index}
                    className="p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => loadFromHistory(item)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium truncate flex-1">
                        {item.input}
                      </p>
                      <div className="flex items-center gap-2 ml-3">
                        <Badge variant="outline" className="text-xs">
                          {item.credits_used} credits
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {item.output}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded-lg">
          <p className="font-medium">Plugin Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Output Display */}
      {output && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-400" />
              Output
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyOutput}
              >
                {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadOutput}
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <pre className="text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
              {output}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}