import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { cartId } = await req.json();

    // Get cart details
    const cart = await base44.asServiceRole.entities.AbandonedCart.list();
    const abandonedCart = cart.find(c => c.id === cartId);

    if (!abandonedCart) {
      return Response.json({ success: false, error: "Cart not found" }, { status: 404 });
    }

    // Generate personalized email content
    const prompt = `Create a compelling abandoned cart recovery email:

Customer: ${abandonedCart.customer_name || "Valued Customer"}
Cart Value: $${abandonedCart.total_value?.toFixed(2)}
Items: ${abandonedCart.products?.map(p => `${p.product_title} (${p.quantity})`).join(", ")}

Generate:
- Friendly, personalized subject line
- Email body with:
  * Warm greeting
  * Gentle reminder about cart items
  * Highlight product benefits
  * Create urgency (limited stock/time offer)
  * Include 10% discount code
  * Clear CTA to complete purchase
  * Professional closing

Make it engaging and conversion-focused. Return as HTML.`;

    const emailContent = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          subject: { type: "string" },
          html_content: { type: "string" },
          discount_code: { type: "string" },
        },
      },
    });

    // Send email
    await base44.integrations.Core.SendEmail({
      to: abandonedCart.customer_email,
      subject: emailContent.subject,
      body: emailContent.html_content,
      from_name: "FlashFusion E-commerce",
    });

    // Update cart status
    await base44.asServiceRole.entities.AbandonedCart.update(cartId, {
      recovery_status: "email_sent",
      emails_sent: (abandonedCart.emails_sent || 0) + 1,
      last_email_sent: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      message: "Recovery email sent successfully",
      discount_code: emailContent.discount_code,
    });
  } catch (error) {
    console.error("Error sending abandoned cart email:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});