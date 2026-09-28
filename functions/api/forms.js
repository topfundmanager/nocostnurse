import { forwardSubmissionToTopFundManager } from './_topfundmanager-import.js';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeFields(input) {
  const fields = {};
  Object.entries(input || {}).forEach(([key, value]) => {
    if (key.endsWith('[]')) {
      const normalizedKey = key.slice(0, -2);
      if (!fields[normalizedKey]) {
        fields[normalizedKey] = [];
      }
      fields[normalizedKey] = fields[normalizedKey].concat(value);
      return;
    }

    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      if (!Array.isArray(fields[key])) {
        fields[key] = [fields[key]];
      }
      fields[key] = fields[key].concat(value);
      return;
    }

    fields[key] = value;
  });

  return fields;
}

function findReplyTo(fields) {
  const keys = Object.keys(fields);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (key.toLowerCase().includes('email') && fields[key]) {
      return fields[key];
    }
  }
  return null;
}

function hasValue(value) {
  if (Array.isArray(value)) {
    return value.some((entry) => hasValue(entry));
  }
  if (value === null || typeof value === 'undefined') {
    return false;
  }
  return String(value).trim().length > 0;
}

function getTriggeredHoneypotField(fields) {
  const honeypotFields = ['website', 'company', 'fax', 'url', 'homepage'];
  for (let i = 0; i < honeypotFields.length; i += 1) {
    const key = honeypotFields[i];
    if (hasValue(fields[key])) {
      return key;
    }
  }
  return null;
}

