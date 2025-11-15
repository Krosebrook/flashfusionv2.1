import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function FeatureCard({
  title,
  description,
  icon: Icon,
  href,
  creditCost,
  category,
  isPopular = false,
  disabled = false,
  onClick
}) {
  const CardWrapper = href ? Link : 'div';
  const cardProps = href ? { to: href } : { onClick };

  return (
    <CardWrapper 
      {...cardProps}
      className={`
        relative bg-gray-800 hover:bg-gray-750 transition-all duration-200 
        p-6 rounded-lg border border-gray-700 hover:border-gray-600
        ${href ? 'hover:shadow-lg hover:scale-[1.02]' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isPopular ? 'ring-2 ring-blue-500/50' : ''}
      `}
    >
      {isPopular && (
        <Badge className="absolute -top-2 -right-2 bg-blue-500 text-white">
          Popular
        </Badge>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <Icon className="w-10 h-10 text-blue-400" />
        {creditCost && (
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Zap className="w-3 h-3" />
            {creditCost}
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <h3 className="font-semibold text-lg text-white">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex items-center justify-between">
        {category && (
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
        )}
        <div className="flex items-center gap-1 text-sm text-blue-400">
          {href ? 'Get Started' : 'Launch'}
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </CardWrapper>
  );
}