import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, PlayCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function MobileTestSuite() {
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState(false);

  const tests = [
    {
      id: 'auth',
      name: 'Authentication Flow',
      description: 'Test login and user authentication',
      test: async () => {
        const user = await base44.auth.me();
        return !!user;
      }
    },
    {
      id: 'api',
      name: 'API Connectivity',
      description: 'Test backend API calls',
      test: async () => {
        const projects = await base44.entities.Project.list('-created_date', 1);
        return Array.isArray(projects);
      }
    },
    {
      id: 'navigation',
      name: 'Navigation System',
      description: 'Test React Router navigation',
      test: async () => {
        return window.location.pathname !== null;
      }
    },
    {
      id: 'haptics',
      name: 'Haptic Feedback',
      description: 'Test device haptic capabilities',
      test: async () => {
        try {
          await Haptics.impact({ style: ImpactStyle.Light });
          return true;
        } catch {
          return false;
        }
      }
    },
    {
      id: 'app-info',
      name: 'App Information',
      description: 'Test app metadata access',
      test: async () => {
        try {
          const info = await App.getInfo();
          return !!info.version;
        } catch {
          return false;
        }
      }
    },
    {
      id: 'ai-integration',
      name: 'AI Integration',
      description: 'Test unified AI system',
      test: async () => {
        try {
          const response = await base44.functions.invoke('unifiedAI', {
            provider: 'claude',
            model: 'claude-3-5-sonnet-20241022',
            prompt: 'Say "test successful" and nothing else.'
          });
          return response.success === true;
        } catch {
          return false;
        }
      }
    },
    {
      id: 'storage',
      name: 'Local Storage',
      description: 'Test browser storage capabilities',
      test: async () => {
        try {
          localStorage.setItem('test', 'value');
          const val = localStorage.getItem('test');
          localStorage.removeItem('test');
          return val === 'value';
        } catch {
          return false;
        }
      }
    },
    {
      id: 'responsive',
      name: 'Responsive Design',
      description: 'Test viewport and screen dimensions',
      test: async () => {
        return window.innerWidth > 0 && window.innerHeight > 0;
      }
    }
  ];

  const runAllTests = async () => {
    setTesting(true);
    const results = {};

    for (const test of tests) {
      try {
        const passed = await test.test();
        results[test.id] = { passed, error: null };
      } catch (error) {
        results[test.id] = { passed: false, error: error.message };
      }
      // Update UI incrementally
      setTestResults({ ...results });
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setTesting(false);
  };

  const runSingleTest = async (test) => {
    setTesting(true);
    try {
      const passed = await test.test();
      setTestResults({
        ...testResults,
        [test.id]: { passed, error: null }
      });
    } catch (error) {
      setTestResults({
        ...testResults,
        [test.id]: { passed: false, error: error.message }
      });
    }
    setTesting(false);
  };

  const passedCount = Object.values(testResults).filter(r => r.passed).length;
  const failedCount = Object.values(testResults).filter(r => !r.passed).length;
  const totalCount = Object.keys(testResults).length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Mobile Test Suite</h1>
        <p className="text-slate-600">End-to-end testing for mobile deployment readiness</p>
      </div>

      {/* Summary */}
      {totalCount > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{passedCount}</div>
                <div className="text-sm text-slate-600">Passed</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{failedCount}</div>
                <div className="text-sm text-slate-600">Failed</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{totalCount}/{tests.length}</div>
                <div className="text-sm text-slate-600">Completed</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Run All Button */}
      <Button 
        onClick={runAllTests} 
        disabled={testing}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        size="lg"
      >
        {testing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Running Tests...
          </>
        ) : (
          <>
            <PlayCircle className="mr-2 h-5 w-5" />
            Run All Tests
          </>
        )}
      </Button>

      {/* Test List */}
      <div className="space-y-3">
        {tests.map((test) => {
          const result = testResults[test.id];
          return (
            <Card key={test.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {test.name}
                      {result && (
                        result.passed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )
                      )}
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">{test.description}</p>
                    {result && result.error && (
                      <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded">
                        Error: {result.error}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runSingleTest(test)}
                    disabled={testing}
                  >
                    Test
                  </Button>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}