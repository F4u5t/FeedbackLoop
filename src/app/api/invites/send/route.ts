import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, inviteUrl, invitedByUsername } = await req.json();

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const result = await resend.emails.send({
      from: 'FeedbackLoop <onboarding@resend.dev>',
      to: email,
      subject: '[FEEDBACKLOOP] You\'ve been invited to join the community',
      html: `
        <div style="font-family: 'Courier New', monospace; background: #0a0a0a; color: #e0e0e0; padding: 20px; border: 1px solid #333;">
          <pre style="color: #00ff41; font-size: 12px;">
╔═══════════════════════════════════════╗
║     FEEDBACKLOOP v1.0 Invite          ║
║   AI Developer Underground Network    ║
╚═══════════════════════════════════════╝
          </pre>

          <p>You've been invited to join <strong>FEEDBACKLOOP</strong>, an underground community of AI developers at Trane Technologies.</p>

          <p>Invited by: <strong>${invitedByUsername}</strong></p>

          <p style="margin-top: 20px;">Click the link below to join:</p>

          <p style="text-align: center; margin: 20px 0;">
            <a href="${inviteUrl}" style="
              background: #00ff41;
              color: #0a0a0a;
              padding: 12px 24px;
              text-decoration: none;
              font-weight: bold;
              font-family: 'Courier New', monospace;
              border: 2px solid #00ff41;
              display: inline-block;
            ">[ACCEPT INVITE]</a>
          </p>

          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This invite expires in 7 days. Link: <code style="background: #1a1a2e; padding: 2px 4px;">${inviteUrl}</code>
          </p>

          <p style="color: #666; font-size: 12px; border-top: 1px solid #333; padding-top: 10px; margin-top: 20px;">
            FEEDBACKLOOP v1.0 :: Secure Channel :: EST. 2026
          </p>
        </div>
      `,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending invite email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
