import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import Tooltip from './Tooltip';

const INDUSTRIES = [
  'Technology', 'Healthcare', 'FinTech', 'Real Estate',
  'E-Commerce', 'SaaS', 'Manufacturing', 'Energy',
  'Retail', 'Media', 'Biotech', 'Infrastructure'
];

const DEAL_STRUCTURES = [
  'Equity', 'Debt', 'Convertible', 'Secondary',
  'SAFE', 'Warrants', 'Revenue Share', 'Joint Venture'
];

const REGIONS = [
  'North America', 'Europe', 'Asia-Pacific',
  'Latin America', 'Middle East & Africa', 'Global'
];

export default function Step2DealCriteria({ data, onUpdate, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const toggleIndustry = (industry) => {
    const updated = data.target_industries.includes(industry)
      ? data.target_industries.filter(i => i !== industry)
      : [...data.target_industries, industry];
    onUpdate('deal_sourcing_criteria', { target_industries: updated });
  };

  const toggleStructure = (structure) => {
    const updated = data.deal_structures.includes(structure)
      ? data.deal_structures.filter(s => s !== structure)
      : [...data.deal_structures, structure];
    onUpdate('deal_sourcing_criteria', { deal_structures: updated });
  };

  const toggleRegion = (region) => {
    const updated = data.geographic_preferences.includes(region)
      ? data.geographic_preferences.filter(r => r !== region)
      : [...data.geographic_preferences, region];
    onUpdate('deal_sourcing_criteria', { geographic_preferences: updated });
  };

  const validate = () => {
    const newErrors = {};
    if (data.target_industries.length === 0) newErrors.industries = 'Select at least one industry';
    if (data.investment_size_min >= data.investment_size_max) newErrors.sizes = 'Min must be less than max';
    if (data.deal_structures.length === 0) newErrors.structures = 'Select at least one deal structure';
    if (data.geographic_preferences.length === 0) newErrors.regions = 'Select at least one region';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Define Your Deal Sourcing Criteria</h2>
        <p className="text-gray-600 mt-1">Help us understand what kinds of investments align with your goals</p>
      </div>

      {/* Target Industries */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Target Industries</CardTitle>
            <Tooltip text="Select the industries where you want to invest. You can adjust this later.">
              Which sectors interest you most?
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map(industry => (
              <button
                key={industry}
                onClick={() => toggleIndustry(industry)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  data.target_industries.includes(industry)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {industry}
              </button>
            ))}
          </div>
          {errors.industries && <p className="text-sm text-red-600">{errors.industries}</p>}
        </CardContent>
      </Card>

      {/* Investment Size Range */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Investment Size Range</CardTitle>
            <Tooltip text="Enter the minimum and maximum investment amounts in millions of USD.">
              What's your typical deal size?
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Min (M$)</label>
              <Input
                type="number"
                value={data.investment_size_min}
                onChange={(e) => onUpdate('deal_sourcing_criteria', {
                  investment_size_min: parseFloat(e.target.value) || 0
                })}
                min="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Max (M$)</label>
              <Input
                type="number"
                value={data.investment_size_max}
                onChange={(e) => onUpdate('deal_sourcing_criteria', {
                  investment_size_max: parseFloat(e.target.value) || 0
                })}
                min="0"
              />
            </div>
          </div>
          {errors.sizes && <p className="text-sm text-red-600">{errors.sizes}</p>}
        </CardContent>
      </Card>

      {/* Deal Structures */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Preferred Deal Structures</CardTitle>
            <Tooltip text="Select the types of investment vehicles you're comfortable with.">
              How do you prefer to invest?
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {DEAL_STRUCTURES.map(structure => (
              <button
                key={structure}
                onClick={() => toggleStructure(structure)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  data.deal_structures.includes(structure)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {structure}
              </button>
            ))}
          </div>
          {errors.structures && <p className="text-sm text-red-600">{errors.structures}</p>}
        </CardContent>
      </Card>

      {/* Geographic Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Geographic Preferences</CardTitle>
            <Tooltip text="Select regions where you're interested in investing.">
              Where in the world?
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {REGIONS.map(region => (
              <button
                key={region}
                onClick={() => toggleRegion(region)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  data.geographic_preferences.includes(region)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
          {errors.regions && <p className="text-sm text-red-600">{errors.regions}</p>}
        </CardContent>
      </Card>

      {/* Risk Tolerance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Risk Tolerance</CardTitle>
            <Tooltip text="Conservative = established companies; Moderate = growth stage; Aggressive = early stage/high risk.">
              How comfortable are you with risk?
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent>
          <Select
            value={data.risk_tolerance}
            onValueChange={(value) => onUpdate('deal_sourcing_criteria', { risk_tolerance: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conservative">Conservative (Proven Models)</SelectItem>
              <SelectItem value="moderate">Moderate (Growth Stage)</SelectItem>
              <SelectItem value="aggressive">Aggressive (Early Stage)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          onClick={() => validate() && onNext()}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Next: Portfolio Goals
        </Button>
      </div>
    </div>
  );
}