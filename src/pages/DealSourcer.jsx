import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Search, Heart, Share2, ExternalLink } from 'lucide-react';

export default function DealSourcer() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('new');

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const data = await base44.entities.DealData.list('-created_date', 100);
      setDeals(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch deals:', err);
      setLoading(false);
    }
  };

  const saveDeal = async (deal) => {
    try {
      await base44.entities.DealData.update(deal.id, {
        saved_by_user: !deal.saved_by_user
      });
      fetchDeals();
    } catch (err) {
      console.error('Failed to save deal:', err);
    }
  };

  const updateDealStatus = async (deal, status) => {
    try {
      await base44.entities.DealData.update(deal.id, { status });
      fetchDeals();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filtered = deals.filter(d => {
    const matchSearch = d.company_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSource = sourceFilter === 'all' || d.source_integration === sourceFilter;
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchSource && matchStatus;
  });

  if (loading) return <div className="p-6 text-center">Loading deals...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Deal Sourcer</h1>
        <p className="text-gray-600 mt-1">AI-powered deal discovery from 25+ sources</p>
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="perplexity">Perplexity</SelectItem>
            <SelectItem value="crunchbase">Crunchbase</SelectItem>
            <SelectItem value="angellist">AngelList</SelectItem>
            <SelectItem value="firecrawl">Firecrawl</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="interested">Interested</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="invested">Invested</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Deals Grid */}
      <div className="grid gap-4">
        {filtered.map(deal => (
          <Card key={deal.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-4 gap-4 items-start">
                {/* Company Info */}
                <div className="md:col-span-2">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{deal.company_name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{deal.description}</p>
                      
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <Badge className="bg-blue-100 text-blue-800">{deal.stage}</Badge>
                        {deal.industry && (
                          <Badge variant="outline">{deal.industry}</Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {deal.source_integration}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-3">
                  {deal.valuation && (
                    <div>
                      <p className="text-xs text-gray-600">Valuation</p>
                      <p className="text-lg font-bold text-gray-900">${deal.valuation}M</p>
                    </div>
                  )}
                  {deal.funding_raised && (
                    <div>
                      <p className="text-xs text-gray-600">Funding Raised</p>
                      <p className="text-lg font-bold text-gray-900">${deal.funding_raised}M</p>
                    </div>
                  )}
                  {deal.headquarters && (
                    <div>
                      <p className="text-xs text-gray-600">Location</p>
                      <p className="text-sm font-medium text-gray-900">{deal.headquarters}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Select
                    value={deal.status}
                    onValueChange={(status) => updateDealStatus(deal, status)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="interested">Interested</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="passed">Passed</SelectItem>
                      <SelectItem value="invested">Invested</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => saveDeal(deal)}
                      className="flex-1 gap-2"
                    >
                      <Heart className={`w-4 h-4 ${deal.saved_by_user ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    {deal.source_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="flex-1 gap-2"
                      >
                        <a href={deal.source_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No deals found. Enable integrations to start sourcing.</p>
        </div>
      )}
    </div>
  );
}