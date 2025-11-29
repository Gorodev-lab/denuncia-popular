# EmailJS Setup Guide

## Overview
The application now sends an email with the generated PDF complaint to users who provide their email address. This is implemented using **EmailJS**, a client-side email service that doesn't require a backend server.

## Why EmailJS?
- **No Backend Required**: Works entirely from the browser
- **Free Tier**: 200 emails/month (sufficient for MVP)
- **Simple Integration**: Easy to set up and configure
- **Secure**: API keys are public-facing and safe to expose

---

## Setup Instructions

### 1. Create an EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click **Sign Up** and create a free account
3. Verify your email address

### 2. Add an Email Service

1. In your EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the provider-specific instructions:
   - **Gmail**: You'll need to enable "Less secure app access" or use an App Password
   - **Outlook**: Standard login credentials work
5. Note your **Service ID** (e.g., `service_abc123`)

### 3. Create an Email Template

1. Go to **Email Templates** in the dashboard
2. Click **Create New Template**
3. Use the following template structure:

```html
Subject: Denuncia Popular - Folio {{folio}}

Estimado/a {{to_name}},

Hemos recibido su denuncia con éxito. A continuación encontrará los detalles:

**Folio**: {{folio}}

Puede descargar su documento oficial aquí: {{pdf_link}}

{{message}}

---
Esoteria AI - Denuncia Popular
https://www.esoteriaai.com
```

4. Configure the template variables:
   - `to_email` - Recipient email
   - `to_name` - Recipient name
   - `folio` - Complaint folio number
   - `pdf_link` - Public URL to the PDF
   - `message` - Custom message

5. **Important**: Set the "To Email" field to `{{to_email}}`
6. Save the template and note your **Template ID** (e.g., `template_xyz789`)

### 4. Get Your Public Key

1. Go to **Account** → **General** in the dashboard
2. Find your **Public Key** (looks like `user_XyZ123AbC`)
3. Keep this handy for the next step

### 5. Update Environment Variables

Create or update your `.env.local` file:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=user_XyZ123AbC
```

**Note**: Replace the placeholder values with your actual EmailJS credentials.

### 6. Update the Code

Open `components/steps/StepReview.tsx` and replace the placeholders:

```typescript
await emailjs.send(
  import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID',
  import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID',
  {
    to_email: draft.email,
    to_name: draft.fullName || 'Ciudadano',
    folio: folio,
    pdf_link: publicUrl,
    message: 'Adjunto encontrará su denuncia generada.'
  },
  import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY'
);
```

---

## Testing

### Test the Email Flow

1. Run the development server: `npm run dev`
2. Complete the complaint form
3. Ensure you provide a valid email address
4. Submit the complaint
5. Check the email inbox (and spam folder)

### Troubleshooting

**Email not received?**
- Check EmailJS dashboard for send logs
- Verify your email service credentials
- Check spam/junk folder
- Ensure template variables match the code

**Upload errors?**
- Verify Supabase Storage bucket `evidence` exists and has public access
- Check browser console for detailed error messages

**CORS errors?**
- EmailJS should work from any domain (no CORS issues)
- If using Supabase, ensure RLS policies allow public uploads

---

## Flow Diagram

```
User Submits Complaint
       ↓
1. Insert data into Supabase `denuncias` table
       ↓
2. Generate PDF with folio number
       ↓
3. Upload PDF to Supabase Storage (`evidence/pdfs/`)
       ↓
4. Get public URL of uploaded PDF
       ↓
5. Send email via EmailJS with PDF link
       ↓
Success! User receives email
```

---

## Cost & Limits

### EmailJS Free Tier
- **200 emails/month** (resets monthly)
- **Unlimited templates**
- **EmailJS branding** in emails

### Paid Plans
- **Personal**: $7/month (1,000 emails)
- **Professional**: $15/month (10,000 emails)
- Remove EmailJS branding

### Supabase Storage
- **1 GB free storage**
- Each PDF is ~50-100 KB
- Approximately 10,000-20,000 PDFs fit in free tier

---

## Alternative Approaches

If you need more robust email functionality:

1. **Resend.com**: Modern email API with generous free tier
2. **SendGrid**: Enterprise-grade email service
3. **Custom Backend**: Use Supabase Edge Functions with Resend

For now, EmailJS is the simplest and most cost-effective solution for the MVP.

---

## Security Notes

- EmailJS public keys are **safe to expose** in client-side code
- Never expose SMTP credentials directly
- EmailJS acts as a proxy, protecting your email service credentials
- Rate limiting is handled by EmailJS automatically

---

## Next Steps

1. Set up your EmailJS account
2. Configure the email service and template
3. Add environment variables
4. Test the flow
5. Monitor usage in the EmailJS dashboard
