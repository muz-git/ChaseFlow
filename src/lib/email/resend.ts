import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendRequestEmailParams {
  to: string
  clientName: string
  firmName: string
  requestTitle: string
  dueDate?: string | null
  portalUrl: string
  items: string[]
}

export async function sendDocumentRequestEmail({
  to,
  clientName,
  firmName,
  requestTitle,
  dueDate,
  portalUrl,
  items,
}: SendRequestEmailParams) {
  const fromAddress =
    process.env.RESEND_FROM_EMAIL || 'ChaseFlow <onboarding@resend.dev>'

  const formattedDue = dueDate
    ? new Date(dueDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  const itemsHtml = items
    .map((item) => `<li style="margin-bottom:6px;color:#334155;">${item}</li>`)
    .join('')

  const { data, error } = await resend.emails.send({
    from: fromAddress,
    to,
    subject: `${firmName}: Documents requested (${requestTitle})`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
        <p style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;margin:0 0 8px;">
          ${firmName}
        </p>
        <h1 style="font-size:20px;color:#0f172a;margin:0 0 16px;">
          ${requestTitle}
        </h1>
        <p style="font-size:15px;color:#334155;line-height:1.5;">
          Hi ${clientName},
        </p>
        <p style="font-size:15px;color:#334155;line-height:1.5;">
          ${firmName} has requested the following documents from you${
            formattedDue ? ` by <strong>${formattedDue}</strong>` : ''
          }:
        </p>
        <ul style="padding-left:20px;margin:16px 0;">
          ${itemsHtml}
        </ul>
        <div style="margin:28px 0;">
          <a href="${portalUrl}" style="background-color:#0f172a;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600;display:inline-block;">
            Upload Documents Securely
          </a>
        </div>
        <p style="font-size:12px;color:#64748b;line-height:1.5;">
          No account or password is required. If the button doesn't work, copy and paste this link into your browser:<br/>
          <span style="color:#0f172a;word-break:break-all;">${portalUrl}</span>
        </p>
      </div>
    `,
  })

  if (error) {
    return { error: error.message }
  }

  return { messageId: data?.id ?? null }
}