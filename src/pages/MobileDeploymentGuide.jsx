import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, Smartphone, Package, Upload, TestTube, Shield, Settings } from 'lucide-react';

export default function MobileDeploymentGuide() {
  const deploymentSteps = [
    {
      phase: "1. Build & Configure",
      icon: Settings,
      status: "ready",
      steps: [
        "✅ Capacitor installed and configured",
        "Run: npm run build",
        "Run: npx cap add android",
        "Run: npx cap sync android",
        "Update app ID in capacitor.config.json",
        "Update app name and version in AndroidManifest.xml"
      ]
    },
    {
      phase: "2. Android Studio Setup",
      icon: Package,
      status: "pending",
      steps: [
        "Install Android Studio (latest version)",
        "Install Android SDK (API level 33+)",
        "Install JDK 17",
        "Open project: npx cap open android",
        "Sync Gradle files",
        "Test on emulator or physical device"
      ]
    },
    {
      phase: "3. Testing Checklist",
      icon: TestTube,
      status: "pending",
      steps: [
        "Test all navigation flows",
        "Test AI Assistant chat interface",
        "Test file uploads (images, documents)",
        "Test authentication flow",
        "Test offline behavior",
        "Test on multiple screen sizes (phone, tablet)",
        "Test on Android 10, 11, 12, 13, 14",
        "Test back button behavior",
        "Test deep links (if implemented)",
        "Performance test: app launch time < 3s",
        "Memory test: no leaks during extended use"
      ]
    },
    {
      phase: "4. Google Play Console Setup",
      icon: Shield,
      status: "pending",
      steps: [
        "Create Google Play Developer account ($25 one-time fee)",
        "Create new application in Play Console",
        "Fill out store listing (title, description, screenshots)",
        "Upload app icon (512x512 PNG)",
        "Upload feature graphic (1024x500 PNG)",
        "Add screenshots (min 2, max 8 per device type)",
        "Set content rating questionnaire",
        "Set target audience and content",
        "Add privacy policy URL",
        "Complete data safety form"
      ]
    },
    {
      phase: "5. Generate Signed APK/AAB",
      icon: Package,
      status: "pending",
      steps: [
        "Generate keystore: keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000",
        "Update capacitor.config.json with keystore paths",
        "Build release: cd android && ./gradlew assembleRelease",
        "Or build AAB: cd android && ./gradlew bundleRelease",
        "Sign APK/AAB with keystore",
        "Verify signing: jarsigner -verify -verbose -certs app-release.apk"
      ]
    },
    {
      phase: "6. Upload to Play Console",
      icon: Upload,
      status: "pending",
      steps: [
        "Navigate to Production > Create new release",
        "Upload signed APK or AAB file",
        "Add release notes",
        "Review and rollout to production",
        "Submit for review (typically 1-3 days)",
        "Monitor for any review rejections",
        "Fix issues and resubmit if needed"
      ]
    }
  ];

  const commonIssues = [
    {
      issue: "App crashes on startup",
      solution: "Check AndroidManifest.xml permissions, verify all Capacitor plugins are synced"
    },
    {
      issue: "White screen on launch",
      solution: "Check build output directory (dist/), ensure index.html exists, verify capacitor.config.json webDir"
    },
    {
      issue: "API calls fail",
      solution: "Add INTERNET permission to AndroidManifest.xml, configure CORS on backend, check network security config"
    },
    {
      issue: "File uploads don't work",
      solution: "Add READ_EXTERNAL_STORAGE and WRITE_EXTERNAL_STORAGE permissions, request runtime permissions"
    },
    {
      issue: "Play Store rejection",
      solution: "Common reasons: missing privacy policy, incorrect content rating, missing data safety info, permissions not justified"
    }
  ];

  const requiredFiles = [
    {
      file: "App Icon",
      specs: "512x512 PNG, 32-bit with alpha",
      location: "android/app/src/main/res/mipmap-*/ic_launcher.png"
    },
    {
      file: "Feature Graphic",
      specs: "1024x500 JPG or PNG",
      location: "For Play Store listing"
    },
    {
      file: "Screenshots",
      specs: "Phone: 16:9 or 9:16, min 320px",
      location: "For Play Store listing (2-8 images)"
    },
    {
      file: "Privacy Policy",
      specs: "Public URL with HTTPS",
      location: "Your website or GitHub Pages"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Smartphone className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Mobile Deployment Guide</h1>
            <p className="text-slate-600">Deploy FlashFusion to Google Play Store</p>
          </div>
        </div>

        {/* Status Overview */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>Current Status:</strong> Capacitor configured and ready. Follow the steps below to build and deploy to Google Play.
          </AlertDescription>
        </Alert>

        {/* Deployment Steps */}
        <div className="space-y-4">
          {deploymentSteps.map((phase, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <phase.icon className="h-5 w-5 text-slate-600" />
                    <CardTitle className="text-lg">{phase.phase}</CardTitle>
                  </div>
                  <Badge variant={phase.status === 'ready' ? 'default' : 'secondary'}>
                    {phase.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {phase.steps.map((step, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-slate-400 mt-1">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Required Files */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Required Assets & Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requiredFiles.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{item.file}</p>
                    <p className="text-xs text-slate-600 mt-1">{item.specs}</p>
                  </div>
                  <code className="text-xs bg-slate-200 px-2 py-1 rounded">{item.location}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Common Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Common Issues & Solutions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {commonIssues.map((item, idx) => (
                <div key={idx} className="border-l-4 border-orange-400 pl-4 py-2">
                  <p className="font-medium text-slate-900 mb-1">❌ {item.issue}</p>
                  <p className="text-sm text-slate-600">✅ {item.solution}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Commands */}
        <Card className="bg-slate-900 text-white">
          <CardHeader>
            <CardTitle>Quick Command Reference</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 font-mono text-sm">
            <div className="bg-slate-800 p-3 rounded">
              <div className="text-slate-400 text-xs mb-1"># Build web app</div>
              <div>npm run build</div>
            </div>
            <div className="bg-slate-800 p-3 rounded">
              <div className="text-slate-400 text-xs mb-1"># Add Android platform</div>
              <div>npx cap add android</div>
            </div>
            <div className="bg-slate-800 p-3 rounded">
              <div className="text-slate-400 text-xs mb-1"># Sync changes to Android</div>
              <div>npx cap sync android</div>
            </div>
            <div className="bg-slate-800 p-3 rounded">
              <div className="text-slate-400 text-xs mb-1"># Open in Android Studio</div>
              <div>npx cap open android</div>
            </div>
            <div className="bg-slate-800 p-3 rounded">
              <div className="text-slate-400 text-xs mb-1"># Build release APK</div>
              <div>cd android && ./gradlew assembleRelease</div>
            </div>
            <div className="bg-slate-800 p-3 rounded">
              <div className="text-slate-400 text-xs mb-1"># Build release AAB (recommended for Play Store)</div>
              <div>cd android && ./gradlew bundleRelease</div>
            </div>
          </CardContent>
        </Card>

        {/* Testing Checklist */}
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            <strong>Pre-deployment Testing:</strong> Before submitting to Google Play, ensure all items in "Phase 3: Testing Checklist" are completed and passing.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}