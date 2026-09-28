# No Cost Nurse

This Cloudflare Pages site mirrors the static JC Caring site: the same English and Spanish pages, layout, images, navigation, intake and contact forms, and Cloudflare Pages Functions. The No Cost Nurse logo, blue and green palette, domain metadata, Analytics ID, and TopFundManager site identity have been applied.

The previous one-page No Cost Nurse site is preserved on the local Git branch `archive/nocostnurse-pre-redesign` and in the ignored local archive `.archives/nocostnurse-pre-redesign-2026-09-28.zip`.

## Pages

English pages live at the site root; matching Spanish pages live in `/es/`. Both languages include Home, About, How It Works, Services, Careers, Contact, Get Started, Privacy, Terms, Health Information, and Accessibility. `sitemap.xml` lists all 22 pages.

## Forms and dashboard

`/api/forms` is a Cloudflare Pages Function. It accepts the contact and intake forms, screens obvious bots, forwards submissions to TopFundManager as `siteId: nocostnurse`, and sends an email through Resend. TopFundManager stores the submissions in Supabase for its forms dashboard.

Cloudflare Pages environment variables:

- `TOPFUNDMANAGER_FORMS_API_KEY` — must match TopFundManager's `FORMS_IMPORT_API_KEY`.
- `TOPFUNDMANAGER_FORMS_API_URL` — optional; defaults to `https://topfundmanager.com/api/forms/import`.
- `RESEND_API_KEY` — required for notification email.
- `RESEND_FROM` — optional; defaults to the existing No Cost Nurse sender.
- `RESEND_TO` — optional; defaults to the existing No Cost Nurse recipient.
- `FORM_MIN_FILL_MS` — optional anti-bot threshold, default 2500 ms.

Do not put secrets in the repository. The `.env` file is ignored by Git.

## Development

The pages are static HTML/CSS/JS. They need no build step. Cloudflare Pages serves the files and runs the function in `functions/api/forms.js`.
