import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import Tooltip from './Tooltip';

const SECTORS = [
  'Technology', 'Healthcare', 'FinTech', 'Consumer',
  'B2B SaaS', 'Clean Energy', 'Real Estate', 'Infrastructure'
];

const TIME_HORIZONS = [
  { value: 'short_term', label: '1-3 years', description: 'Quick returns and exit strategies' },
  { value: 'medium_term', label: '3-7 years', description: 'Balanced growth and liquidity' },
  { value: 'long_term', label: '7+ years', description: 'Long-term value creation' }
];

const DIVERSIFICATION = [
  { value: 'concentrated', label: 'Concentrated', description: 'Few bets, high conviction' },
  { value: 'balanced', label: 'Balanced', description: 'Mix of core and exploratory investments' },
  { value: 'diversified', label: 'Diversified', description: 'Spread across many positions' }
];

export default function Step3PortfolioGoals({ data, onUpdate, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const toggleSector = (sector) => {
    const updated = data.sector_priorities.includes(sector)
      ? data.sector_priorities.filter(s => s !== sector)
      : [...data.sector_priorities, sector];
    onUpdate('portfolio_goals', { sector_priorities: updated });
  };

  const validate = () => {
    const newErrors = {};
    if (!data.time_horizon) newErrors.horizon = 'Select a time horizon';
    if (data.target_annual_return < 5 || data.target_annual_return > 100) {
      newErrors.return = 'Return must be between 5% and 100%';
    }
    if (!data.diversification_strategy) newErrors.div = 'Select a diversification strategy';
    if (data.sector_priorities.length === 0) newErrors.sectors = 'Select at least one sector';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Set Your Portfolio Goals</h2>
        <p className="text-gray-600 mt-1">Define your investment objectives and risk-return expectations</p>
      </div>

      {/* Time Horizon */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Investment Time Horizon</CardTitle>
            <Tooltip text="How long do you plan to hold your investments?" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {TIME_HORIZONS.map(h => (
            <label key={h.value} className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-400" style={{
              borderColor: data.time_horizon === h.value ? '#2563eb' : '#e5e7eb',
              backgroundColor: data.time_horizon === h.value ? '#eff6ff' : 'white'
            }}>
              <input
                type="radio"
                name="time_horizon"
                value={h.value}
                checked={data.time_horizon === h.value}
                onChange={() => onUpdate('portfolio_goals', { time_horizon: h.value })}
                className="w-4 h-4"
              />
              <div className="ml-3">
                <p className="font-semibold text-gray-900">{h.label}</p>
                <p className="text-sm text-gray-600">{h.description}</p>
              </div>
            </label>
          ))}
          {errors.horizon && <p className="text-sm text-red-600">{errors.horizon}</p>}
        </CardContent>
      </Card>

      {/* Target Annual Return */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Target Annual Return</CardTitle>
            <Tooltip text="What annual return do you aim for? (5-100%)" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-blue-600">{data.target_annual_return}%</span>
            <span className="text-sm text-gray-600">Target Annual Return</span>
          </div>
          <Slider
            value={[data.target_annual_return]}
            onValueChange={(val) => onUpdate('portfolio_goals', { target_annual_return: val[0] })}
            min={5}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Conservative</span>
            <span>Balanced</span>
            <span>Aggressive</span>
          </div>
          {errors.return && <p className="text-sm text-red-600">{errors.return}</p>}
        </CardContent>
      </Card>

      {/* Diversification Strategy */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Diversification Strategy</CardTitle>
            <Tooltip text="How should we allocate your investments?" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {DIVERSIFICATION.map(d => (
            <label key={d.value} className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-purple-400" style={{
              borderColor: data.diversification_strategy === d.value ? '#9333ea' : '#e5e7eb',
              backgroundColor: data.diversification_strategy === d.value ? '#faf5ff' : 'white'
            }}>
              <input
                type="radio"
                name="diversification"
                value={d.value}
                checked={data.diversification_strategy === d.value}
                onChange={() => onUpdate('portfolio_goals', { diversification_strategy: d.value })}
                className="w-4 h-4"
              />
              <div className="ml-3">
                <p className="font-semibold text-gray-900">{d.label}</p>
                <p className="text-sm text-gray-600">{d.description}</p>
              </div>
            </label>
          ))}
          {errors.div && <p className="text-sm text-red-600">{errors.div}</p>}
        </CardContent>
      </Card>

      {/* Sector Priorities */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Sector Priorities</CardTitle>
            <Tooltip text="Which sectors should we prioritize in recommendations?" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {SECTORS.map(sector => (
              <button
                key={sector}
                onClick={() => toggleSector(sector)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  data.sector_priorities.includes(sector)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
          {errors.sectors && <p className="text-sm text-red-600">{errors.sectors}</p>}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          onClick={() => validate() && onNext()}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          Next: Community
        </Button>
      </div>
    </div>
  );
}