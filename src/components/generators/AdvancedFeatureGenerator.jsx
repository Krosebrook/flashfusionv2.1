import { useState } from "react";
import { InvokeLLM } from "@/integrations/Core";
import { User, UsageLog } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Code2, Sparkles, Download, Copy, Check, 
  Loader2, FileCode, Database, Globe
} from "lucide-react";

const featureTemplates = {
  "React Component": {
    icon: Code2,
    examples: ["Pricing table", "User profile card", "Data visualization chart", "Modal dialog"],
    prompt: "Create a production-ready React component with TypeScript, TailwindCSS styling, and proper props interface."
  },
  "API Route": {
    icon: Globe, 
    examples: ["User authentication", "Data CRUD operations", "File upload handler", "Payment processing"],
    prompt: "Create a Node.js API route with proper error handling, validation, and documentation."
  },
  "Database Schema": {
    icon: Database,
    examples: ["E-commerce tables", "User management system", "Blog platform", "Analytics tracking"],
    prompt: "Create a complete database schema with proper relationships, indexes, and constraints."
  },
  "Full Stack Feature": {
    icon: Sparkles,
    examples: ["User dashboard", "Chat system", "File manager", "Analytics panel"],
    prompt: "Create a complete full-stack feature including frontend component, API routes, and database schema."
  }
};

export default function AdvancedFeatureGenerator() {
  const [prompt, setPrompt] = useState("");
  const [featureType, setFeatureType] = useState("React Component");
  const [complexity, setComplexity] = useState("Medium");
  const [framework, setFramework] = useState("React");
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateFeature = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedCode(null);

    const creditCosts = {
      "Simple": 25,
      "Medium": 50, 
      "Complex": 100,
      "Enterprise": 200
    };

    const creditsToUse = creditCosts[complexity];

    try {
      const user = await User.me();
      if (user.credits_remaining < creditsToUse) {
        setError(`Insufficient credits. You need ${creditsToUse} credits but only have ${user.credits_remaining}.`);
        setIsLoading(false);
        return;
      }

      const template = featureTemplates[featureType];
      const enhancedPrompt = `
        ${template.prompt}
        
        Feature Request: "${prompt}"
        Complexity Level: ${complexity}
        Framework: ${framework}
        
        Requirements:
        - Production-ready code with proper error handling
        - Clean, readable, and well-documented code
        - Follow best practices and modern patterns
        - Include TypeScript types where applicable
        - Add helpful comments explaining key functionality
        
        Generate ONLY the code without any explanation or markdown formatting.
      `;
      
      const response = await InvokeLLM({ prompt: enhancedPrompt });
      setGeneratedCode({
        code: response,
        type: featureType,
        complexity,
        framework,
        timestamp: new Date().toISOString()
      });

      await User.updateMyUserData({ 
        credits_remaining: user.credits_remaining - creditsToUse 
      });
      
      await UsageLog.create({
        feature: "AdvancedFeatureGenerator",
        credits_used: creditsToUse,
        details: `Generated ${complexity} ${featureType} with ${framework}`
      });

    } catch (e) {
      console.error(e);
      setError("Failed to generate feature. Please try again or contact support.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedCode) return;
    
    try {
      await navigator.clipboard.writeText(generatedCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadCode = () => {
    if (!generatedCode) return;
    
    const extensions = {
      "React Component": "tsx",
      "API Route": "js", 
      "Database Schema": "sql",
      "Full Stack Feature": "tsx"
    };
    
    const blob = new Blob([generatedCode.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-feature.${extensions[generatedCode.type]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Configuration Panel */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Feature Type</Label>
            <Select value={featureType} onValueChange={setFeatureType}>
              <SelectTrigger className="bg-gray-900 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(featureTemplates).map(([type, config]) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      <config.icon className="w-4 h-4" />
                      {type}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Complexity</Label>
            <Select value={complexity} onValueChange={setComplexity}>
              <SelectTrigger className="bg-gray-900 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Simple">Simple (25 credits)</SelectItem>
                <SelectItem value="Medium">Medium (50 credits)</SelectItem>
                <SelectItem value="Complex">Complex (100 credits)</SelectItem>
                <SelectItem value="Enterprise">Enterprise (200 credits)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Framework/Technology</Label>
          <Select value={framework} onValueChange={setFramework}>
            <SelectTrigger className="bg-gray-900 border-gray-600 w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="React">React + TypeScript</SelectItem>
              <SelectItem value="Vue">Vue.js</SelectItem>
              <SelectItem value="Angular">Angular</SelectItem>
              <SelectItem value="Node.js">Node.js + Express</SelectItem>
              <SelectItem value="Next.js">Next.js</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Feature Description</Label>
          <Textarea
            placeholder={`Example: ${featureTemplates[featureType].examples.join(', ')}`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="bg-gray-900 border-gray-600 min-h-[120px]"
          />
        </div>

        <Button 
          onClick={generateFeature} 
          disabled={isLoading || !prompt}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Feature ({creditCosts[complexity] || 50} Credits)
            </>
          )}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded-lg">
          <p className="font-medium">Generation Failed</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Generated Code Display */}
      {generatedCode && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileCode className="w-5 h-5 text-blue-400" />
              Generated {generatedCode.type}
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{generatedCode.complexity}</Badge>
              <Badge variant="outline">{generatedCode.framework}</Badge>
            </div>
          </div>

          <Tabs defaultValue="code" className="w-full">
            <TabsList className="bg-gray-700">
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="code" className="mt-4">
              <div className="bg-gray-900 rounded-lg border border-gray-700 relative">
                <div className="flex items-center justify-between p-3 border-b border-gray-700">
                  <span className="text-sm text-gray-400">
                    Generated on {new Date(generatedCode.timestamp).toLocaleString()}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="text-xs"
                    >
                      {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadCode}
                      className="text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                <pre className="p-4 text-sm overflow-x-auto max-h-96 overflow-y-auto">
                  <code>{generatedCode.code}</code>
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="mt-4">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <p className="text-gray-400 text-center">
                  Code preview functionality would integrate with a sandbox environment
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );

  const creditCosts = {
    "Simple": 25,
    "Medium": 50,
    "Complex": 100, 
    "Enterprise": 200
  };
}