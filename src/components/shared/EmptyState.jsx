import { Button } from '@/components/ui/button';

/**
 * EmptyState - Consistent empty state UI
 * Props:
 * - icon: Lucide icon component
 * - title: string
 * - description: string
 * - action: { label: string, onClick: function, icon: component } (optional)
 */
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-[hsl(var(--surface-tertiary))] flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-[hsl(var(--text-tertiary))]" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[hsl(var(--text-secondary))] max-w-md mb-6">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} className="btn-action-primary">
          {action.icon && <action.icon className="w-4 h-4 mr-2" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}