# EmailJS Quick Setup Guide

## Current Status: ✅ Account Created

You're now on the Email Services page. Follow these steps:

---

## Step 1: Add Email Service

1. Click **"Add New Service"** button (blue button on your screen)
2. Choose your email provider:
   - **Gmail** (recommended for testing)
   - Outlook
   - Yahoo
   - Or custom SMTP

### For Gmail:
1. Select "Gmail"
2. Click "Connect Account"
3. Sign in with your Google account
4. Allow EmailJS permissions
5. **Copy the Service ID** (looks like `service_abc123`)

---

## Step 2: Create Email Template

1. Go to **"Email Templates"** in the left sidebar
2. Click **"Create New Template"**
3. Set up the template:

### Template Configuration:

**Template Name:** `Denuncia Popular - Confirmation`

**From Name:** `Esoteria AI - Denuncia Popular`

**From Email:** (will use your connected service)

**To Email:** `{{to_email}}`

**Subject:** `Denuncia Popular - Folio {{folio}}`

**Message Body:**
```
Estimado/a {{to_name}},

Hemos recibido su denuncia con éxito.

FOLIO: {{folio}}

Puede descargar su documento oficial en el siguiente enlace:
{{pdf_link}}

{{message}}

---
Gracias por utilizar Denuncia Popular
Esoteria AI
https://www.esoteriaai.com
```

4. Click **"Save"**
5. **Copy the Template ID** (looks like `template_xyz789`)

---

## Step 3: Get Your Public Key

1. Click on **"Account"** in the left sidebar
2. Go to **"General"** tab
3. Find **"Public Key"** section
4. **Copy your Public Key** (looks like `user_XyZ123AbC`)

---

## Step 4: Update Environment Variables

Open `/home/egorops/denuncia-popular/.env.local` and replace:

```env
VITE_EMAILJS_SERVICE_ID=service_abc123      # Your Service ID
VITE_EMAILJS_TEMPLATE_ID=template_xyz789    # Your Template ID
VITE_EMAILJS_PUBLIC_KEY=user_XyZ123AbC      # Your Public Key
```

---

## Step 5: Test

1. Restart your dev server: `npm run dev`
2. Submit a test complaint with a valid email
3. Check your inbox (and spam folder)

---

## Need Help?

If you encounter any issues:
- Check the EmailJS dashboard for send logs
- Verify template variables match exactly
- Ensure your email service is connected
- Check browser console for errors

---

## What to Share

Once you complete the setup, share:
1. ✅ Service ID
2. ✅ Template ID  
3. ✅ Public Key

I'll help you update the `.env.local` file!
