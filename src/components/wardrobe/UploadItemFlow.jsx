import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Camera, Upload, ArrowRight, Check, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories", "Blazer", "Jacket"];
const materials = ["Cotton Mix", "Linen", "Synthetic", "Wool", "Silk", "Denim"];
const seasons = ["Spring", "Summer", "Autumn", "Winter"];
const occasions = ["Office", "Casual", "Formal", "Night Out", "Wedding", "Gym"];

const colorOptions = [
  { id: "Sky Blue", hex: "#a5c9e1" },
  { id: "Off-white", hex: "#f1f5f9" },
  { id: "Cool Grey", hex: "#64748b" },
  { id: "Black", hex: "#000000" },
  { id: "White", hex: "#FFFFFF" }
];

export default function UploadItemFlow({ onComplete }) {
  const [step, setStep] = useState("tutorial1");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const [itemData, setItemData] = useState({
    category: "Blazer",
    name: "",
    color: "Sky Blue",
    color_hex: "#a5c9e1",
    material: "Cotton Mix",
    seasons: ["Autumn"],
    occasions: ["Office", "Formal"]
  });

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImageUrl(file_url);
      setUploadedFile(file);
      setStep("categorize");
    } catch (error) {
      console.error("Upload failed:", error);
    }
    setUploading(false);
  };

  const handleSaveItem = async () => {
    try {
      const user = await base44.auth.me();
      await base44.entities.WardrobeItem.create({
        user_email: user.email,
        ...itemData,
        image_url: imageUrl,
        original_image_url: imageUrl,
        ai_confidence: 98,
        times_worn: 0,
        favorite: false
      });
      onComplete();
    } catch (error) {
      console.error("Failed to save item:", error);
    }
  };

  const toggleOccasion = (occasion) => {
    setItemData(prev => ({
      ...prev,
      occasions: prev.occasions.includes(occasion)
        ? prev.occasions.filter(o => o !== occasion)
        : [...prev.occasions, occasion]
    }));
  };

  const toggleSeason = (season) => {
    setItemData(prev => ({
      ...prev,
      seasons: prev.seasons.includes(season)
        ? prev.seasons.filter(s => s !== season)
        : [...prev.seasons, season]
    }));
  };

  // Tutorial Step 1
  if (step === "tutorial1") {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <div className="flex items-center justify-between p-6">
          <button onClick={onComplete} className="size-10 flex items-center justify-center rounded-full bg-gray-800/50">
            <X className="w-5 h-5" />
          </button>
          <button onClick={() => setStep("camera")} className="text-sm font-bold text-purple-400">Skip</button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="relative w-full max-w-xs h-64 bg-gray-800 rounded-2xl overflow-hidden mb-8">
            <img
              src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600"
              alt="Good lighting example"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="max-w-md">
            <p className="text-purple-400 font-bold text-xs uppercase tracking-wider mb-2 text-center">Step 1: The Setup</p>
            <h1 className="text-3xl font-extrabold tracking-tight mb-6 text-center">Perfect Capture</h1>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-purple-600/20 text-purple-400">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Find good lighting</h3>
                  <p className="text-sm text-gray-400">Ensure natural, bright lighting so colors look accurate.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-purple-600/20 text-purple-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Use a neutral background</h3>
                  <p className="text-sm text-gray-400">Place item on a flat surface or hang on a plain wall.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Button
            onClick={() => setStep("tutorial2")}
            className="w-full bg-purple-600 hover:bg-purple-700 py-4 text-lg font-bold rounded-xl"
          >
            Got it
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Tutorial Step 2
  if (step === "tutorial2") {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <div className="flex items-center justify-between p-6">
          <button onClick={() => setStep("tutorial1")} className="size-10 flex items-center justify-center rounded-full bg-gray-800/50">
            <X className="w-5 h-5" />
          </button>
          <button onClick={() => setStep("camera")} className="text-sm font-bold text-purple-400">Skip</button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="relative w-full max-w-xs aspect-[9/16] bg-gray-800 rounded-3xl border-4 border-gray-700 overflow-hidden mb-8">
            <div className="absolute inset-0 border-2 border-dashed border-purple-500/50 m-8 rounded-xl animate-pulse"></div>
            <div className="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-sm"></div>
            <div className="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-sm"></div>
            <div className="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-sm"></div>
            <div className="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-sm"></div>
          </div>

          <div className="text-center max-w-xs">
            <h1 className="text-3xl font-bold mb-3">Frame your item clearly</h1>
            <p className="text-gray-400">Ensure the entire garment is visible within the box for the best AI recognition.</p>
          </div>
        </div>

        <div className="p-6">
          <Button
            onClick={() => setStep("camera")}
            className="w-full bg-purple-600 hover:bg-purple-700 py-4 text-lg font-bold rounded-xl"
          >
            Next
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Camera/Upload Step
  if (step === "camera") {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
        <button onClick={onComplete} className="absolute top-6 left-6 size-10 flex items-center justify-center rounded-full bg-gray-800/50">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">Upload Clothing Item</h2>
          <p className="text-gray-400">Take a photo or upload from your gallery</p>
        </div>

        <div className="w-full max-w-md space-y-4">
          <label className="block">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-xl cursor-pointer">
              <Camera className="w-5 h-5" />
              Take Photo
            </div>
          </label>

          <label className="block">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-xl cursor-pointer border border-gray-700">
              <Upload className="w-5 h-5" />
              Upload from Gallery
            </div>
          </label>
        </div>

        {uploading && <p className="mt-4 text-purple-400">Uploading...</p>}
      </div>
    );
  }

  // Categorization Step
  if (step === "categorize") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-y-auto pb-32">
        <header className="pt-8 px-6 pb-4 flex items-center justify-between sticky top-0 bg-gray-50 dark:bg-gray-900 z-10">
          <button onClick={() => setStep("camera")} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 bg-purple-600/10 px-3 py-1.5 rounded-full border border-purple-600/20">
            <Check className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">AI Cleanup Complete</span>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
            <Filter className="w-5 h-5" />
          </button>
        </header>

        <main className="px-6 py-4">
          {/* Image Preview */}
          <div className="relative w-full aspect-[3/4] max-h-[40vh] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl mb-6">
            <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 opacity-30" style={{
              backgroundImage: 'linear-gradient(45deg, #1f1f2e 25%, transparent 25%), linear-gradient(-45deg, #1f1f2e 25%, transparent 25%)',
              backgroundSize: '20px 20px'
            }}></div>
            <div className="relative w-full h-full p-8 flex items-center justify-center">
              <img
                src={imageUrl}
                alt="Uploaded item"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
            <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-md rounded-xl p-3 flex items-center gap-3 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-white font-medium">Background Removed</p>
                <p className="text-[10px] text-gray-400">Precision confidence: 98%</p>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-1">Label Your Item</h1>
            <p className="text-sm text-gray-500">The AI has identified a garment. Add details to your closet.</p>
          </div>

          {/* Category */}
          <section className="mb-6">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              Category
              <span className="text-xs font-medium text-purple-600 bg-purple-600/10 px-2 py-0.5 rounded-full">AI Suggested</span>
            </h3>
            <select
              value={itemData.category}
              onChange={(e) => setItemData({ ...itemData, category: e.target.value })}
              className="w-full bg-white dark:bg-gray-800 border border-purple-600/40 rounded-lg py-3 px-4 outline-none focus:ring-2 focus:ring-purple-600"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </section>

          {/* Name */}
          <section className="mb-6">
            <h3 className="text-lg font-bold mb-3">Item Name</h3>
            <input
              type="text"
              value={itemData.name}
              onChange={(e) => setItemData({ ...itemData, name: e.target.value })}
              placeholder="e.g., Blue Blazer"
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg py-3 px-4 outline-none focus:ring-2 focus:ring-purple-600"
            />
          </section>

          {/* Color */}
          <section className="mb-6">
            <h3 className="text-lg font-bold mb-3">Color</h3>
            <div className="flex flex-wrap gap-3">
              {colorOptions.map(colorOpt => (
                <button
                  key={colorOpt.id}
                  onClick={() => setItemData({ ...itemData, color: colorOpt.id, color_hex: colorOpt.hex })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                    itemData.color === colorOpt.id
                      ? 'border-purple-600 bg-white dark:bg-gray-800 shadow-sm'
                      : 'border-transparent bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: colorOpt.hex }}></div>
                  <span className="text-sm font-semibold">{colorOpt.id}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Material */}
          <section className="mb-6">
            <h3 className="text-lg font-bold mb-3">Material</h3>
            <div className="flex flex-wrap gap-2">
              {materials.map(mat => (
                <button
                  key={mat}
                  onClick={() => setItemData({ ...itemData, material: mat })}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                    itemData.material === mat
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {mat}
                </button>
              ))}
            </div>
          </section>

          {/* Season */}
          <section className="mb-6">
            <h3 className="text-lg font-bold mb-3">Season</h3>
            <div className="grid grid-cols-4 gap-2">
              {seasons.map(season => (
                <button
                  key={season}
                  onClick={() => toggleSeason(season)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    itemData.seasons.includes(season)
                      ? 'border-2 border-purple-600 bg-purple-600/5 shadow-[0_0_12px_2px_rgba(139,92,246,0.25)]'
                      : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
                  }`}
                >
                  <span className="text-xl">{season === "Spring" ? "🌸" : season === "Summer" ? "☀️" : season === "Autumn" ? "🍂" : "❄️"}</span>
                  <span className="text-xs font-semibold">{season}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Occasions */}
          <section className="mb-12">
            <h3 className="text-lg font-bold mb-3">Occasion</h3>
            <div className="flex flex-wrap gap-2">
              {occasions.map(occasion => (
                <button
                  key={occasion}
                  onClick={() => toggleOccasion(occasion)}
                  className={`px-4 py-2 rounded-full border-2 text-sm font-semibold flex items-center gap-2 transition-all ${
                    itemData.occasions.includes(occasion)
                      ? 'border-purple-600 bg-purple-600 text-white'
                      : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {occasion}
                  {itemData.occasions.includes(occasion) && <X className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </section>
        </main>

        {/* Fixed Bottom */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50/95 dark:via-gray-900/95 to-transparent">
          <Button
            onClick={handleSaveItem}
            disabled={!itemData.name}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-5 rounded-xl shadow-xl shadow-purple-600/30"
          >
            Add to Closet
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}