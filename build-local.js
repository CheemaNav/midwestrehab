const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SOURCE = path.join(ROOT, 'index.source.html');
const OUTPUT = path.join(ROOT, process.argv[2] || 'index.local.html');
const LOGO_FILE = 'https://storage.googleapis.com/production-ipage-v1-0-5/835/236835/9qvDFWYV/386546c1b1fa4854807c7467d0e390e4';
const LOGO_IS_REMOTE = /^https?:\/\//.test(LOGO_FILE);
// Official logo from http://midwestrehab7llc.com/ (header image asset)
const LOGO_SOURCE_URL = LOGO_FILE;
const HERO_VIDEO_PATH = path.join(ROOT, 'hero-bg.mp4');
const HERO_POSTER_PATH = path.join(ROOT, 'hero-bg.jpg');
const HERO_VIDEO_FILE = 'hero-bg.mp4';
const HERO_POSTER_FILE = 'hero-bg.jpg';
const LOGO_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const HERO_UUID = '273cde90-5870-4b26-9be8-2b3867bb747a';
const HERO_POSTER_UUID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';

// Original site colors
const NAVY = '#0F2744';
const NAVY_DARK = '#0A1C33';
const NAVY_MID = '#1a3a5f';
const GOLD = '#C79A3B';
const GOLD_LIGHT = '#d4a94a';

// mycolor.space palette from primary #000000 (logo black)
// Generic: #000000 → #412728 → #7F4D3E → #B87C4C → #E2B659 → #F9F871
// Matching gradient: #000000 → #2A272A → #4B4A54 → #677381 → #82A0AA → #A3CFCD
const PALETTE = {
  black: '#000000',
  darkWarm: '#2A272A',      // overlays, elevated dark surfaces
  deepAccent: '#412728',    // icon boxes, deep warm accents
  textAccent: '#7F4D3E',    // labels/links on white backgrounds
  accentHover: '#F9F871',   // button/link hover — bright yellow (not brown)
  accent: '#E2B659',        // buttons, borders, icons, primary CTA
  highlight: '#F9F871',     // soft yellow — text on dark backgrounds only
};

const LOGO_BLOCK = /<div style="width: 42px; height: 42px; border-radius: 9px; background: #[0-9A-Fa-f]{6}; display: grid; place-items: center; border: 1\.5px solid #[0-9A-Fa-f]{6}">\s*<span style="font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 15px; color: #fff(?:; letter-spacing: \.5px)?">M7<\/span>\s*<\/div>/g;
const LOGO_BLOCK_COMPACT = /<div style="width: 42px; height: 42px; border-radius: 9px; background: #[0-9A-Fa-f]{6}; display: grid; place-items: center; border: 1\.5px solid #[0-9A-Fa-f]{6}"><span style="font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 15px; color: #fff">M7<\/span><\/div>/g;
const LOGO_IMG = '<img src="' + LOGO_FILE + '" alt="Midwest Rehab 7" style="width: 140px; height: auto; object-fit: contain; display: block;">';
const LOGO_IMG_HEADER = '<img src="' + LOGO_FILE + '" alt="Midwest Rehab 7" class="mr7-header-logo" style="height: 75px; width: auto; object-fit: contain; display: block;">';

function externalizeLogo(text) {
  return text.split(LOGO_UUID).join(LOGO_FILE);
}

function patchHeaderLogo(text) {
  const headerMarker = '<!-- ============ HEADER ============ -->';
  const headerIdx = text.indexOf(headerMarker);
  if (headerIdx < 0) return text;

  const patterns = [
    '<a href="#top" style="display: flex; align-items: center; gap: 12px; text-decoration: none">',
    '<a href="#top" style="display: flex; align-items: center; text-decoration: none">',
  ];
  for (const pat of patterns) {
    const aStart = text.indexOf(pat, headerIdx);
    if (aStart < 0) continue;
    const aEnd = text.indexOf('</a>', aStart) + 4;
    return text.slice(0, aStart)
      + '<a href="#top" style="display: flex; align-items: center; text-decoration: none">' + LOGO_IMG_HEADER + '</a>'
      + text.slice(aEnd);
  }
  return text;
}

