# EmailJS Security Analysis and Edge Function Solution

## Security Risk Analysis

### Current Implementation (Client-Side)

The application currently uses `@emailjs/browser` to send emails directly from the client (browser). This approach has several security concerns:

#### Risks:
1. **Exposed Public Key**: The EmailJS public key is visible in the client-side JavaScript bundle, making it accessible to anyone who inspects the network traffic or source code.

2. **Rate Limiting Bypass**: Malicious actors can extract the public key and make unlimited API calls, potentially exhausting your EmailJS quota or sending spam.

3. **No Server-Side Validation**: Without server-side checks, there's no way to validate or sanitize email content before sending.

4. **Email Template Tampering**: Advanced users could potentially modify the email template ID or parameters in transit.

5. **Cost Control**: No ability to implement custom rate limiting or cost controls on the server side.

## Proposed Solution: Supabase Edge Function

### Architecture Change

**Before (Client-Side):**
```
User Browser → EmailJS API (Direct)
```

**After (Server-Side):**
```
User Browser → Supabase Edge Function → Email Provider API
```

### Benefits:
- ✅ API keys hidden on the server
- ✅ Server-side validation and sanitization
- ✅ Custom rate limiting
- ✅ Audit logging
- ✅ Cost control
- ✅ Flexibility to switch providers

---

## Implementation: Supabase Edge Function

### Step 1: Create the Edge Function

File: `supabase/functions/send-notification/index.ts`

\`\`\`typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Email provider configuration (using a REST API like SendGrid, Resend, or EmailJS)
const EMAIL_PROVIDER_API_KEY = Deno.env.get('EMAIL_PROVIDER_API_KEY')!;
const EMAIL_FROM = Deno.env.get('EMAIL_FROM') || 'noreply@denunciapopular.com';

interface NotificationRequest {
  to: string;
  reportFolio: string;
  pdfUrl: string;
  description: string;
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Parse request body
    const { to, reportFolio, pdfUrl, description }: NotificationRequest = await req.json();

    // 2. Validate inputs
    if (!to || !reportFolio) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Rate limiting check (example using Supabase)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check for recent emails sent to this address (rate limiting)
    const { data: recentEmails } = await supabaseClient
      .from('email_logs')
      .select('created_at')
      .eq('recipient', to)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
      .limit(5);

    if (recentEmails && recentEmails.length >= 5) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Prepare email content
    const emailHtml = \`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirmación de Reporte</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #ec4899;">Denuncia Popular</h1>
    <h2>Tu reporte ha sido registrado</h2>
    <p>Gracias por tu participación ciudadana. Tu reporte ha sido registrado exitosamente.</p>
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <strong>Folio:</strong> \${reportFolio}<br>
      <strong>Descripción:</strong> \${description?.substring(0, 200)}...
    </div>
    <p>Puedes descargar tu reporte en PDF desde el siguiente enlace:</p>
    <a href="\${pdfUrl}" style="display: inline-block; background: #ec4899; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      Descargar PDF
    </a>
    <p style="margin-top: 30px; font-size: 12px; color: #666;">
      Este es un correo automático. Por favor no respondas a este mensaje.
    </p>
  </div>
</body>
</html>
    \`;

    // 6. Send email via REST API (Example using generic REST API)
    const emailResponse = await fetch('https://api.emailprovider.com/v1/send', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${EMAIL_PROVIDER_API_KEY}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: to,
        subject: \`Confirmación de Reporte - Folio \${reportFolio}\`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      throw new Error(\`Email provider error: \${emailResponse.statusText}\`);
    }

    // 7. Log the email send (for auditing)
    await supabaseClient.from('email_logs').insert({
      recipient: to,
      folio: reportFolio,
      status: 'sent',
      created_at: new Date().toISOString(),
    });

    // 8. Return success
    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send email', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
\`\`\`

### Step 2: Deploy the Edge Function

\`\`\`bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-notification --no-verify-jwt

# Set environment variables
supabase secrets set EMAIL_PROVIDER_API_KEY=your_key
supabase secrets set EMAIL_FROM=noreply@denunciapopular.com
\`\`\`

### Step 3: Update Client Code

\`\`\`typescript
// Before: Direct EmailJS call
import emailjs from '@emailjs/browser';

emailjs.send(serviceId, templateId, params, publicKey);

// After: Call Edge Function
const response = await fetch(
  \`\${supabaseUrl}/functions/v1/send-notification\`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${supabaseAnonKey}\`,
    },
    body: JSON.stringify({
      to: userEmail,
      reportFolio: folio,
      pdfUrl: pdfUrl,
      description: description,
    }),
  }
);

const result = await response.json();
\`\`\`

---

## Conclusion

By moving email sending to a Supabase Edge Function, we:
- **Secure** sensitive API keys
- **Validate** inputs server-side
- **Control** costs with rate limiting
- **Audit** all email activity
- **Maintain** flexibility to change providers

This architecture follows security best practices and scales better for production use.
