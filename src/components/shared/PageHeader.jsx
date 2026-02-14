import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * PageHeader - Consistent header for all pages
 * Props:
 * - title: string
 * - description: string (optional)
 * - actions: ReactNode (optional)
 * - backButton: boolean (optional)
 * - breadcrumbs: array (optional)
 */
export default function PageHeader({ 
  title, 
  description, 
  actions, 
  backButton = false,
  breadcrumbs = []
}) {
  const navigate = useNavigate();

  return (
    <header className="border-b border-[hsl(var(--border-default))] bg-[hsl(var(--surface-secondary))] px-6 py-4">
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex items-center gap-2 text-sm text-[hsl(var(--text-tertiary))]">
            {breadcrumbs.map((crumb, idx) => (
              <li key={idx} className="flex items-center gap-2">
                {idx > 0 && <span>/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-[hsl(var(--text-primary))]">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-[hsl(var(--text-primary))]">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            {backButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] truncate">
              {title}
            </h1>
          </div>
          {description && (
            <p className="mt-1 text-sm text-[hsl(var(--text-secondary))]">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}