function applyTheme(text) {
  let out = text;

  // Navy → black-based palette
  for (const c of [NAVY, NAVY.toLowerCase(), NAVY_DARK, NAVY_DARK.toLowerCase()]) {
    out = out.split(c).join(PALETTE.black);
  }
  out = out.split(NAVY_MID).join(PALETTE.darkWarm);
  out = out.split(NAVY_MID.toUpperCase()).join(PALETTE.darkWarm);

  // Gold text on light sections → warm brown (readable, palette-matched)
  out = out.replace(/color:\s*#C79A3B/gi, 'color: ' + PALETTE.textAccent);
  out = out.replace(/color:\s*#c79a3b/gi, 'color: ' + PALETTE.textAccent);

  // Gold backgrounds, borders, strokes → muted gold accent
  for (const c of [GOLD, GOLD.toLowerCase()]) out = out.split(c).join(PALETTE.accent);
  out = out.split(GOLD_LIGHT).join(PALETTE.accentHover);
  out = out.split(GOLD_LIGHT.toUpperCase()).join(PALETTE.accentHover);

  // Restore soft yellow for text on dark backgrounds
  out = out.replace(/(<footer[\s\S]*?)color: #7F4D3E/gi, (_, p) => p + 'color: ' + PALETTE.highlight);
  out = out.replace(/(id="top"[\s\S]{0,5000}?)color: #7F4D3E/gi, (_, p) => p + 'color: ' + PALETTE.highlight);
  out = out.replace(
    /(font-weight: 800; color: )#7F4D3E(; line-height: 1">10\+)/g,
    '$1' + PALETTE.highlight + '$2'
  );
  out = out.replace(
    /(font-weight: 800; color: )#7F4D3E(; line-height: 1">4<)/g,
    '$1' + PALETTE.highlight + '$2'
  );
  out = out.replace(
    /(font-weight: 800; color: )#7F4D3E(; line-height: 1">3<)/g,
    '$1' + PALETTE.highlight + '$2'
  );
  out = out.replace(
    /(Building Stronger Communities<br>Through <span style="color: )#7F4D3E(;">Property)/g,
    '$1' + PALETTE.highlight + '$2'
  );
  out = out.replace(
    /(mr7-hero-line2[\s\S]*?color: )#7F4D3E(;">Property)/g,
    '$1' + PALETTE.highlight + '$2'
  );

  // Hero overlay — warm dark gradient from matching palette (#2A272A)
  out = out.split('rgba(9,24,44,').join('rgba(0,0,0,');
  out = out.split('rgba(15,39,68,').join('rgba(42,39,42,');
  out = out.split('rgba(15,39,68,.45)').join('rgba(0,0,0,.55)');

  // Navy-tinted shadows → neutral warm shadows
  out = out.split('rgba(15,39,68,.12)').join('rgba(42,39,42,.12)');
  out = out.split('rgba(15,39,68,.35)').join('rgba(0,0,0,.35)');

  // Gold button glow → muted gold glow
  out = out.split('rgba(199,154,59,.35)').join('rgba(226,182,89,.35)');
  out = out.split('rgba(199,154,59,.25)').join('rgba(226,182,89,.25)');
  out = out.split('rgba(199,154,59,.14)').join('rgba(226,182,89,.14)');
  out = out.split('rgba(199,154,59,.45)').join('rgba(226,182,89,.45)');
  out = out.split('rgba(199,154,59,.4)').join('rgba(226,182,89,.4)');

  // Nav hover → accent gold
  out = out.replace(/style-hover="color: #7F4D3E"/g, 'style-hover="color: ' + PALETTE.accent + '"');

  // Brown hover fills → bright yellow (sitewide buttons/links)
  out = out.replace(/#B87C4C/gi, PALETTE.highlight);
  out = out.replace(/style-hover="([^"]*)background: #7F4D3E/gi, 'style-hover="$1background: ' + PALETTE.highlight);
  out = out.replace(/style-hover="([^"]*)border-color: #7F4D3E/gi, 'style-hover="$1border-color: ' + PALETTE.accent);

  // Service card icon backgrounds (were navy) → deep warm accent
  out = out.replace(
    /width: 54px; height: 54px; border-radius: 12px; background: #000000/g,
    'width: 54px; height: 54px; border-radius: 12px; background: ' + PALETTE.deepAccent
  );

  return out;
}

function restoreDarkSectionAccents(text) {
  const start = text.indexOf('id="areas"');
  if (start < 0) return text;
  const end = text.indexOf('</section>', start);
  if (end < 0) return text;

  let section = text.slice(start, end);
  section = section.replace(
    /(font-size: 12\.5px; letter-spacing: 2\.5px; text-transform: uppercase; color: )#7F4D3E/g,
    '$1' + PALETTE.accent
  );
  section = section.replace(
    /(font-size: 38px; font-weight: 800; color: )#7F4D3E/g,
    '$1' + PALETTE.highlight
  );

  return text.slice(0, start) + section + text.slice(end);
}

function patchStatsSection(text) {
  let out = text.replace(
    /<section id="mr7-stats" data-screen-label="Stats" style="background: #[0-9A-Fa-f]{6}; padding: 0">/,
    '<section id="mr7-stats" data-screen-label="Stats" class="mr7-stats" style="background: #000000; padding: 0">'
  );
  out = out.replace(
    /(<section id="mr7-stats"[\s\S]*?<div style="max-width: 1240px; margin: 0 auto; padding: )56px 32px/,
    '$128px 32px'
  );
  return out;
}

function patchHeaderScroll(text) {
  let out = text;

  // Header tagline must adapt when sticky header background turns white on scroll
  const headerTagline =
    '<span style="font-size: 10.5px; letter-spacing: 2.2px; text-transform: uppercase; color: #7F4D3E; font-weight: 600">Property Solutions</span>';
  const headerTaglineReactive =
    '<span style="font-size: 10.5px; letter-spacing: 2.2px; text-transform: uppercase; color: {{ headerSubtext }}; font-weight: 600; transition: color .35s">Property Solutions</span>';
  const taglineIdx = out.indexOf(headerTagline);
  if (taglineIdx >= 0) {
    out = out.slice(0, taglineIdx) + headerTaglineReactive + out.slice(taglineIdx + headerTagline.length);
  }

  const headerDiv =
    '<div style="position: fixed; top: 0; left: 0; right: 0; z-index: 100; transition: background .35s ease, box-shadow .35s ease; background: {{ headerBg }}; backdrop-filter: blur(10px)">';
  const headerDivWithClass =
    '<div class="{{ headerClass }}" style="position: fixed; top: 0; left: 0; right: 0; z-index: 100; transition: background .35s ease, box-shadow .35s ease; background: {{ headerBg }}; backdrop-filter: blur(10px)">';
  if (out.includes(headerDiv) && !out.includes('{{ headerClass }}')) {
    out = out.replace(headerDiv, headerDivWithClass);
  }

  out = out.replace(
    /headerText: scrolled \? '[^']+' : '[^']+',/,
    `headerText: scrolled ? '${PALETTE.black}' : '#ffffff',`
  );

  out = out.replace(
    /headerSubtext: scrolled \? '[^']+' : '[^']+',/,
    `headerSubtext: scrolled ? '${PALETTE.textAccent}' : '${PALETTE.accent}',`
  );

  if (!out.includes('headerClass: scrolled')) {
    out = out.replace(
      /headerText: scrolled \? '[^']+' : '[^']+',/,
      `headerText: scrolled ? '${PALETTE.black}' : '#ffffff',\n      headerClass: scrolled ? 'mr7-header is-scrolled' : 'mr7-header',`
    );
  }

  out = out.replace(
    /headerBg: scrolled \? 'rgba\(255,255,255,\.96\)' : 'rgba\([^']+\)',/,
    "headerBg: scrolled ? 'rgba(255,255,255,.96)' : 'rgba(0,0,0,0)',"
  );

  out = out.replace(
    /headerShadow: scrolled \? '0 4px 24px rgba\([^']+\)' : 'none',/,
    "headerShadow: 'none',"
  );

  return out;
}

