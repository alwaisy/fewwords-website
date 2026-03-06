/**
 * Email Templates
 *
 * Consistent email templates using Shadcn theme colors.
 * Email clients don't support CSS variables, so we use hardcoded values.
 */

// Theme colors from global.css (light mode)
export const theme = {
  background: "#f5f1e6",
  foreground: "#4a3f35",
  primary: "#a67c52",
  primaryForeground: "#ffffff",
  card: "#fffcf5",
  mutedForeground: "#7d6b56",
  border: "#dbd0ba",
} as const;

// Common email styles
const baseStyles = `
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
  .card {
    background: ${theme.card};
    border-radius: 8px;
    border: 1px solid ${theme.border};
    overflow: hidden;
  }
  .header {
    background: ${theme.primary};
    padding: 32px 24px;
    text-align: center;
  }
  .header h1 {
    color: ${theme.primaryForeground};
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }
  .content {
    padding: 32px 24px;
  }
  .greeting {
    color: ${theme.foreground};
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 16px 0;
  }
  .message {
    color: ${theme.mutedForeground};
    font-size: 16px;
    line-height: 1.6;
    margin: 0 0 24px 0;
  }
  .button {
    display: inline-block;
    background: ${theme.primary};
    color: ${theme.primaryForeground};
    text-decoration: none;
    padding: 14px 32px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 16px;
    text-align: center;
  }
  .footer {
    padding: 24px;
    text-align: center;
    border-top: 1px solid ${theme.border};
  }
  .footer-text {
    color: ${theme.mutedForeground};
    font-size: 14px;
    margin: 0;
  }
  .expiry {
    color: ${theme.mutedForeground};
    font-size: 14px;
    margin: 16px 0 0 0;
  }
  .ignore {
    color: ${theme.mutedForeground};
    font-size: 14px;
    margin: 8px 0 0 0;
  }
`;

// Base email wrapper
function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${baseStyles}</style>
  </head>
  <body style="background: ${theme.background};">
    ${content}
  </body>
</html>`;
}

/**
 * Auth email template - for magic links and verification
 */
export function authEmail(params: {
  greeting: string;
  message: string;
  buttonText: string;
  buttonUrl: string;
}): string {
  return emailWrapper(`
    <div class="container">
      <div class="card">
        <div class="header">
          <h1>Fewwords</h1>
        </div>
        <div class="content" style="text-align: center;">
          <p class="greeting">${params.greeting}</p>
          <p class="message">${params.message}</p>
          <a href="${params.buttonUrl}" class="button">${params.buttonText}</a>
          <p class="expiry">This link expires in 15 minutes.</p>
          <p class="ignore">If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p class="footer-text">Fewwords - Summarize anything, instantly.</p>
        </div>
      </div>
    </div>
  `);
}

/**
 * OTP email template - for login/register verification codes
 */
export function otpEmail(params: {
  greeting: string;
  message: string;
  otpCode: string;
}): string {
  return emailWrapper(`
    <div class="container">
      <div class="card">
        <div class="header">
          <h1>Fewwords</h1>
        </div>
        <div class="content" style="text-align: center;">
          <p class="greeting">${params.greeting}</p>
          <p class="message">${params.message}</p>
          <div style="background: ${theme.background}; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: 700; color: ${theme.primary}; letter-spacing: 8px; font-family: monospace;">${params.otpCode}</span>
          </div>
          <p class="expiry">This code expires in 10 minutes.</p>
          <p class="ignore">If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p class="footer-text">Fewwords - Summarize anything, instantly.</p>
        </div>
      </div>
    </div>
  `);
}

/**
 * Notification email template - for summary ready, etc.
 */
export function notificationEmail(params: {
  title: string;
  message: string;
  buttonText: string;
  buttonUrl: string;
  secondaryLink?: {
    text: string;
    url: string;
  };
}): string {
  return emailWrapper(`
    <div class="container">
      <div class="card">
        <div class="header">
          <h1>${params.title}</h1>
        </div>
        <div class="content" style="text-align: center;">
          <p class="message">${params.message}</p>
          <a href="${params.buttonUrl}" class="button">${params.buttonText}</a>
          ${
            params.secondaryLink
              ? `<p class="expiry">${params.secondaryLink.text} <a href="${params.secondaryLink.url}" style="color: ${theme.primary};">here</a>.</p>`
              : ""
          }
        </div>
        <div class="footer">
          <p class="footer-text">Fewwords - Summarize anything, instantly.</p>
        </div>
      </div>
    </div>
  `);
}
