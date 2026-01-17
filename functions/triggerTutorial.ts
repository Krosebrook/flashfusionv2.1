import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json();
  const { trigger_type, page_name } = body;

  try {
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user profile
    const profiles = await base44.entities.UserProfile.filter({
      created_by: user.email
    });
    const profile = profiles[0];

    if (!profile) {
      return Response.json({ tutorial: null });
    }

    // Fetch available tutorials
    const tutorials = await base44.entities.OnboardingTutorial.filter({
      is_active: true,
      trigger_type: trigger_type
    });

    // Find the first tutorial not yet completed
    const nextTutorial = tutorials.find(t => {
      const completed = profile.tutorial_progress?.completed_tutorials || [];
      const dismissed = profile.tutorial_progress?.tutorials_dismissed || [];
      return !completed.includes(t.tutorial_id) && !dismissed.includes(t.tutorial_id);
    });

    if (nextTutorial) {
      // Update profile with current tutorial
      await base44.entities.UserProfile.update(profile.id, {
        tutorial_progress: {
          ...profile.tutorial_progress,
          current_tutorial: nextTutorial.tutorial_id,
          current_step: 0
        },
        feature_first_visits: {
          ...profile.feature_first_visits,
          [page_name]: new Date().toISOString()
        }
      });

      return Response.json({
        success: true,
        tutorial: nextTutorial,
        step: 0
      });
    }

    return Response.json({
      success: true,
      tutorial: null
    });
  } catch (error) {
    console.error('Tutorial trigger error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});