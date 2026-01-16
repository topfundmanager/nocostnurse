# No Cost Nurse - Website

A modern, trustworthy, one-page website for nocostnurse.com - connecting families with skilled nurses and CNAs approved by Medicaid in Georgia.

## Project Structure

```
nocostnurse/
├── index.html      # Main HTML file with all sections
├── styles.css      # Complete CSS design system
├── script.js       # Interactive features (form, FAQ, etc.)
└── README.md       # This file
```

## Features

- **Sticky Header** with smooth scroll navigation
- **Hero Section** with trust indicators
- **Quick Eligibility Snapshot** cards
- **Multi-Step Questionnaire Form** with validation
- **How It Works Timeline** with payout information
- **FAQ Accordion** section
- **Footer** with contact info and CTA

## Design System

### Colors
- **Primary**: Sky blue (#0ea5e9) - trust, healthcare
- **Teal Accent**: (#14b8a6) - calm, supportive
- **Neutrals**: Gray scale for text and backgrounds
- **Success**: Green (#10b981)
- **Error**: Red (#ef4444)

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 400, 500, 600, 700

### Components
- Rounded cards with gentle shadows
- Gradient buttons with hover effects
- Radio/Checkbox cards for form inputs
- Soft gradient backgrounds

## Running Locally

Simply open `index.html` in a web browser. No build step required.

For local development with live reload:
```bash
npx serve .
# or
python -m http.server 8000
```

## Image Generation Prompts

The site includes placeholder areas for photorealistic images. Use these prompts with an AI image generator:

### 1. Hero Image
**Prompt:**
> A compassionate in-home nurse speaking with a parent/guardian in a bright living room setting. A child's wheelchair is present but not the focal point. The mood is positive and calm with natural light streaming through windows. Modern home interior with warm tones. Diverse representation (nurse and family can be any ethnicity). Photorealistic, professional healthcare photography style. Warm, soft lighting. No visible medical records or emergency equipment. Respectful and dignified portrayal.

**Specifications:**
- Aspect ratio: 4:3 or 16:10
- Style: Photorealistic
- Lighting: Natural, soft, warm
- Colors: Soft blues, warm neutrals

### 2. How It Works / Sidebar Image
**Prompt:**
> A nurse and a family (parent and child) reviewing a simple tablet together in a comfortable home environment. They are seated at a kitchen table or living room couch. Natural lighting, modern interior. No logos or brand names visible on any devices. Warm, welcoming atmosphere. Diverse representation. The tablet screen shows a generic form interface (no real text readable). Photorealistic, natural candid moment.

**Specifications:**
- Aspect ratio: 3:4 or 1:1
- Style: Photorealistic
- Lighting: Warm indoor lighting

### 3. Trust/Medicaid Visual
**Prompt:**
> Close-up of hands holding a simple clipboard or form in a professional healthcare setting. Soft focus background showing a clean, modern environment. Minimal generic text visible on the form (not readable). No real brand names or specific medical information. Could include a nurse badge with no organization name visible. Soft blue or teal color accents. Professional, trustworthy feeling. Clean, minimal composition.

**Specifications:**
- Aspect ratio: 16:9 or 3:2
- Style: Photorealistic, professional
- Focus: Shallow depth of field on hands/clipboard

### 4. Optional Detail Image
**Prompt:**
> A stethoscope resting on a clean white or soft blue surface. Minimalist composition with soft shadows. Medical equipment photographed in an artistic, calming way. Soft gradient background in light blue or teal tones. No other equipment visible. High-end product photography style but warm and approachable rather than clinical.

**Specifications:**
- Aspect ratio: 16:9
- Style: Clean product photography
- Background: Soft gradient (white to light blue)

## Image Placement

After generating images, replace the `.image-placeholder` divs:

```html
<!-- Replace this -->
<div class="image-placeholder hero-image" role="img" aria-label="...">
    <div class="image-placeholder__content">...</div>
</div>

<!-- With this -->
<img
    src="images/hero-image.jpg"
    alt="A compassionate in-home nurse speaking with a family"
    class="hero-image"
    loading="lazy"
    width="600"
    height="450"
>
```

Add these CSS rules for actual images:

```css
.hero-image img {
    width: 100%;
    height: auto;
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-xl);
}

.sidebar-image img {
    width: 100%;
    height: auto;
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
}
```

## Form Submission

The form currently simulates submission with a client-side timeout. To connect to a real backend:

1. **Replace the submit handler** in `script.js`:

```javascript
function submitForm() {
    const formData = new FormData(form);

    fetch('/api/submit', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        form.style.display = 'none';
        formSuccess.style.display = 'block';
    })
    .catch(error => {
        alert('Something went wrong. Please try again.');
    });
}
```

2. **Or use a form service** like Formspree, Netlify Forms, or similar.

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus visible states
- Reduced motion support (`prefers-reduced-motion`)
- Sufficient color contrast (WCAG AA)
- Form validation with error messages

## SEO

- Semantic HTML5 structure
- Meta title and description optimized
- Open Graph tags included
- Mobile-friendly responsive design
- Clean URL anchors for sections

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome for Android)

## Production Checklist

- [ ] Replace image placeholders with generated images
- [ ] Optimize images (WebP format, proper sizing)
- [ ] Connect form to backend or form service
- [ ] Update contact email and phone
- [ ] Add analytics tracking
- [ ] Add privacy policy page
- [ ] Test on multiple devices
- [ ] Run Lighthouse audit
- [ ] Minify CSS and JS for production

## License

Proprietary - No Cost Nurse
