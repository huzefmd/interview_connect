# Khoranex — Campus Placement Platform Marketing Site

A single-page, fully responsive marketing site for Khoranex, using the uploaded "X" mark as the brand logo and driving the palette from it.

## Brand

- Logo: the uploaded blue-to-green "X" mark, used in the navbar, footer, and as the site favicon.
- Palette derived from the logo: deep royal blue (primary), emerald/teal green (accent), soft blue-tinted white backgrounds, slate text. Gradients from blue to green for CTA buttons and headline accents.
- Typography: modern geometric sans, large confident headlines, generous whitespace, rounded cards, soft shadows. Corporate and trustworthy, not playful.

## Page structure (top to bottom)

1. **Navbar** — Khoranex mark + wordmark left; Universities, Employers, Students, Blog center; Contact Sales link, Login button, Sign Up primary CTA right. Collapses to a mobile drawer menu.
2. **Hero** — "Where Talent Meets Opportunity" with the subheadline about students, employers, and colleges; "Get Started" primary CTA; an abstract illustration area built from the logo's geometry and gradients (no stock photography).
3. **Stat counters** — 27,00,000+ Students / 600+ Colleges / 12,800+ Employers, animating up when scrolled into view.
4. **Three pillars** — Employers, Universities, Students cards with their descriptions, feature bullets, and individual CTAs.
5. **Trusted by leading institutions** — logo strip with placeholder institution marks, auto-scrolling marquee on desktop, grid on mobile.
6. **Testimonials** — "Why colleges love Khoranex", 5 cards in a swipeable carousel with quote, headshot placeholder, name, title, institution.
7. **In the news** — row of placeholder press logos, muted/greyscale treatment.
8. **Footer** — logo + tagline, five link columns (Universities, Employers, Students, Resources, Contact Sales with phone/email/address), social icons, bottom bar with copyright and Privacy/Terms links.

## Interaction

- Scroll-triggered fade/rise animations on each section entry.
- Hover lift on pillar and testimonial cards, gradient shift on primary buttons.
- Counters animate once on first view.

## Technical notes

- Single route at `/` (replaces the placeholder index), composed from reusable components: `StatCounter`, `PillarCard`, `TestimonialCard`, `LogoStrip`, `Navbar`, `Footer`, plus a `useInView`-style reveal wrapper.
- All colors added as semantic tokens in `src/styles.css` (oklch) — no hardcoded color utilities in components.
- Logo uploaded as a CDN asset and referenced from the pointer; a square copy placed in `public/` for the favicon.
- Placeholder institution/press logos rendered as styled inline SVG/text marks rather than fake real-company logos.
- Page-level SEO head with Khoranex-specific title, description, and OG/Twitter tags.
- Nav links scroll to their sections on this page; secondary pages are not built in this pass.
