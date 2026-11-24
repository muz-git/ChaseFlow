import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder')

const DEFAULT_FROM_ADDRESS = 'FetchDocs <requests@fetchdocs.co.uk>'

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
  const fromAddress = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_ADDRESS

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
        <p style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#059669;margin:0 0 8px;">
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
        <hr style="border:none;border-top:1px solid #f1f5f9;margin:20px 0 12px;" />
        <p style="font-size:11px;color:#94a3b8;margin:0;">
          Sent securely via FetchDocs on behalf of ${firmName}
        </p>
      </div>
    `,
  })

  if (error) {
    return { error: error.message }
  }

  return { messageId: data?.id ?? null }
}

interface SendReminderEmailParams {
  to: string
  clientName: string
  firmName: string
  requestTitle: string
  dueDate?: string | null
  portalUrl: string
  remainingItems: string[]
}

export async function sendReminderEmail({
  to,
  clientName,
  firmName,
  requestTitle,
  dueDate,
  portalUrl,
  remainingItems,
}: SendReminderEmailParams) {
  const fromAddress = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_ADDRESS

  const formattedDue = dueDate
    ? new Date(dueDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  const itemsHtml = remainingItems
    .map((item) => `<li style="margin-bottom:6px;color:#334155;">${item}</li>`)
    .join('')

  const { data, error } = await resend.emails.send({
    from: fromAddress,
    to,
    subject: `Reminder: Outstanding documents for ${requestTitle} (${firmName})`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
        <p style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#b45309;margin:0 0 8px;">
          Document Reminder &bull; ${firmName}
        </p>
        <h1 style="font-size:20px;color:#0f172a;margin:0 0 16px;">
          ${requestTitle}
        </h1>
        <p style="font-size:15px;color:#334155;line-height:1.5;">
          Hi ${clientName},
        </p>
        <p style="font-size:15px;color:#334155;line-height:1.5;">
          Just a quick reminder that we are still waiting on ${remainingItems.length} outstanding item${
            remainingItems.length === 1 ? '' : 's'
          }${formattedDue ? ` ahead of your <strong>${formattedDue}</strong> due date` : ''}:
        </p>
        <ul style="padding-left:20px;margin:16px 0;">
          ${itemsHtml}
        </ul>
        <div style="margin:28px 0;">
          <a href="${portalUrl}" style="background-color:#0f172a;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600;display:inline-block;">
            Upload Remaining Documents
          </a>
        </div>
        <p style="font-size:12px;color:#64748b;line-height:1.5;">
          No login required. Direct link:<br/>
          <span style="color:#0f172a;word-break:break-all;">${portalUrl}</span>
        </p>
        <hr style="border:none;border-top:1px solid #f1f5f9;margin:20px 0 12px;" />
        <p style="font-size:11px;color:#94a3b8;margin:0;">
          Sent securely via FetchDocs on behalf of ${firmName}
        </p>
      </div>
    `,
  })

  if (error) {
    return { error: error.message }
  }

  return { messageId: data?.id ?? null }
}