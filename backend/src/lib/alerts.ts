import { Resend } from 'resend';
import { prisma } from './prisma';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function truncate(s: string, n = 200): string {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

export async function maybeSendCostAlert(
  costUsd: number,
  model: string,
  prompt: string,
): Promise<void> {
  if (!resend) return;

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!settings?.cost_alert_usd || !settings.alert_email) return;
  if (costUsd <= settings.cost_alert_usd) return;

  const threshold = settings.cost_alert_usd.toFixed(4);
  const actual    = costUsd.toFixed(4);

  await resend.emails.send({
    from: 'LogLens Alerts <onboarding@resend.dev>',
    to:   settings.alert_email,
    subject: `Cost alert: $${actual} on ${model}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#18181b">
        <div style="background:#4f46e5;border-radius:10px 10px 0 0;padding:20px 24px">
          <span style="color:#fff;font-size:18px;font-weight:600">⚠️ LogLens Cost Alert</span>
        </div>
        <div style="border:1px solid #e4e4e7;border-top:none;border-radius:0 0 10px 10px;padding:24px">
          <p style="margin:0 0 16px">
            A single LLM call exceeded your cost threshold of
            <strong>$${threshold}</strong>.
          </p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr>
              <td style="padding:8px 12px;background:#f4f4f5;border-radius:6px 0 0 0;font-weight:600;width:120px">Model</td>
              <td style="padding:8px 12px;background:#f9f9fa;border-radius:0 6px 0 0">${model}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;background:#f4f4f5;font-weight:600">Actual cost</td>
              <td style="padding:8px 12px;background:#f9f9fa;color:#16a34a;font-weight:600">$${actual}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;background:#f4f4f5;font-weight:600">Threshold</td>
              <td style="padding:8px 12px;background:#f9f9fa">$${threshold}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;background:#f4f4f5;border-radius:0 0 0 6px;font-weight:600">Prompt</td>
              <td style="padding:8px 12px;background:#f9f9fa;border-radius:0 0 6px 0;color:#52525b;font-style:italic">
                &ldquo;${truncate(prompt).replace(/</g, '&lt;').replace(/>/g, '&gt;')}&rdquo;
              </td>
            </tr>
          </table>
          <p style="margin:20px 0 0;font-size:13px;color:#71717a">
            To adjust or disable this alert, visit your
            <a href="https://app.loglens.io/settings" style="color:#4f46e5">LogLens Settings</a>.
          </p>
        </div>
      </div>
    `,
  });
}
