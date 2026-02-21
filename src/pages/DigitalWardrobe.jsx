import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Search, Filter, Bell, Settings, User, Sparkles, ChevronDown } from "lucide-react";
import UploadItemFlow from "../components/wardrobe/UploadItemFlow";

export default function DigitalWardrobe() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("Tops");
  const [seasonFilter, setSeason<bFilter] = useState(null);
  const [occasionFilter, setOccasionFilter] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const wardrobeItems = await base44.entities.WardrobeItem.filter({ user_email: user.email });
      setItems(wardrobeItems);
    } catch (error) {
      console.error("Failed to fetch wardrobe items:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const tabs = ["Tops", "Bottoms", "Shoes", "More"];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "More" || item.category === activeTab;
    const matchesSeason = !seasonFilter || item.seasons?.includes(seasonFilter);
    const matchesOccasion = !occasionFilter || item.occasions?.includes(occasionFilter);
    return matchesSearch && matchesTab && matchesSeason && matchesOccasion;
  });

  if (showUpload) {
    return <UploadItemFlow onComplete={() => { setShowUpload(false); fetchItems(); }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#101922]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-gray-50/80 dark:bg-[#101922]/80 backdrop-blur-md">
        <div className="flex items-center p-4 pb-2 justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-blue-600/10 text-blue-600">
              <User className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold leading-tight tracking-tight">My Wardrobe</h1>
          </div>
          <div className="flex gap-2">
            <button className="flex size-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <Bell className="w-5 h-5" />
            </button>
            <button className="flex size-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3">
          <div className="flex w-full items-stretch rounded-xl h-11 bg-gray-200 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700">
            <div className="text-gray-500 flex items-center justify-center pl-4">
              <Search className="w-5 h-5" />
            </div>
            <input
              className="flex w-full min-w-0 flex-1 border-none bg-transparent focus:outline-0 focus:ring-0 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 px-3 text-sm font-medium"
              placeholder="Search your closet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="px-3 text-blue-600">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto hide-scrollbar">
          <button className="flex h-8 shrink-0 items-center justify-center gap-1 rounded-full bg-blue-600 px-4 text-white">
            <span className="text-xs font-semibold uppercase tracking-wider">All</span>
          </button>
          <button
            onClick={() => setSe seasonFilter(seasonFilter === "Summer" ? null : "Summer")}
            className={`flex h-8 shrink-0 items-center justify-center gap-2 rounded-full px-4 transition-all ${
              seasonFilter === "Summer" ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <span className="text-xs font-semibold">Summer</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => setOccasionFilter(occasionFilter === "Casual" ? null : "Casual")}
            className={`flex h-8 shrink-0 items-center justify-center gap-2 rounded-full px-4 transition-all ${
              occasionFilter === "Casual" ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <span className="text-xs font-semibold">Casual</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-4">
          <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto hide-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex flex-1 min-w-fit items-center justify-center border-b-2 py-3 px-4 transition-all ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500'
                }`}
              >
                <p className="text-sm font-bold">{tab}</p>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="flex-1 p-4 pb-24 overflow-y-auto">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading your wardrobe...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No items yet</h3>
            <p className="text-gray-500 mb-6">Start building your digital wardrobe</p>
            <button
              onClick={() => setShowUpload(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl"
            >
              Add Your First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="group relative flex flex-col gap-2 rounded-xl bg-white dark:bg-gray-900/40 p-2 border border-gray-200 dark:border-gray-800"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {item.image_url ? (
                    <img
                      alt={item.name}
                      className="h-full w-full object-contain p-4 mix-blend-multiply dark:mix-blend-normal"
                      src={item.image_url}
                    />
                  ) : (
                    <div className="text-4xl">👔</div>
                  )}
                  <div className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-blue-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  {item.favorite && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-amber-500/90 text-[9px] font-bold text-white uppercase">
                      Trending
                    </div>
                  )}
                </div>
                <div className="px-1">
                  <h3 className="text-xs font-bold truncate">{item.name}</h3>
                  <p className="text-[10px] text-gray-500 font-medium">
                    {item.material} • {item.occasions?.[0] || item.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowUpload(true)}
        className="fixed bottom-24 right-6 flex size-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-600/40 ring-4 ring-gray-50 dark:ring-[#101922] z-30 active:scale-95 transition-transform"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Bottom Navigation Bar */}
      <nav className="sticky bottom-0 z-40 bg-white/80 dark:bg-[#101922]/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800">
        <div className="flex h-20 items-center justify-around px-2 pb-2">
          <button className="flex flex-col items-center justify-center gap-1 text-blue-600">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
            </div>
            <span className="text-[10px] font-bold">Closet</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 text-gray-500">
            <Sparkles className="w-6 h-6" />
            <span className="text-[10px] font-medium">Stylist</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/>
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
            </svg>
            <span className="text-[10px] font-medium">Planner</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 text-gray-500">
            <User className="w-6 h-6" />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}