function parseEpochMs(value) {
  if (Array.isArray(value)) {
    return parseEpochMs(value[0]);
  }
  if (value === null || typeof value === 'undefined' || value === '') {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed;
}

function fieldsToHtml(fields, page, formId) {
  const rows = Object.keys(fields)
    .sort()
    .map((key) => {
      const rawValue = fields[key];
      const displayValue = Array.isArray(rawValue) ? rawValue.join(', ') : rawValue;
      return `<tr><td style="padding:8px 12px; border:1px solid #e5e7eb;"><strong>${escapeHtml(key)}</strong></td><td style="padding:8px 12px; border:1px solid #e5e7eb;">${escapeHtml(displayValue || '')}</td></tr>`;
    })
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; color:#111827;">
      <p><strong>Form:</strong> ${escapeHtml(formId)}</p>
      <p><strong>Page:</strong> ${escapeHtml(page || 'unknown')}</p>
      <table style="border-collapse: collapse; width:100%; border:1px solid #e5e7eb;">
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function findContactName(fields) {
  if (fields.name) return String(fields.name).trim();
  const first = fields.first_name || fields.firstName || '';
  const last = fields.last_name || fields.lastName || '';
  const combined = `${first} ${last}`.trim();
  if (combined) return combined;

  // The intake form has no contact name field; the parent or guardian is the contact.
  const parent = [fields.mother_name, fields.father_name]
    .map((value) => String(value || '').trim())
    .find(Boolean);
  if (parent) return parent;

  const child = `${fields.child_first_name || ''} ${fields.child_last_name || ''}`.trim();
  return child || null;
}

function findContactPhone(fields) {
  const keys = Object.keys(fields);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (key.toLowerCase().includes('phone') && fields[key]) {
      return String(fields[key]).trim();
    }
  }
  return null;
}

export async function onRequestPost({ request, env }) {
  const contentType = request.headers.get('content-type') || '';
  let payload = {};

  console.log('[forms.js] Received form submission request');
  console.log('[forms.js] Content-Type:', contentType);

  if (contentType.includes('application/json')) {
    payload = await request.json();
  } else if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    const formData = await request.formData();
    const rawFields = {};
    formData.forEach((value, key) => {
      if (Object.prototype.hasOwnProperty.call(rawFields, key)) {
        if (!Array.isArray(rawFields[key])) {
          rawFields[key] = [rawFields[key]];
        }
        rawFields[key].push(value);
      } else {
        rawFields[key] = value;
      }
    });
    payload = { fields: rawFields };
  } else {
    console.error('[forms.js] Unsupported content type:', contentType);
    return new Response(JSON.stringify({ error: 'Unsupported form submission.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const fields = normalizeFields(payload.fields || payload);
  const formId = payload.formId || fields.form_id || 'unknown';
  const page = payload.page || request.headers.get('referer') || '';

  // Honeypot bot detection - if any hidden trap field has a value, it's likely a bot.
  const triggeredHoneypot = getTriggeredHoneypotField(fields);
  if (triggeredHoneypot) {
    console.log('[forms.js] Bot detected via honeypot field:', triggeredHoneypot);
    // Return fake success to not tip off the bot
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Time-to-fill bot detection - instant submissions are typically automated.
  const minFillMs = Number(env.FORM_MIN_FILL_MS || 2500);
  const startedAt = parseEpochMs(fields.form_started_at);
  if (startedAt !== null) {
    const elapsedMs = Date.now() - startedAt;
    if (elapsedMs < minFillMs || elapsedMs < 0) {
      console.log('[forms.js] Bot detected via fill-time check:', elapsedMs, 'ms');
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Remove anti-bot fields from submission data so they do not appear in emails.
  delete fields.website;
  delete fields.company;
  delete fields.fax;
  delete fields.url;
  delete fields.homepage;
  delete fields.form_started_at;

  console.log('[forms.js] Processing form:', formId);
  console.log('[forms.js] From page:', page);
  console.log('[forms.js] Fields received:', Object.keys(fields).join(', '));

  // Save the request in TopFundManager before reporting success to the visitor.
  const formLabels = {
    contact: 'Contact Form',
    intake: 'Intake Form'
  };
  try {
    await forwardSubmissionToTopFundManager(env, request, {
      formId: formId,
      formName: formLabels[formId] || 'Website Form',
      contactName: findContactName(fields),
      contactEmail: findReplyTo(fields),
      contactPhone: findContactPhone(fields),
      submission: fields,
    });
  } catch (importError) {
    console.error('[forms.js] TopFundManager import error:', importError);
    return new Response(JSON.stringify({ error: 'Unable to save the request. Please try again or call us.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const resendApiKey = env.RESEND_API_KEY;
  const from = env.RESEND_FROM || 'No Cost Nurse <noreply@updates.nocostnurse.com>';
  const toList = (env.RESEND_TO || 'crafted@marloweemrys.com')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  // Log configuration status (without exposing sensitive values)
  console.log('[forms.js] Config check - RESEND_API_KEY set:', !!resendApiKey);
  console.log('[forms.js] Config check - RESEND_API_KEY length:', resendApiKey ? resendApiKey.length : 0);
  console.log('[forms.js] Config check - RESEND_FROM:', from || '(not set)');
  console.log('[forms.js] Config check - RESEND_TO count:', toList.length);
  console.log('[forms.js] Config check - RESEND_TO list:', toList.join(', ') || '(empty)');

  if (!resendApiKey || !from || toList.length === 0) {
    console.error('[forms.js] Email service not configured properly');
    console.error('[forms.js] Missing: ', [
      !resendApiKey && 'RESEND_API_KEY',
      !from && 'RESEND_FROM',
      toList.length === 0 && 'RESEND_TO'
    ].filter(Boolean).join(', '));
    return new Response(JSON.stringify({ ok: true, notification: 'unavailable' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const subjectLabel = formLabels[formId] || 'Website Form';
  const subject = `No Cost Nurse ${subjectLabel} Submission`;
  const replyTo = findReplyTo(fields);
  const html = fieldsToHtml(fields, page, formId);

  console.log('[forms.js] Sending email via Resend...');
  console.log('[forms.js] Email details - Subject:', subject);
  console.log('[forms.js] Email details - From:', from);
  console.log('[forms.js] Email details - To:', toList.join(', '));
  console.log('[forms.js] Email details - Reply-To:', replyTo || '(none)');

  const resendPayload = {
    from,
    to: toList,
    subject,
    html,
    reply_to: replyTo || undefined
  };

  let resendResponse;
  try {
    resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resendPayload)
    });
  } catch (fetchError) {
    console.error('[forms.js] Fetch to Resend API failed:', fetchError.message);
    return new Response(JSON.stringify({
      ok: true,
      notification: 'unavailable'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  console.log('[forms.js] Resend API response status:', resendResponse.status);
  console.log('[forms.js] Resend API response ok:', resendResponse.ok);

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text();
    console.error('[forms.js] Resend API error response:', errorText);
    console.error('[forms.js] Resend API status code:', resendResponse.status);

    // Parse error for more details if possible
    try {
      const errorJson = JSON.parse(errorText);
      console.error('[forms.js] Resend error parsed:', JSON.stringify(errorJson, null, 2));
    } catch (e) {
      console.error('[forms.js] Could not parse error as JSON');
    }

    return new Response(JSON.stringify({
      ok: true,
      notification: 'unavailable'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const successData = await resendResponse.json();
  console.log('[forms.js] Email sent successfully! Resend ID:', successData.id);

  return new Response(JSON.stringify({ ok: true, emailId: successData.id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
