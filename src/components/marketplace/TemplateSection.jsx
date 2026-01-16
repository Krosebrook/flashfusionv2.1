import MarketplaceCard from "./MarketplaceCard";

// Reusable section component to reduce duplication
export default function TemplateSection({
  title,
  icon: Icon,
  iconColor,
  templates,
  onSelectTemplate,
}) {
  if (templates.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <MarketplaceCard
            key={template.id}
            template={template}
            onSelect={onSelectTemplate}
          />
        ))}
      </div>
    </div>
  );
}
