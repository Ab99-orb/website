# Orbital Hydrocarbon website

A responsive static website built with semantic HTML, CSS and modular JavaScript.

## Run locally
Because the hero scene uses JavaScript modules and an import map, serve the folder over HTTP rather than opening `index.html` as a `file://` URL.

```bash
python -m http.server 8080
```
Then open http://localhost:8080.

## Structure
- `index.html` — page structure, metadata and content
- `styles.css` — design tokens, responsive layout, components and motion
- `app.js` — navigation, reveal effects, indicator tabs, contact form and Three.js hero
- `assets/favicon.svg` — vector favicon
- `assets/orbital-logo-header.png` — compact header lockup created from the supplied official Orbital Hydrocarbon logo

## Production notes
1. The Three.js module is loaded from jsDelivr. For a fully self-hosted deployment, install/pin Three.js and bundle it with your build pipeline.
2. Google Fonts are remote. Self-host licensed WOFF2 files if required by your privacy/performance policy.
3. The contact form opens the visitor's default email client. Connect a secure form endpoint or CRM before production launch if server-side lead capture is required.
4. Replace illustrative graphics with licensed, approved satellite imagery and case-study material.
5. Review all scientific, legal, confidentiality and performance claims before publication.
6. Configure CSP, security headers, HTTPS, analytics consent and server-side spam protection at deployment.
7. Test on target browsers and devices, including keyboard-only navigation and reduced-motion mode.

## Technical features
- Semantic landmarks and skip link
- Keyboard-operable navigation and signal tabs
- Visible focus states and reduced-motion support
- Responsive layouts for mobile, tablet and desktop
- Lazy-on-scroll reveal effects using IntersectionObserver
- Procedural Three.js geological scene with a graceful CSS fallback
- Device pixel ratio cap and low-power WebGL preference
- Validated enquiry form with mailto handoff
