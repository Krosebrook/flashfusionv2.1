import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json();
  const { tutorial_id, action, step } = body;

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
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    const tutorialProgress = profile.tutorial_progress || {
      completed_tutorials: [],
      tutorials_dismissed: [],
      current_tutorial: null,
      current_step: 0
    };

    if (action === 'complete') {
      tutorialProgress.completed_tutorials.push(tutorial_id);
      tutorialProgress.current_tutorial = null;
      tutorialProgress.current_step = 0;
    } else if (action === 'dismiss') {
      tutorialProgress.tutorials_dismissed.push(tutorial_id);
      tutorialProgress.current_tutorial = null;
      tutorialProgress.current_step = 0;
    } else if (action === 'step') {
      tutorialProgress.current_step = step;
    }

    // Update profile
    await base44.entities.UserProfile.update(profile.id, {
      tutorial_progress: tutorialProgress
    });

    return Response.json({
      success: true,
      action,
      tutorial_id
    });
  } catch (error) {
    console.error('Tutorial tracking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});