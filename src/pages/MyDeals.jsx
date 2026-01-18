import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Star, TrendingUp, Clock, CheckCircle, XCircle, Target,
  Sparkles, FileText, ListChecks
} from 'lucide-react';
import DealPipeline from '../components/deals/DealPipeline';
import DealCollaboration from '../components/deals/DealCollaboration';

export default function MyDeals() {
  const [deals, setDeals] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const allDeals = await base44.entities.DealData.filter({
        created_by: currentUser.email
      });
      setDeals(allDeals);
    } catch (error) {
      console.error('Failed to fetch deals:', error);
    }
    setLoading(false);
  };

  const savedDeals = deals.filter(d => d.saved_by_user);
  const activeDeals = deals.filter(d => ['reviewing', 'interested'].includes(d.pipeline_stage));
  const investedDeals = deals.filter(d => d.pipeline_stage === 'invested');

  const stats = [
    { label: 'Total Deals', value: deals.length, icon: FileText, color: 'text-blue-600' },
    { label: 'Saved', value: savedDeals.length, icon: Star, color: 'text-yellow-600' },
    { label: 'Active', value: activeDeals.length, icon: Clock, color: 'text-orange-600' },
    { label: 'Invested', value: investedDeals.length, icon: CheckCircle, color: 'text-green-600' }
  ];

  if (loading) {
    return <div className="p-8">Loading your deals...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">My Deals</h1>
          <p className="text-gray-400">Manage and track your investment pipeline</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger value="pipeline" className="gap-2">
            <Target className="w-4 h-4" />
            Pipeline View
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-2">
            <Star className="w-4 h-4" />
            Saved Deals
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <FileText className="w-4 h-4" />
            All Deals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <DealPipeline deals={deals} onDealSelect={setSelectedDeal} onUpdate={fetchData} />
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <DealList deals={savedDeals} onSelect={setSelectedDeal} />
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <DealList deals={deals} onSelect={setSelectedDeal} />
        </TabsContent>
      </Tabs>

      {selectedDeal && (
        <DealCollaboration 
          deal={selectedDeal} 
          onClose={() => setSelectedDeal(null)}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
}

function DealList({ deals, onSelect }) {
  if (deals.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="py-12 text-center">
          <p className="text-gray-400">No deals found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {deals.map(deal => (
        <Card key={deal.id} className="bg-gray-800 border-gray-700 hover:border-blue-600 transition-colors cursor-pointer" onClick={() => onSelect(deal)}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg text-white">{deal.company_name}</CardTitle>
              {deal.saved_by_user && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
            </div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-xs">{deal.stage}</Badge>
              <Badge className={
                deal.pipeline_stage === 'invested' ? 'bg-green-600' :
                deal.pipeline_stage === 'interested' ? 'bg-blue-600' :
                deal.pipeline_stage === 'reviewing' ? 'bg-orange-600' :
                deal.pipeline_stage === 'passed' ? 'bg-red-600' : 'bg-gray-600'
              }>
                {deal.pipeline_stage}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 line-clamp-2">{deal.description}</p>
            {deal.ai_scoring && (
              <div className="mt-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-300">AI Score: {deal.ai_scoring.overall_score}/100</span>
              </div>
            )}
            {deal.outcome_prediction && (
              <div className="mt-2 flex gap-2 text-xs">
                <span className="text-gray-400">Acquisition: {deal.outcome_prediction.acquisition_likelihood}%</span>
                <span className="text-gray-400">IPO: {deal.outcome_prediction.ipo_potential}%</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}