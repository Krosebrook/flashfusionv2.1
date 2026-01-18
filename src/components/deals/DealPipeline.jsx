import React from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Sparkles, TrendingUp } from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'new', label: 'New', color: 'bg-gray-600' },
  { id: 'reviewing', label: 'Reviewing', color: 'bg-blue-600' },
  { id: 'interested', label: 'Interested', color: 'bg-purple-600' },
  { id: 'passed', label: 'Passed', color: 'bg-red-600' },
  { id: 'invested', label: 'Invested', color: 'bg-green-600' }
];

export default function DealPipeline({ deals, onDealSelect, onUpdate }) {
  const moveDeal = async (dealId, newStage) => {
    try {
      await base44.entities.DealData.update(dealId, {
        pipeline_stage: newStage,
        status: newStage
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to update deal stage:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {PIPELINE_STAGES.map(stage => {
        const stageDeals = deals.filter(d => d.pipeline_stage === stage.id);
        
        return (
          <div key={stage.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">{stage.label}</h3>
              <Badge className={stage.color}>{stageDeals.length}</Badge>
            </div>
            
            <div className="space-y-2 min-h-[400px] bg-gray-900 rounded-lg p-2 border border-gray-700">
              {stageDeals.map(deal => (
                <Card 
                  key={deal.id} 
                  className="bg-gray-800 border-gray-700 hover:border-blue-600 transition-colors cursor-pointer"
                  onClick={() => onDealSelect(deal)}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-sm text-white line-clamp-1">{deal.company_name}</h4>
                      {deal.saved_by_user && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                    </div>
                    
                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">{deal.description}</p>
                    
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-xs">{deal.stage}</Badge>
                      
                      {deal.ai_scoring && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Sparkles className="w-3 h-3 text-purple-500" />
                          <span>{deal.ai_scoring.overall_score}/100</span>
                        </div>
                      )}
                      
                      {deal.outcome_prediction && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span>{deal.outcome_prediction.predicted_outcome}</span>
                        </div>
                      )}
                    </div>
                    
                    {stage.id !== 'invested' && stage.id !== 'passed' && (
                      <div className="flex gap-1 mt-2">
                        {stage.id !== 'interested' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs h-6 flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveDeal(deal.id, 'interested');
                            }}
                          >
                            Interested
                          </Button>
                        )}
                        {stage.id !== 'passed' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs h-6 flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveDeal(deal.id, 'passed');
                            }}
                          >
                            Pass
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}