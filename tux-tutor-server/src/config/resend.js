const { Resend } = require('resend');

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey || apiKey === 're_123456789' || apiKey.startsWith('re_xxxx')) {
  console.warn('[Resend] Notice: RESEND_API_KEY is using a placeholder. Real emails will fail unless an active key from https://resend.com is configured.');
}

const resend = new Resend(apiKey || 're_placeholder');

module.exports = resend;