function removeShadows(text) {
  let out = text.replace(/box-shadow:\s*[^;"]+;?\s*/gi, '');
  out = out.replace(/headerShadow: scrolled \? '[^']*' : 'none',/g, "headerShadow: 'none',");
  return out;
}

function removeHeroBadges(text) {
  return text.replace(
    /\s*<div style="display: flex; gap: 28px; flex-wrap: wrap">[\s\S]*?Since 2015<\/span><\/div>\s*<\/div>/,
    ''
  );
}

function heroMediaHtml() {
  return `<video class="mr7-hero-video" autoplay muted loop playsinline preload="auto" poster="${HERO_POSTER_UUID}" src="${HERO_UUID}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; z-index: 0">
    <source src="${HERO_UUID}" type="video/mp4">
  </video>
  <div class="mr7-hero-overlay" style="position: absolute; inset: 0; z-index: 1; background: rgba(0,0,0,.42)"></div>
  <div style="position: absolute; inset: 0; z-index: 1; background: linear-gradient(180deg, rgba(0,0,0,.1) 0%, rgba(0,0,0,.68) 100%)"></div>`;
}

function heroTitleHtml() {
  return `<h1 class="mr7-hero-title" style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(34px, 5.2vw, 58px); line-height: 1.15; font-weight: 800; color: #fff; margin: 0 0 22px; letter-spacing: -1px; max-width: 960px"><span class="mr7-hero-line1" style="display: block"><span style="color: ${PALETTE.highlight}">Property &amp; Construction</span></span><span class="mr7-hero-line2" style="display: block">Solutions Across Four States</span></h1>`;
}

function heroDescHtml() {
  return `<p class="mr7-hero-desc" style="font-size: clamp(16px, 2vw, 19px); line-height: 1.75; color: rgba(255,255,255,.88); margin: 0 0 36px; max-width: 920px; text-wrap: pretty">Preservation, construction, and real estate for homeowners, investors, and commercial clients across MI, OH, FL &amp; TX.</p>`;
}

function finalizeHeroSection(text) {
  const sectionStart = text.indexOf('<section id="top"');
  if (sectionStart < 0) return text;

  const sectionEnd = text.indexOf('</section>', sectionStart);
  if (sectionEnd < 0) return text;

  const contentMarkers = [
    '<div style="position: relative; z-index: 2; max-width: 980px',
    '<div style="position: relative; max-width: 1240px',
    '<div style="position: relative; max-width: 980px',
  ];
  let contentIdx = -1;
  for (const marker of contentMarkers) {
    const idx = text.indexOf(marker, sectionStart);
    if (idx >= 0 && idx < sectionEnd && (contentIdx < 0 || idx < contentIdx)) contentIdx = idx;
  }
  if (contentIdx < 0) return text;

  const sectionOpenEnd = text.indexOf('>', sectionStart) + 1;
  let section = text.slice(sectionOpenEnd, sectionEnd);

  section = section.replace(/[\s\S]*?(?=<div style="position: relative)/, '\n  ' + heroMediaHtml() + '\n  ');

  const h1Start = section.indexOf('<h1');
  const h1End = section.indexOf('</h1>', h1Start);
  if (h1Start >= 0 && h1End > h1Start) {
    section = section.slice(0, h1Start) + heroTitleHtml() + section.slice(h1End + 5);
  }

  const pStart = section.indexOf('<p class="mr7-hero-desc"');
  if (pStart < 0) {
    const pAlt = section.indexOf('<p style="font-size:');
    if (pAlt >= 0) {
      const pEnd = section.indexOf('</p>', pAlt);
      if (pEnd > pAlt) section = section.slice(0, pAlt) + heroDescHtml() + section.slice(pEnd + 4);
    }
  } else {
    const pEnd = section.indexOf('</p>', pStart);
    if (pEnd > pStart) section = section.slice(0, pStart) + heroDescHtml() + section.slice(pEnd + 4);
  }

  if (!section.includes('class="mr7-hero"')) {
    const patched = text.slice(sectionStart, sectionOpenEnd).replace(
      '<section id="top"',
      '<section id="top" class="mr7-hero"'
    );
    return text.slice(0, sectionStart) + patched + section + text.slice(sectionEnd);
  }

  return text.slice(0, sectionOpenEnd) + section + text.slice(sectionEnd);
}

function patchHeroBanner(text) {
  let out = text;

  out = out.replace(
    /<section id="top" data-screen-label="Hero" style="position: relative; min-height: 92vh; display: flex; align-items: center; overflow: hidden">\s*<img src="273cde90-5870-4b26-9be8-2b3867bb747a" alt="[^"]*" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover">\s*<div style="position: absolute; inset: 0; background: linear-gradient\(105deg, rgba\(9,24,44,\{\{ overlayA \}\}\) 0%, rgba\(15,39,68,\{\{ overlayB \}\}\) 55%, rgba\(15,39,68,\.45\) 100%\)"><\/div>/,
    `<section id="top" data-screen-label="Hero" class="mr7-hero" style="position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden">
  ${heroMediaHtml()}`
  );

  out = out.replace(
    /<div style="display: inline-flex; align-items: center; gap: 10px; padding: 8px 16px; border-radius: 100px; border: 1px solid rgba\(255,255,255,\.25\); background: rgba\(255,255,255,\.08\); margin-bottom: 26px">/,
    '<div style="display: inline-flex; align-items: center; gap: 10px; padding: 9px 18px; border-radius: 100px; border: 1px solid rgba(226,182,89,.4); background: rgba(0,0,0,.32); backdrop-filter: blur(10px); margin-bottom: 24px">'
  );

  out = out.replace(
    /<span style="font-size: 12\.5px; letter-spacing: 2px; text-transform: uppercase; color: rgba\(255,255,255,\.9\); font-weight: 600">Full-Service Property Solutions · Since 2015<\/span>/,
    '<span style="font-size: 13px; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,.92); font-weight: 600">Full-Service Property Solutions · Since 2015</span>'
  );

  return out;
}

function patchHeroLayout(text) {
  let out = text;

  out = out.replace(
    /<div style="position: relative; max-width: 1240px; margin: 0 auto; padding: 150px 32px 90px; width: 100%">\s*<div style="max-width: 780px; animation: mr7HeroIn \.9s cubic-bezier\(\.2,\.7,\.2,1\) both">/,
    '<div style="position: relative; z-index: 2; max-width: 980px; margin: 0 auto; padding: 140px 32px 90px; width: 100%; text-align: center; display: flex; flex-direction: column; align-items: center">\n    <div style="max-width: 960px; width: 100%; animation: mr7HeroIn .9s cubic-bezier(.2,.7,.2,1) both; display: flex; flex-direction: column; align-items: center">'
  );

  out = out.replace(
    /<h1 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 56px; line-height: 1\.12; font-weight: 800; color: #fff; margin: 0 0 24px; letter-spacing: -1\.2px; text-wrap: balance">/,
    '<h1 style="font-family: \'Plus Jakarta Sans\', sans-serif; font-size: clamp(34px, 5.2vw, 58px); line-height: 1.15; font-weight: 800; color: #fff; margin: 0 0 22px; letter-spacing: -1px; text-wrap: balance; max-width: 880px">'
  );

  out = out.replace(
    /<p style="font-size: 18px; line-height: 1\.7; color: rgba\(255,255,255,\.82\); margin: 0 0 36px; max-width: 640px; text-wrap: pretty">/,
    '<p class="mr7-hero-desc" style="font-size: clamp(16px, 2vw, 19px); line-height: 1.75; color: rgba(255,255,255,.88); margin: 0 0 36px; max-width: 920px; text-wrap: pretty">'
  );

  out = out.replace(
    /<div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 44px">/,
    '<div style="display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; margin-bottom: 0">'
  );

  out = out.replace(
    /\s*<div style="position: absolute; bottom: 28px; left: 50%; transform: translateX\(-50%\); display: flex; flex-direction: column; align-items: center; gap: 8px">[\s\S]*?<\/div>(\s*<\/section>)/,
    '$1'
  );

  out = out.replace(
    />Building Stronger Communities Through <span style="color: #C79A3B">Property Preservation, Construction &amp; Real Estate<\/span> Solutions<\/h1>/,
    heroTitleHtml()
  );

  out = out.replace(
    /<h1 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp\(34px, 5\.2vw, 58px\)[^"]*">Building Stronger Communities<br>Through <span style="color: [^"]+">Property &amp; Construction<\/span> Solutions<\/h1>/,
    heroTitleHtml()
  );

  out = out.replace(
    />Midwest Rehab 7 LLC delivers professional construction, property preservation, property management, and real estate solutions for homeowners, investors, banks, asset managers, and commercial clients across Michigan, Ohio, Florida, and Texas\.<\/p>/,
    '>Preservation, construction, and real estate for homeowners, investors, and commercial clients across MI, OH, FL &amp; TX.</p>'
  );

  return out;
}

function buttonStylesCss() {
  const P = PALETTE;
  return `
/* MR7 buttons — slide-fill hover */
.mr7-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  text-decoration: none;
  border-radius: 9px;
  overflow: hidden;
  isolation: isolate;
  cursor: pointer;
  z-index: 0;
  transition: transform 0.4s cubic-bezier(.2,.7,.2,1), border-color 0.35s ease, color 0.35s ease;
}
.mr7-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.45s cubic-bezier(.2,.7,.2,1);
}
.mr7-btn:hover {
  transform: translateY(-2px);
}
.mr7-btn:hover::before {
  transform: scaleX(1);
}
.mr7-btn-primary {
  color: ${P.black};
  background: ${P.accent};
  border: 2px solid ${P.accent};
}
.mr7-btn-primary::before {
  background: ${P.highlight};
}
.mr7-btn-primary:hover {
  color: ${P.black};
  border-color: ${P.highlight};
}
.mr7-btn-primary.mr7-btn-sm {
  border-radius: 8px;
}
.mr7-btn-outline {
  color: ${P.black};
  background: transparent;
  border: 2px solid ${P.black};
}
.mr7-btn-outline::before {
  background: ${P.black};
}
.mr7-btn-outline:hover {
  color: #ffffff;
  border-color: ${P.black};
}
.mr7-btn-ghost {
  color: #ffffff;
  background: rgba(255,255,255,.08);
  border: 1.5px solid rgba(255,255,255,.45);
}
.mr7-btn-ghost::before {
  background: #ffffff;
}
.mr7-btn-ghost:hover {
  color: ${P.black};
  border-color: #ffffff;
}
.mr7-btn-dark {
  color: #ffffff;
  background: ${P.black};
  border: 2px solid ${P.black};
}
.mr7-btn-dark::before {
  background: ${P.accent};
}
.mr7-btn-dark:hover {
  color: ${P.black};
  border-color: ${P.accent};
}
`;
}

function footerStylesCss() {
  const P = PALETTE;
  return `
/* MR7 footer — Targa-style overlapping CTA + columns */
.mr7-footer-link:hover { color: ${P.accent} !important; }
.mr7-footer-social:hover {
  background: ${P.highlight};
  border-color: ${P.highlight};
  color: ${P.black};
  transform: translateY(-2px);
}
.mr7-footer-col-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 22px;
}
@media (max-width: 960px) {
  .mr7-footer-grid { grid-template-columns: 1fr 1fr !important; }
  .mr7-footer-cta { padding: 40px 28px !important; transform: translateY(-48px) !important; }
}
@media (max-width: 560px) {
  .mr7-footer-grid { grid-template-columns: 1fr !important; }
}
`;
}

function footerLink(href, label) {
  return `<a href="${href}" class="mr7-footer-link" style="display: flex; align-items: center; gap: 10px; font-size: 14px; color: rgba(255,255,255,.65); text-decoration: none; transition: color .25s"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; opacity: .8"><path d="M20 6L9 17l-5-5"></path></svg>${label}</a>`;
}

function buildFooterBlock() {
  const P = PALETTE;
  const logo = '<img src="' + LOGO_FILE + '" alt="Midwest Rehab 7" class="mr7-footer-logo" style="height: 64px; width: auto; object-fit: contain; display: block; margin-bottom: 20px">';
  const social = (label, svg) =>
    `<a href="#top" aria-label="${label}" class="mr7-footer-social" style="width: 38px; height: 38px; border-radius: 50%; border: 1px solid rgba(255,255,255,.35); display: grid; place-items: center; color: #fff; text-decoration: none; transition: all .25s">${svg}</a>`;

  return `<!-- ============ 13 · FINAL CTA + FOOTER ============ -->
<section id="cta" class="mr7-footer-wrap" data-screen-label="Final CTA" style="position: relative; background: ${P.black}; padding: 0 32px">
  <div class="mr7-footer-cta" style="max-width: 900px; margin: 0 auto; transform: translateY(-72px); background: #ffffff; border-radius: 4px; padding: 52px 44px; text-align: center; position: relative; z-index: 2">
    <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(26px, 3.8vw, 40px); line-height: 1.22; font-weight: 800; color: ${P.black}; margin: 0 0 16px; letter-spacing: -.4px; text-wrap: balance">Secure the Right Property Solution, On the Right Terms</h2>
    <p style="font-size: 16px; line-height: 1.75; color: #64748b; margin: 0 auto 30px; max-width: 600px; text-wrap: pretty">If you need property preservation, construction, or real estate expertise, we invite you to get in touch for a confidential conversation.</p>
    <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap">
      <a href="#cta" class="mr7-btn mr7-btn-dark" style="font-size: 15px; padding: 15px 32px">Request a Quote</a>
      <a href="#cta" class="mr7-btn mr7-btn-outline" style="font-size: 15px; padding: 15px 32px">Schedule Consultation</a>
    </div>
  </div>

  <footer data-screen-label="Footer" class="mr7-footer" style="background: ${P.black}; padding: 108px 0 0; margin-top: -72px">
    <div style="max-width: 1240px; margin: 0 auto; padding: 0 32px">
      <div class="mr7-footer-grid" style="display: grid; grid-template-columns: 1.35fr 1fr 1fr 1.15fr; gap: 44px; padding: 20px 0 52px">
        <div>
          ${logo}
          <p style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 700; color: #fff; margin: 0 0 6px">Midwest Rehab 7 LLC</p>
          <p style="font-size: 13px; line-height: 1.65; color: rgba(255,255,255,.5); margin: 0 0 22px; max-width: 280px">Woman-owned · Minority-owned · Serving MI, OH, FL &amp; TX since 2015</p>
          <div style="display: flex; gap: 10px">
            ${social('Facebook', '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z"></path></svg>')}
            ${social('Instagram', '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"></rect><circle cx="12" cy="12" r="4"></circle></svg>')}
            ${social('LinkedIn', '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4V8h4v2a6 6 0 012-2z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>')}
          </div>
        </div>
        <div>
          <div class="mr7-footer-col-title">Quick Links</div>
          <div style="display: flex; flex-direction: column; gap: 12px">
            ${footerLink('#about', 'About Us')}
            ${footerLink('#services', 'Services')}
            ${footerLink('#projects', 'Featured Projects')}
            ${footerLink('#who', 'Who We Help')}
            ${footerLink('#areas', 'Service Areas')}
          </div>
        </div>
        <div>
          <div class="mr7-footer-col-title">Useful Links</div>
          <div style="display: flex; flex-direction: column; gap: 12px">
            ${footerLink('#cta', 'Request a Quote')}
            ${footerLink('#top', 'Contact')}
            ${footerLink('#top', 'Privacy Policy')}
            ${footerLink('#top', 'Terms of Service')}
          </div>
        </div>
        <div>
          <div class="mr7-footer-col-title">Contact Us</div>
          <div style="display: flex; flex-direction: column; gap: 16px">
            <div style="display: flex; gap: 12px; align-items: flex-start"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${P.accent}" stroke-width="2" stroke-linecap="round" style="flex-shrink: 0; margin-top: 2px"><path d="M22 16.9v3a2 2 0 01-2.2 2A19.8 19.8 0 012 4.2 2 2 0 014 2h3a2 2 0 012 1.7c.13.96.36 1.9.7 2.8a2 2 0 01-.45 2.1L8.1 9.9a16 16 0 006 6l1.3-1.15a2 2 0 012.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0122 16.9z"></path></svg><span style="font-size: 14px; color: rgba(255,255,255,.65)">(313) 555-0107</span></div>
            <div style="display: flex; gap: 12px; align-items: center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${P.accent}" stroke-width="2" stroke-linecap="round" style="flex-shrink: 0"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M22 6l-10 7L2 6"></path></svg><span style="font-size: 14px; color: rgba(255,255,255,.65)">info@midwestrehab7.com</span></div>
            <div style="display: flex; gap: 12px; align-items: flex-start"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${P.accent}" stroke-width="2" stroke-linecap="round" style="flex-shrink: 0; margin-top: 2px"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z"></path><circle cx="12" cy="10" r="3"></circle></svg><span style="font-size: 14px; line-height: 1.6; color: rgba(255,255,255,.65)">Detroit, Michigan<br>Serving MI · OH · FL · TX</span></div>
          </div>
        </div>
      </div>
      <div style="border-top: 1px solid rgba(255,255,255,.12); padding: 22px 0 28px; text-align: center">
        <span style="font-size: 13px; color: rgba(255,255,255,.42)">© 2026 Midwest Rehab 7 LLC. All Rights Reserved</span>
      </div>
    </div>
  </footer>
</section>`;
}

function patchFooterUI(text) {
  const startMarker = '<!-- ============ 13 · FINAL CTA ============ -->';
  const endMarker = '</footer>';
  const start = text.indexOf(startMarker);
  const end = text.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error('Footer block not found');
  return text.slice(0, start) + buildFooterBlock() + text.slice(end + endMarker.length);
}

const SERVICE_IMAGES = {
  preservation: 'd4318704-89f8-4309-979d-a52c729e8e6f',
  construction: '56c00505-22ae-4072-8e10-13d3b1d35b52',
  management: 'aa1a4681-ea25-4541-8427-3aadba11ca6b',
  realEstate: 'c3464172-103b-4f13-8f0f-98055a47b37c',
  insurance: '9c86e8ff-d20e-4a33-a837-1faa483afa1b',
  investor: 'ad3efb72-ff34-49fd-a59b-e100541f0b9c',
  whyFeatured: 'c075026d-bfa1-4dc8-8ef8-f25b47e6d763',
};

const SERVICES_BG_FILE = 'hero-bg.jpg';

const TAB_CATEGORY = {
  preservation: 'PRESERVATION',
  construction: 'CONSTRUCTION',
  management: 'MANAGEMENT',
  'real-estate': 'REAL ESTATE',
  insurance: 'INSURANCE',
  investor: 'INVESTMENT',
};

function getCardImages(slug) {
  const slugMap = {
    preservation: SERVICE_IMAGES.preservation,
    construction: SERVICE_IMAGES.construction,
    management: SERVICE_IMAGES.management,
    'real-estate': SERVICE_IMAGES.realEstate,
    insurance: SERVICE_IMAGES.insurance,
    investor: SERVICE_IMAGES.investor,
  };
  const primary = slugMap[slug] || SERVICE_IMAGES.preservation;
  const pool = [
    SERVICE_IMAGES.preservation,
    SERVICE_IMAGES.construction,
    SERVICE_IMAGES.management,
    SERVICE_IMAGES.realEstate,
    SERVICE_IMAGES.insurance,
    SERVICE_IMAGES.investor,
    SERVICE_IMAGES.whyFeatured,
  ].filter((img) => img !== primary);
  return [primary, pool[0], pool[1], pool[2]];
}

const SERVICE_TABS = [
  {
    slug: 'preservation',
    label: 'Property Preservation',
    items: [
      { title: 'Winterization', body: 'Seasonal plumbing, HVAC, and exterior prep to protect vacant properties through harsh Midwest winters.' },
      { title: 'Securing & Board-Ups', body: 'Lock changes, window/door board-ups, and full perimeter securing per investor guidelines.' },
      { title: 'Maintenance & Upkeep', body: 'Lawn care, snow removal, debris hauling, and routine property inspections on schedule.' },
      { title: 'Compliance Reporting', body: 'Timestamped photo documentation and timely conveyance reporting for every work order.' },
    ],
  },
  {
    slug: 'construction',
    label: 'Construction',
    items: [
      { title: 'Renovation & Rehab', body: 'Full interior and exterior renovations to bring distressed properties to market-ready condition.' },
      { title: 'Structural Repairs', body: 'Foundation, roofing, siding, and structural corrections handled by licensed field crews.' },
      { title: 'Code Compliance', body: 'Permit coordination, municipal inspections, and code-violation remediation from start to finish.' },
      { title: 'Turnkey Cap Ex', body: 'Capital expenditure projects scoped, bid, and executed with transparent cost tracking.' },
    ],
  },
  {
    slug: 'management',
    label: 'Property Management',
    items: [
      { title: 'Tenant Placement', body: 'Marketing, screening, lease execution, and move-in coordination for residential units.' },
      { title: 'Rent Collection', body: 'Automated rent processing, late-fee enforcement, and owner disbursement reporting.' },
      { title: 'Maintenance Dispatch', body: '24/7 work-order intake with vetted vendor dispatch and completion verification.' },
      { title: 'Owner Reporting', body: 'Monthly financial statements, occupancy updates, and property performance dashboards.' },
    ],
  },
  {
    slug: 'real-estate',
    label: 'Real Estate',
    items: [
      { title: 'Brokerage Services', body: 'Licensed agents for acquisitions, dispositions, and portfolio strategy across four states.' },
      { title: 'Market Analysis', body: 'Comparative market analysis, BPO support, and pricing guidance for REO assets.' },
      { title: 'Closing Coordination', body: 'Title, escrow, and closing management from contract through recorded deed transfer.' },
      { title: 'Investment Advisory', body: 'Deal sourcing, ROI modeling, and portfolio growth planning for investors and funds.' },
    ],
  },
  {
    slug: 'insurance',
    label: 'Insurance Claims',
    items: [
      { title: 'Damage Assessment', body: 'On-site inspection and detailed scope documentation for fire, water, and storm claims.' },
      { title: 'Claim Mitigation', body: 'Emergency board-up, water extraction, and mold prevention to limit further loss.' },
      { title: 'Restoration Work', body: 'Full rebuild and restoration coordinated directly with adjusters and carriers.' },
      { title: 'Supplement Support', body: 'Supplement filing, photo evidence packages, and adjuster communication on your behalf.' },
    ],
  },
  {
    slug: 'investor',
    label: 'Investor Services',
    items: [
      { title: 'Portfolio Oversight', body: 'End-to-end asset management from pre-foreclosure through conveyance and sale.' },
      { title: 'Due Diligence', body: 'Property condition reports, title review support, and acquisition risk assessment.' },
      { title: 'Vendor Network', body: '125+ vetted vendors across MI, OH, FL, and TX for every field service need.' },
      { title: 'Custom Reporting', body: 'Tailored dashboards and investor-grade reporting aligned to your specific guidelines.' },
    ],
  },
];

function serviceImageDetailCard(category, title, imageUuid) {
  const P = PALETTE;
  return `<a href="#cta" class="mr7-service-card mr7-service-detail" style="position: relative; display: block; border-radius: 14px; overflow: hidden; min-height: 300px; text-decoration: none">
    <img src="${imageUuid}" alt="${title}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover">
    <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.88) 0%, rgba(0,0,0,.35) 45%, transparent 100%)"></div>
    <div style="position: absolute; left: 0; right: 0; bottom: 0; padding: 24px 22px; z-index: 1">
      <div style="font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: ${P.accent}; font-weight: 700; margin-bottom: 8px">${category}</div>
      <h3 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(16px, 1.6vw, 20px); font-weight: 800; color: #fff; margin: 0; letter-spacing: -.3px; line-height: 1.25">${title}</h3>
    </div>
  </a>`;
}

function buildServicePanel(slug, items, hidden) {
  const images = getCardImages(slug);
  const tabCat = TAB_CATEGORY[slug] || 'SERVICES';
  const cards = items
    .map((item, i) => serviceImageDetailCard(tabCat, item.title, images[i]))
    .join('\n        ');
  return `<div class="mr7-service-panel${hidden ? ' is-hidden' : ''}" data-service="${slug}" role="tabpanel">
      <div class="mr7-service-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px">
        ${cards}
      </div>
    </div>`;
}

function whyCard(title, body, iconSvg, dark) {
  const P = PALETTE;
  const bg = dark ? P.black : '#ffffff';
  const titleColor = dark ? '#ffffff' : P.black;
  const bodyColor = dark ? 'rgba(255,255,255,.78)' : '#64748b';
  const iconColor = dark ? '#ffffff' : P.black;
  return `<div class="mr7-why-card" style="background: ${bg}; border-radius: 12px; padding: 36px 32px; min-height: 320px; display: flex; flex-direction: column; justify-content: flex-end; position: relative">
    <div style="position: absolute; top: 28px; right: 28px; color: ${iconColor}">${iconSvg}</div>
    <h3 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22px; font-weight: 800; color: ${titleColor}; margin: 0 0 14px; line-height: 1.25; max-width: 92%">${title}</h3>
    <p style="font-size: 14.5px; line-height: 1.75; color: ${bodyColor}; margin: 0">${body}</p>
  </div>`;
}

function serviceTab(slug, label, active) {
  return `<button type="button" role="tab" class="mr7-service-tab${active ? ' is-active' : ''}" data-service="${slug}" aria-selected="${active ? 'true' : 'false'}">${label}</button>`;
}

function buildServicesSection() {
  const P = PALETTE;

  const tabs = SERVICE_TABS
    .map((tab, i) => serviceTab(tab.slug, tab.label, i === 0))
    .join('\n      ');

  const panels = SERVICE_TABS
    .map((tab, i) => buildServicePanel(tab.slug, tab.items, i > 0))
    .join('\n    ');

  return `<!-- ============ 4 · SERVICES ============ -->
<section id="services" data-screen-label="Services" class="mr7-services" style="position: relative; overflow: hidden; padding: 110px 32px 120px">
  <div class="mr7-services-bg" aria-hidden="true"></div>
  <div class="mr7-services-overlay" aria-hidden="true"></div>
  <div class="mr7-services-inner" style="max-width: 1240px; margin: 0 auto; position: relative; z-index: 1">
    <div style="text-align: center; max-width: 720px; margin: 0 auto 40px">
      <div style="font-size: 12.5px; letter-spacing: 2.5px; text-transform: uppercase; color: ${P.textAccent}; font-weight: 700; margin-bottom: 14px">Our Services</div>
      <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(30px, 4vw, 40px); line-height: 1.18; font-weight: 800; color: ${P.black}; margin: 0 0 16px; letter-spacing: -.8px; text-wrap: balance">Complete Property Solutions Under One Roof</h2>
      <p style="font-size: 16px; line-height: 1.75; color: #64748b; margin: 0">Six specialized divisions working together — so you never need to coordinate multiple vendors again.</p>
    </div>
    <div class="mr7-service-tabs" role="tablist" aria-label="Service divisions">
      ${tabs}
    </div>
    <div class="mr7-service-panels">
    ${panels}
    </div>
  </div>
</section>

`;
}

function buildWhyChooseSection() {
  const P = PALETTE;
  const iconTrack = '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 17l6-6 4 4 8-9"></path><path d="M16 6h5v5"></path></svg>';
  const iconTarget = '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="4"></circle><path d="M12 3v2M12 19v2M3 12h2M19 12h2"></path></svg>';
  const iconShield = '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3l8 3.5v5c0 4.8-3.2 8-8 9.5-4.8-1.5-8-4.7-8-9.5v-5L12 3z"></path><path d="M9 12l2 2 4-4"></path></svg>';

  return `<!-- ============ 5 · WHY CHOOSE US ============ -->
<section data-screen-label="Why Choose Us" class="mr7-why-section" style="background: #F4F8FB; padding: 110px 32px 120px">
  <div style="max-width: 1240px; margin: 0 auto">
    <div style="text-align: center; max-width: 760px; margin: 0 auto 52px">
      <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(30px, 4vw, 40px); line-height: 1.18; font-weight: 800; color: ${P.black}; margin: 0 0 16px; letter-spacing: -.8px">Why Clients Choose Midwest Rehab 7</h2>
      <p style="font-size: 16px; line-height: 1.75; color: #64748b; margin: 0">From national servicers to first-time homeowners, our clients stay with us because we combine institutional-grade reliability with the responsiveness of a dedicated local partner.</p>
    </div>
    <div class="mr7-why-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px">
      ${whyCard('Proven Track Record', 'With over a decade serving four states since 2015, we bring institutional-grade reliability and deep local expertise to every property project.', iconTrack, false)}
      ${whyCard('Client First Service', 'Experience responsive, dedicated support at every step. We handle the heavy lifting while you stay in control of your property goals.', iconTarget, true)}
      ${whyCard('Communication &amp; Project Excellence', 'Clear communication, smart strategy, and quality workmanship at every turn — nothing is left to chance on your project.', iconShield, false)}
      <div class="mr7-why-card mr7-why-image" style="border-radius: 12px; overflow: hidden; min-height: 320px; position: relative">
        <img src="${SERVICE_IMAGES.whyFeatured}" alt="Renovated residential property" style="width: 100%; height: 100%; object-fit: cover; min-height: 320px; display: block">
      </div>
    </div>
  </div>
</section>

`;
}

function patchServicesSection(text) {
  const startMarker = '<!-- ============ 4 · SERVICES ============ -->';
  const endMarker = '<!-- ============ 5 · WHY CHOOSE US ============ -->';
  const start = text.indexOf(startMarker);
  const end = text.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error('Services section not found');
  return text.slice(0, start) + buildServicesSection() + text.slice(end);
}

function patchWhyChooseSection(text) {
  const startMarker = '<!-- ============ 5 · WHY CHOOSE US ============ -->';
  const endMarker = '<!-- ============ 6';
  const start = text.indexOf(startMarker);
  const end = text.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error('Why Choose section not found');
  return text.slice(0, start) + buildWhyChooseSection() + text.slice(end);
}

function reorderSectionsRemoveFeatured(text) {
  const start5 = text.indexOf('<!-- ============ 5 · WHY CHOOSE US ============ -->');
  const start6 = text.indexOf('<!-- ============ 6 · BEFORE & AFTER ============ -->');
  const start7 = text.indexOf('<!-- ============ 7 · FEATURED PROJECTS ============ -->');
  const start8 = text.indexOf('<!-- ============ 8 · WHO WE HELP ============ -->');
  if (start5 < 0 || start6 < 0 || start7 < 0 || start8 < 0) return text;

  const whyChoose = text.slice(start5, start6);
  const beforeAfter = text.slice(start6, start7);
  return text.slice(0, start5) + beforeAfter + whyChoose + text.slice(start8);
}

function headerStylesCss() {
  return `
/* MR7 header + footer logos */
.mr7-header-logo,
.mr7-footer-logo {
  object-fit: contain;
}
img.mr7-footer-logo {
  filter: invert(1) brightness(999.5);
}
img.mr7-header-logo {
  filter: invert(1) brightness(999.5);
  transition: filter .35s ease;
}
.mr7-header.is-scrolled img.mr7-header-logo {
  filter: unset !important;
}
`;
}

function sectionStylesCss() {
  return `
/* MR7 stats bar — compact vertical spacing */
.mr7-stats > div {
  padding-top: 28px !important;
  padding-bottom: 28px !important;
}
/* MR7 services section — background image */
.mr7-services-bg {
  position: absolute;
  inset: 0;
  background: url('${SERVICES_BG_FILE}') center / cover no-repeat;
  opacity: 0.18;
  pointer-events: none;
}
.mr7-services-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(244,248,251,.94) 0%, rgba(244,248,251,.9) 100%);
  pointer-events: none;
}
/* MR7 section cards — image boxes */
.mr7-service-card {
  transition: transform .35s cubic-bezier(.2,.7,.2,1);
}
.mr7-service-card:hover {
  transform: translateY(-5px);
}
.mr7-service-card img {
  transition: transform .55s cubic-bezier(.2,.7,.2,1);
}
.mr7-service-card:hover img {
  transform: scale(1.06);
}
.mr7-service-detail {
  min-height: 300px !important;
}
.mr7-service-panel.is-hidden {
  display: none !important;
}
.mr7-service-grid {
  grid-template-columns: repeat(4, 1fr) !important;
}
.mr7-why-card {
  transition: transform .35s ease;
}
.mr7-why-card:hover {
  transform: translateY(-4px);
}
/* MR7 service tabs */
.mr7-service-tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  max-width: 980px;
  margin: 0 auto 36px;
  padding: 6px;
  border-radius: 12px;
  background: rgba(255,255,255,.7);
  border: 1px solid rgba(0,0,0,.06);
}
.mr7-service-tab {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13.5px;
  font-weight: 600;
  padding: 11px 18px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: color .25s ease, background .25s ease, box-shadow .25s ease;
  white-space: nowrap;
}
.mr7-service-tab:hover {
  color: ${PALETTE.black};
  background: rgba(255,255,255,.85);
}
.mr7-service-tab.is-active {
  color: ${PALETTE.black};
  background: #ffffff;
  box-shadow: 0 1px 0 rgba(0,0,0,.04);
}
@media (max-width: 1024px) {
  .mr7-service-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .mr7-why-grid { grid-template-columns: repeat(2, 1fr) !important; }
}
@media (max-width: 560px) {
  .mr7-service-grid, .mr7-why-grid { grid-template-columns: 1fr !important; }
  .mr7-service-detail { min-height: 260px !important; }
  .mr7-service-tab { font-size: 12px !important; padding: 9px 12px !important; }
}
`;
}

function noShadowStylesCss() {
  return `
/* MR7 — flat UI, no drop shadows */
.mr7-btn, .mr7-btn:hover,
.mr7-service-card, .mr7-service-card:hover,
.mr7-why-card, .mr7-why-card:hover,
.mr7-footer-cta {
  box-shadow: none !important;
}
`;
}

function heroStylesCss() {
  return `
/* MR7 video hero — full-bleed property background */
.mr7-hero { min-height: 100vh !important; }
.mr7-hero-line1, .mr7-hero-line2 { display: block; white-space: nowrap; }
.mr7-hero-desc {
  max-width: 920px !important;
  width: 100%;
}
@media (max-width: 640px) {
  .mr7-hero-line2 { white-space: normal; font-size: clamp(26px, 5.5vw, 40px) !important; }
}
.mr7-hero-video {
  pointer-events: none;
  transform: scale(1.03);
  filter: brightness(0.92) saturate(1.08);
}
@media (prefers-reduced-motion: reduce) {
  .mr7-hero-video { display: none; }
  .mr7-hero { background: #000 url("${HERO_POSTER_FILE}") center/cover no-repeat; }
}
`;
}

function heroInitScript() {
  return `
<script>
(function(){
  if (window.__mr7PlayHeroInit) return;
  window.__mr7PlayHeroInit = true;
  function playHero(){
    var v=document.querySelector(".mr7-hero-video");
    if(!v)return;
    v.muted=true;
    v.defaultMuted=true;
    v.setAttribute("playsinline","");
    var p=v.play&&v.play();
    if(p&&p.catch)p.catch(function(){});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",playHero,{once:true});
  else playHero();
})();
</script>`;
}

function serviceTabsScript() {
  return `
<script>
(function(){
  if (window.__mr7ServiceTabsInit) return;
  window.__mr7ServiceTabsInit = true;
  function showServiceTab(section, slug){
    if (!section || !slug) return;
    section.querySelectorAll('.mr7-service-tab').forEach(function(tab){
      var active = tab.getAttribute('data-service') === slug;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    section.querySelectorAll('.mr7-service-panel').forEach(function(panel){
      panel.classList.toggle('is-hidden', panel.getAttribute('data-service') !== slug);
    });
  }
  document.addEventListener('click', function(e){
    var tab = e.target.closest('.mr7-service-tab');
    if (!tab) return;
    var section = tab.closest('.mr7-services');
    if (!section) return;
    e.preventDefault();
    showServiceTab(section, tab.getAttribute('data-service'));
  });
  function initServiceTabs(){
    var section = document.querySelector('.mr7-services');
    if (!section) return false;
    var first = section.querySelector('.mr7-service-tab.is-active') || section.querySelector('.mr7-service-tab');
    if (first) showServiceTab(section, first.getAttribute('data-service'));
    return true;
  }
  if (!initServiceTabs()) {
    var obs = new MutationObserver(function(){
      if (initServiceTabs()) obs.disconnect();
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function(){ initServiceTabs(); obs.disconnect(); }, 8000);
  }
})();
</script>`;
}

function headerLogoScrollScript() {
  return `
<script>
(function(){
  if (window.__mr7HeaderLogoScroll) return;
  window.__mr7HeaderLogoScroll = true;
  function syncHeaderLogo(){
    var logo = document.querySelector('img.mr7-header-logo');
    if (!logo) return;
    var header = logo.closest('.mr7-header') || logo.closest('div[style*="position: fixed"]');
    if (!header) return;
    header.classList.add('mr7-header');
    header.classList.toggle('is-scrolled', window.scrollY > 50);
  }
  window.addEventListener('scroll', syncHeaderLogo, { passive: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncHeaderLogo, { once: true });
  else syncHeaderLogo();
})();
</script>`;
}

function injectStyles(text) {
  const endHelmet = '</style>\n</helmet>';
  const scripts = heroInitScript() + serviceTabsScript() + headerLogoScrollScript();
  if (text.includes('.mr7-btn {')) {
    let out = text;
    if (!text.includes('mr7-header-logo') || !text.includes('filter: unset !important')) {
      out = out.replace(endHelmet, headerStylesCss() + endHelmet);
    }
    if (!text.includes('mr7-service-tabs') || !text.includes('mr7-service-panel') || !text.includes('mr7-services-bg')) {
      out = out.replace(endHelmet, sectionStylesCss() + endHelmet);
    }
    if (!out.includes('showServiceTab') || !out.includes('syncHeaderLogo')) {
      out = out.replace(endHelmet, '</style>\n' + scripts + '\n</helmet>');
    }
    return out;
  }
  const css = buttonStylesCss() + heroStylesCss() + footerStylesCss() + headerStylesCss() + sectionStylesCss() + noShadowStylesCss();
  return text.replace(endHelmet, css + '\n</style>\n' + scripts + '\n</helmet>');
}

function patchButtons(text) {
  const swaps = [
    [
      /<a href="#cta" style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 700; color: #0F2744; background: #C79A3B; padding: 12px 24px; border-radius: 8px; text-decoration: none; transition: all \.25s; box-shadow: 0 4px 14px rgba\(199,154,59,\.28\)" style-hover="background: #d4a94a; transform: translateY\(-1px\); box-shadow: 0 8px 20px rgba\(199,154,59,\.4\)">Request a Quote<\/a>/,
      '<a href="#cta" class="mr7-btn mr7-btn-primary mr7-btn-sm" style="font-size: 14px; padding: 12px 24px">Request a Quote</a>',
    ],
    [
      /<a href="#cta" style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15\.5px; font-weight: 700; color: #0F2744; background: #C79A3B; padding: 17px 34px; border-radius: 9px; text-decoration: none; transition: all \.25s; box-shadow: 0 6px 22px rgba\(199,154,59,\.35\)" style-hover="background: #d4a94a; transform: translateY\(-2px\); box-shadow: 0 12px 28px rgba\(199,154,59,\.45\)">Request a Free Quote<\/a>/,
      '<a href="#cta" class="mr7-btn mr7-btn-primary" style="font-size: 15.5px; padding: 17px 34px">Request a Free Quote</a>',
    ],
    [
      /<a href="#cta" style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15\.5px; font-weight: 700; color: #fff; background: rgba\(255,255,255,\.08\); border: 1\.5px solid rgba\(255,255,255,\.45\); padding: 17px 34px; border-radius: 9px; text-decoration: none; transition: all \.25s" style-hover="background: rgba\(255,255,255,\.18\); border-color: #fff; transform: translateY\(-2px\)">Schedule a Consultation<\/a>/,
      '<a href="#cta" class="mr7-btn mr7-btn-ghost" style="font-size: 15.5px; padding: 17px 34px">Schedule a Consultation</a>',
    ],
    [
      /<a href="#cta" style="display: inline-flex; align-items: center; gap: 10px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 700; color: #0F2744; background: #C79A3B; padding: 15px 30px; border-radius: 9px; text-decoration: none; transition: all \.25s" style-hover="background: #d4a94a; transform: translateY\(-2px\)">Check Your Coverage<\/a>/,
      '<a href="#cta" class="mr7-btn mr7-btn-primary" style="font-size: 15px; padding: 15px 30px">Check Your Coverage</a>',
    ],
    [
      /<a href="#cta" style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px; font-weight: 700; color: #0F2744; background: #C79A3B; padding: 18px 38px; border-radius: 9px; text-decoration: none; transition: all \.25s; box-shadow: 0 8px 26px rgba\(199,154,59,\.4\)" style-hover="background: #d4a94a; transform: translateY\(-2px\); box-shadow: 0 14px 32px rgba\(199,154,59,\.5\)">Request a Quote<\/a>/,
      '<a href="#cta" class="mr7-btn mr7-btn-primary" style="font-size: 16px; padding: 18px 38px">Request a Quote</a>',
    ],
    [
      /<a href="#cta" style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px; font-weight: 700; color: #fff; background: rgba\(255,255,255,\.08\); border: 1\.5px solid rgba\(255,255,255,\.5\); padding: 18px 38px; border-radius: 9px; text-decoration: none; transition: all \.25s" style-hover="background: rgba\(255,255,255,\.18\); border-color: #fff; transform: translateY\(-2px\)">Schedule Consultation<\/a>/,
      '<a href="#cta" class="mr7-btn mr7-btn-ghost" style="font-size: 16px; padding: 18px 38px">Schedule Consultation</a>',
    ],
  ];

  let out = text;
  for (const [pattern, replacement] of swaps) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function injectBundlerRuntimeFixes(shell) {
  const fix = `
    (function(){
      if (window.__mr7Booted) return;
      window.__mr7Booted = true;
      var thumb = document.getElementById('__bundler_thumbnail');
      if (thumb) thumb.style.display = 'none';
      if (typeof loading !== 'undefined' && loading) loading.style.display = 'none';
      function showServiceTab(section, slug){
        if (!section || !slug) return;
        section.querySelectorAll('.mr7-service-tab').forEach(function(tab){
          var active = tab.getAttribute('data-service') === slug;
          tab.classList.toggle('is-active', active);
          tab.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        section.querySelectorAll('.mr7-service-panel').forEach(function(panel){
          panel.classList.toggle('is-hidden', panel.getAttribute('data-service') !== slug);
        });
      }
      if (!window.__mr7ServiceTabsInit) {
        window.__mr7ServiceTabsInit = true;
        document.addEventListener('click', function(e){
          var tab = e.target.closest('.mr7-service-tab');
          if (!tab) return;
          var section = tab.closest('.mr7-services');
          if (!section) return;
          e.preventDefault();
          showServiceTab(section, tab.getAttribute('data-service'));
        });
        function initTabs(){
          var section = document.querySelector('.mr7-services');
          if (!section) return false;
          var first = section.querySelector('.mr7-service-tab.is-active') || section.querySelector('.mr7-service-tab');
          if (first) showServiceTab(section, first.getAttribute('data-service'));
          return true;
        }
        if (!initTabs()) {
          var obs = new MutationObserver(function(){ if (initTabs()) obs.disconnect(); });
          obs.observe(document.documentElement, { childList: true, subtree: true });
          setTimeout(function(){ initTabs(); obs.disconnect(); }, 8000);
        }
      }
    })();
`;
  return shell.replace(
    /window\.Babel\.transformScriptTags\(\);\r?\n    \}/,
    'window.Babel.transformScriptTags();\n    }' + fix
  );
}

function externalizeHeroMedia(text) {
  return text.split(HERO_UUID).join(HERO_VIDEO_FILE).split(HERO_POSTER_UUID).join(HERO_POSTER_FILE);
}

function patchShell(output) {
  const shellEnd = output.indexOf('<script type="__bundler/manifest">');
  if (shellEnd < 0) return output;
  let shell = output.slice(0, shellEnd);
  shell = applyTheme(shell);
  shell = shell
    .replace(/body \{ background: #0F2744;/g, 'body { background: #000000;')
    .replace(/background: #0F2744; z-index: 9999/g, 'background: #000000; z-index: 9999')
    .replace(/<rect width="1200" height="800" fill="#0F2744">/g, '<rect width="1200" height="800" fill="#000000">');
  shell = injectBundlerRuntimeFixes(shell);
  if (!shell.includes('img.mr7-footer-logo')) {
    shell = shell.replace('<body>', '<body>\n<style>img.mr7-footer-logo { filter: invert(1) brightness(999.5); }</style>\n');
  }
  shell = shell.replace(
    /<div id="__bundler_thumbnail">[\s\S]*?<\/div>/,
    '<div id="__bundler_thumbnail" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#000;z-index:9999;"><img src="' + LOGO_FILE + '" alt="Loading" style="width:180px;height:auto;"></div>'
  );
  return shell + output.slice(shellEnd);
}

function extractScript(content, type) {
  const open = '<script type="__bundler/' + type + '">';
  const start = content.indexOf(open);
  if (start < 0) throw new Error('Missing ' + type);
  const dataStart = start + open.length;
  const end = content.indexOf('</script>', dataStart);
  return { start, end: end + '</script>'.length, data: content.slice(dataStart, end).trim() };
}

function safeStringify(obj) {
  return JSON.stringify(obj).replace(/<\//g, '<\\u002F');
}

async function build() {
  if (!LOGO_IS_REMOTE && !fs.existsSync(path.join(ROOT, 'logo.png'))) throw new Error('Missing logo.png');
  if (!fs.existsSync(HERO_VIDEO_PATH)) throw new Error('Missing hero-bg.mp4');
  if (!fs.existsSync(HERO_POSTER_PATH)) throw new Error('Missing hero-bg.jpg');

  let content = fs.readFileSync(SOURCE, 'utf8');

  const manifestBlock = extractScript(content, 'manifest');
  const templateBlock = extractScript(content, 'template');

  const manifest = JSON.parse(manifestBlock.data);
  delete manifest[LOGO_UUID];

  let template = JSON.parse(templateBlock.data);
  template = template.replace(LOGO_BLOCK, LOGO_IMG).replace(LOGO_BLOCK_COMPACT, LOGO_IMG);
  template = patchHeaderLogo(template);
  template = patchHeroBanner(template);
  template = patchHeroLayout(template);
  template = removeHeroBadges(template);
  template = patchStatsSection(template);
  template = patchServicesSection(template);
  template = patchWhyChooseSection(template);
  template = reorderSectionsRemoveFeatured(template);
  template = patchFooterUI(template);
  template = patchButtons(template);
  template = applyTheme(template);
  template = removeShadows(template);
  template = restoreDarkSectionAccents(template);
  template = finalizeHeroSection(template);
  template = patchHeaderScroll(template);
  template = injectStyles(template);
  template = externalizeHeroMedia(template);
  template = externalizeLogo(template);

  const newManifest = JSON.stringify(manifest);
  const newTemplate = safeStringify(template);

  let output = content.slice(0, manifestBlock.start)
    + '<script type="__bundler/manifest">\n' + newManifest + '\n  </script>'
    + content.slice(manifestBlock.end, templateBlock.start)
    + '<script type="__bundler/template">\n' + newTemplate + '\n  </script>'
    + content.slice(templateBlock.end);

  output = patchShell(output);

  fs.writeFileSync(OUTPUT, output, 'utf8');
  JSON.parse(extractScript(output, 'manifest').data);
  JSON.parse(extractScript(output, 'template').data);
  console.log('Built', OUTPUT, '(' + (fs.statSync(OUTPUT).size / 1024 / 1024).toFixed(2) + ' MB)');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
