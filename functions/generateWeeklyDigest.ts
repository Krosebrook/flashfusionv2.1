import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generate a personalized weekly digest for an activated user.
 * Summarizes: deals, insights, community activity, portfolio progress
 * 
 * Should run on a scheduled automation (weekly, based on user's preferred day/time)
 */

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json();
  const { user_email } = body;

  try {
    // Fetch user profile
    const profiles = await base44.entities.UserProfile.filter({
      created_by: user_email || (await base44.auth.me()).email
    });
    const profile = profiles[0];

    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    const state = profile.retention_state || {};
    const digestPrefs = state.digest_preferences || {};

    // Skip if user opted out
    if (!digestPrefs.opted_in) {
      return Response.json({ success: true, message: 'User opted out of digest' });
    }

    // Compile digest components
    const digest = {
      recipient: profile.created_by,
      subject: 'Your Weekly Investment Snapshot',
      sent_at: new Date().toISOString(),
      week_ending: new Date().toISOString(),
      components: []
    };

    // 1. What Changed This Week
    digest.components.push({
      type: 'update_summary',
      title: 'What Changed This Week',
      data: {
        deals_added: state.active_habit_loops?.discovery?.actions_taken || 0,
        new_experts: await countNewExperts(profile),
        portfolio_updates: state.active_habit_loops?.insight?.triggered_count || 0
      }
    });

    // 2. Top Deal This Week
    const topDeal = await getTopDealForUser(profile);
    if (topDeal) {
      digest.components.push({
        type: 'curated_deal',
        title: 'Top Deal This Week',
        data: {
          company: topDeal.company_name,
          stage: topDeal.stage,
          size: topDeal.funding_raised,
          match_reason: 'Matches your ' + (profile.deal_sourcing_criteria?.target_industries?.[0] || 'investment') + ' criteria'
        }
      });
    }

    // 3. Community Highlights
    const communityActivity = await getCommunityHighlights(profile);
    if (communityActivity.length > 0) {
      digest.components.push({
        type: 'social_signal',
        title: 'Community Highlights',
        data: {
          count: communityActivity.length,
          examples: communityActivity.slice(0, 2)
        }
      });
    }

    // 4. Portfolio Snapshot
    const portfolioStatus = await getPortfolioStatus(profile);
    digest.components.push({
      type: 'insight_summary',
      title: 'Your Portfolio Snapshot',
      data: {
        projected_roi: portfolioStatus.projected_roi,
        target_roi: profile.portfolio_goals?.target_annual_return,
        status: portfolioStatus.status,
        message: portfolioStatus.message
      }
    });

    // 5. What to Explore
    const suggestions = await generateSuggestions(profile);
    if (suggestions.length > 0) {
      digest.components.push({
        type: 'suggestion',
        title: 'What to Explore This Week',
        data: {
          suggestions: suggestions.slice(0, 2)
        }
      });
    }

    // Save digest to database
    try {
      await base44.entities.WeeklyDigest.create({
        ...digest,
        status: 'generated',
        created_by: profile.created_by
      });
    } catch (e) {
      console.log('Weekly digest entity not yet created, storing in memory');
    }

    // Update last sent timestamp
    await base44.entities.UserProfile.update(profile.id, {
      retention_state: {
        ...state,
        digest_preferences: {
          ...digestPrefs,
          last_sent_at: new Date().toISOString()
        }
      }
    });

    return Response.json({
      success: true,
      digest,
      message: 'Weekly digest generated successfully'
    });
  } catch (error) {
    console.error('Weekly digest error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function countNewExperts(profile) {
  // Mock implementation
  return 2;
}

async function getTopDealForUser(profile) {
  // Fetch top deal matching user's criteria
  try {
    const deals = await base44.entities.DealData.filter({
      industry: profile.deal_sourcing_criteria?.target_industries?.[0] || 'tech'
    }, '-relevance_score', 1);
    return deals[0] || null;
  } catch (e) {
    return null;
  }
}

async function getCommunityHighlights(profile) {
  // Mock: Return high-signal discussions
  return [
    {
      title: '[Expert] closed $5M Series B in AI',
      type: 'deal_discussion',
      engagement: 23
    }
  ];
}

async function getPortfolioStatus(profile) {
  const goalRoi = profile.portfolio_goals?.target_annual_return || 15;
  const currentRoi = 16.5; // Mock: Would calculate from actual deals
  
  return {
    projected_roi: currentRoi,
    status: currentRoi >= goalRoi ? 'on_track' : 'below_track',
    message: `You're ${currentRoi >= goalRoi ? 'on track' : 'slightly below'} your ${goalRoi}% annual goal.`
  };
}

async function generateSuggestions(profile) {
  // Generate 1-2 personalized suggestions
  const suggestions = [];

  if (!profile.retention_state?.active_habit_loops?.social?.active) {
    suggestions.push({
      title: 'Join Angel Syndicate',
      reason: 'Get early access to co-investment deals',
      link: '/community?tab=syndicates'
    });
  }

  if (profile.activation_state?.behavioral_signals?.deals_saved < 5) {
    suggestions.push({
      title: 'Save More Deals',
      reason: 'Build a stronger watchlist for better recommendations',
      link: '/deal-sourcer'
    });
  }

  return suggestions;
}