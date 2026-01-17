import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const TUTORIAL_SEEDS = [
  {
    tutorial_id: 'discover_deals',
    title: 'Discovering Deals',
    description: 'Find and explore investment opportunities matching your criteria',
    category: 'deals',
    trigger_type: 'feature_first_visit',
    trigger_condition: 'visiting DealSourcer for first time',
    estimated_duration_seconds: 180,
    difficulty: 'beginner',
    priority: 10,
    steps: [
      {
        order: 1,
        title: 'Welcome to Deal Discovery',
        description: 'This is where you'll find deals matching your investment profile.',
        target_element: '.deal-sourcer-hero',
        action: 'navigate',
        cta_text: 'Next'
      },
      {
        order: 2,
        title: 'Use Filters',
        description: 'Filter by source, stage, or your saved criteria.',
        target_element: '.deal-filters',
        action: 'click',
        cta_text: 'Next'
      },
      {
        order: 3,
        title: 'Save Deals',
        description: 'Heart icon saves deals to your watchlist.',
        target_element: '.deal-save-btn',
        action: 'click',
        cta_text: 'Next'
      },
      {
        order: 4,
        title: 'View Details',
        description: 'Click any deal to see full company info, funding, and key people.',
        target_element: '.deal-card',
        action: 'click',
        cta_text: 'Complete'
      }
    ]
  },
  {
    tutorial_id: 'manage_portfolio',
    title: 'Managing Your Portfolio',
    description: 'Track investments and monitor portfolio performance',
    category: 'portfolio',
    trigger_type: 'feature_first_visit',
    trigger_condition: 'visiting portfolio page',
    estimated_duration_seconds: 240,
    difficulty: 'intermediate',
    priority: 9,
    steps: [
      {
        order: 1,
        title: 'Portfolio Overview',
        description: 'See all your investments at a glance.',
        target_element: '.portfolio-hero',
        action: 'navigate',
        cta_text: 'Next'
      },
      {
        order: 2,
        title: 'Add Investment',
        description: 'Click to log a new investment in your portfolio.',
        target_element: '.portfolio-add-btn',
        action: 'click',
        cta_text: 'Next'
      },
      {
        order: 3,
        title: 'Track Performance',
        description: 'Monitor valuations, returns, and progress toward your goals.',
        target_element: '.portfolio-metrics',
        action: 'view',
        cta_text: 'Complete'
      }
    ]
  },
  {
    tutorial_id: 'join_community',
    title: 'Joining Communities',
    description: 'Connect with peers, share deals, and learn together',
    category: 'community',
    trigger_type: 'feature_first_visit',
    trigger_condition: 'visiting community page',
    estimated_duration_seconds: 150,
    difficulty: 'beginner',
    priority: 8,
    steps: [
      {
        order: 1,
        title: 'Community Hub',
        description: 'Discover groups aligned with your interests.',
        target_element: '.community-hero',
        action: 'navigate',
        cta_text: 'Next'
      },
      {
        order: 2,
        title: 'Browse Groups',
        description: 'Explore angel syndicates, LP networks, and special interest groups.',
        target_element: '.community-groups',
        action: 'view',
        cta_text: 'Next'
      },
      {
        order: 3,
        title: 'Join & Participate',
        description: 'Click Join to become a member and start participating.',
        target_element: '.group-join-btn',
        action: 'click',
        cta_text: 'Complete'
      }
    ]
  },
  {
    tutorial_id: 'read_analytics',
    title: 'Understanding Analytics',
    description: 'Interpret your data and make informed decisions',
    category: 'analytics',
    trigger_type: 'feature_first_visit',
    trigger_condition: 'visiting analytics page',
    estimated_duration_seconds: 210,
    difficulty: 'intermediate',
    priority: 7,
    steps: [
      {
        order: 1,
        title: 'Analytics Dashboard',
        description: 'See summaries of your activity and portfolio health.',
        target_element: '.analytics-hero',
        action: 'navigate',
        cta_text: 'Next'
      },
      {
        order: 2,
        title: 'Key Metrics',
        description: 'Track ROI, diversification, and alignment with your goals.',
        target_element: '.analytics-metrics',
        action: 'view',
        cta_text: 'Next'
      },
      {
        order: 3,
        title: 'Generate Reports',
        description: 'Export data for deeper analysis or sharing with advisors.',
        target_element: '.analytics-export-btn',
        action: 'click',
        cta_text: 'Complete'
      }
    ]
  }
];

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    let created = 0;
    let skipped = 0;

    for (const tutorial of TUTORIAL_SEEDS) {
      try {
        const existing = await base44.entities.OnboardingTutorial.filter({
          tutorial_id: tutorial.tutorial_id
        });

        if (existing.length === 0) {
          await base44.entities.OnboardingTutorial.create(tutorial);
          created++;
        } else {
          skipped++;
        }
      } catch (e) {
        console.error(`Failed to seed ${tutorial.tutorial_id}:`, e);
      }
    }

    return Response.json({
      success: true,
      created,
      skipped,
      total: TUTORIAL_SEEDS.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});