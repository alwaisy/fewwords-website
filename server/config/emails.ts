/**
 * Email Configuration
 *
 * Centralized config for all outgoing emails.
 * Domain: m.fewwords.app (verified in Resend)
 */

export const emailConfig = {
  // Domain for all emails
  domain: "m.fewwords.app",

  // admin email
  // adminEmail: process.env.ADMIN_EMAIL,

  // Sender addresses
  senders: {
    // Authentication emails (magic links, verification)
    auth: {
      name: "Fewwords",
      email: "magiclink@m.fewwords.app",
    },
    // Notification emails (summary ready, alerts)
    notify: {
      name: "Fewwords",
      email: "notify@m.fewwords.app",
    },
    // Generic noreply
    noreply: {
      name: "Fewwords",
      email: "noreply@m.fewwords.app",
    },
  },
} as const;

/**
 * Get formatted sender string for Resend API
 * @example "Fewwords <magiclink@m.fewwords.app>"
 */
export function getSender(type: keyof typeof emailConfig.senders): string {
  const sender = emailConfig.senders[type];
  return `${sender.name} <${sender.email}>`;
}
