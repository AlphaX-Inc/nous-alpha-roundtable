// High-quality stylized persona portraits — Nous Alpha 12 experts
// Each is a hand-crafted SVG: layered radial-gradient bg, properly modeled
// face with shading, eye highlights, eyebrows, hair with depth, and
// optional accessories (glasses, beard, balding pattern) per persona.
// 96×96 viewbox for finer detail.

const _persona = (i, name, role, opts) => {
  const {
    bgFromHue = 220, bgFromChroma = 0.10,
    bgToHue = 220, bgToChroma = 0.06,
    skin = '#e8c4a0',         // base skin
    skinShade = '#c89878',     // darker side
    skinHi = '#f5d4b0',        // highlight cheek
    hair = '#3a2a20',          // primary hair
    hairShade = '#1a0e08',     // hair shadow
    hairStyle = 'short',       // short | side-part | bald | balding | white-short | grey-side | wavy | curly | crew
    facialHair = 'none',       // none | stubble | beard | mustache | grey-beard
    glasses = 'none',          // none | round | rect | thick-round | half-rim
    eyeColor = '#2a1f18',
    bodyColor = '#1a1f2c',     // jacket / shoulders
    bodyShade = '#0e1118',     // shadow side of jacket
    collar = '#fafafa',        // shirt collar
    expression = 'neutral',    // neutral | slight-smile | serious | thoughtful
    age = 'mid',               // young | mid | older
  } = opts;

  // Build SVG. Compose layers in order: bg, neck, shoulders/jacket, collar, head shape, ears, hair-back, face shading, brows, eyes, glasses, nose, mouth, beard, hair-front, accents.
  const id = 'p' + i;

  // Hair layer paths (back + front) — keyed by style
  const hairPaths = (() => {
    if (hairStyle === 'bald') return { back: '', front: '' };
    if (hairStyle === 'balding') return {
      back: '',
      front: `<path d="M 22 38 C 22 26, 28 22, 34 22 C 38 22, 42 22, 44 24 C 47 26, 47 30, 46 34 C 44 30, 36 28, 32 30 C 28 32, 24 34, 22 38 Z" fill="${hair}"/>
              <path d="M 24 36 C 26 30, 32 28, 38 28" stroke="${hairShade}" stroke-width="0.6" fill="none" opacity="0.4"/>`,
    };
    if (hairStyle === 'crew') return {
      back: `<path d="M 22 36 C 20 26, 28 18, 36 18 C 46 18, 50 26, 50 36 L 50 42 L 22 42 Z" fill="${hairShade}"/>`,
      front: `<path d="M 23 38 C 23 26, 30 22, 36 22 C 44 22, 49 26, 49 36 C 47 32, 42 30, 36 30 C 30 30, 25 32, 23 38 Z" fill="${hair}"/>
              <path d="M 26 30 L 28 26 M 32 28 L 33 24 M 38 28 L 39 25 M 43 30 L 44 27" stroke="${hairShade}" stroke-width="0.5" opacity="0.5"/>`,
    };
    if (hairStyle === 'side-part') return {
      back: `<path d="M 22 36 C 20 24, 26 16, 36 16 C 47 16, 51 26, 50 38 L 22 38 Z" fill="${hairShade}"/>`,
      front: `<path d="M 23 38 C 23 22, 31 18, 38 19 C 46 20, 50 26, 50 36 C 46 30, 38 28, 32 30 C 27 31, 24 34, 23 38 Z" fill="${hair}"/>
              <path d="M 26 30 C 30 24, 36 22, 42 22 C 46 22, 48 24, 49 28" stroke="${hairShade}" stroke-width="0.7" fill="none" opacity="0.5"/>`,
    };
    if (hairStyle === 'wavy') return {
      back: `<path d="M 20 38 C 18 24, 26 14, 36 14 C 48 14, 52 24, 52 40 L 20 40 Z" fill="${hairShade}"/>`,
      front: `<path d="M 22 40 C 22 22, 30 16, 36 16 C 46 16, 51 24, 51 38 C 49 32, 44 31, 40 33 C 36 31, 30 32, 27 35 C 25 36, 23 38, 22 40 Z" fill="${hair}"/>
              <path d="M 27 28 Q 32 24, 38 26 Q 44 28, 48 26" stroke="${hairShade}" stroke-width="0.6" fill="none" opacity="0.5"/>`,
    };
    if (hairStyle === 'curly') return {
      back: `<path d="M 20 38 C 18 22, 28 14, 38 14 C 48 14, 52 24, 52 40 L 20 40 Z" fill="${hairShade}"/>`,
      front: `<g fill="${hair}">
                <circle cx="26" cy="26" r="4"/><circle cx="32" cy="22" r="4.5"/>
                <circle cx="40" cy="22" r="4.5"/><circle cx="46" cy="26" r="4"/>
                <circle cx="24" cy="32" r="3.5"/><circle cx="48" cy="32" r="3.5"/>
                <circle cx="29" cy="28" r="3"/><circle cx="44" cy="28" r="3"/>
                <circle cx="36" cy="20" r="3.5"/>
              </g>`,
    };
    if (hairStyle === 'white-short') return {
      back: `<path d="M 22 36 C 20 24, 28 18, 36 18 C 46 18, 50 24, 50 38 L 22 38 Z" fill="#b8b8b8"/>`,
      front: `<path d="M 23 38 C 23 22, 30 20, 36 20 C 44 20, 49 24, 50 36 C 46 30, 38 29, 32 30 C 27 31, 24 34, 23 38 Z" fill="#e8e8e8"/>
              <path d="M 26 30 C 32 26, 40 26, 46 28" stroke="#999" stroke-width="0.5" fill="none" opacity="0.5"/>`,
    };
    if (hairStyle === 'grey-side') return {
      back: `<path d="M 22 36 C 20 24, 28 18, 36 18 C 46 18, 50 24, 50 38 L 22 38 Z" fill="#888"/>`,
      front: `<path d="M 23 38 C 23 22, 31 20, 38 20 C 46 20, 50 24, 50 36 C 47 30, 39 29, 33 30 C 28 31, 24 34, 23 38 Z" fill="#aaa"/>
              <path d="M 26 30 C 32 24, 40 24, 47 28" stroke="#666" stroke-width="0.5" fill="none" opacity="0.5"/>`,
    };
    // short (default)
    return {
      back: `<path d="M 22 36 C 20 26, 28 18, 36 18 C 46 18, 50 26, 50 38 L 22 38 Z" fill="${hairShade}"/>`,
      front: `<path d="M 23 38 C 23 22, 31 20, 38 20 C 46 20, 50 24, 50 36 C 46 30, 38 29, 32 30 C 27 31, 24 34, 23 38 Z" fill="${hair}"/>
              <path d="M 26 30 C 32 26, 40 26, 46 28" stroke="${hairShade}" stroke-width="0.5" fill="none" opacity="0.5"/>`,
    };
  })();

  // Eyebrows
  const browPath = age === 'older'
    ? `<path d="M 24 36 Q 28 35, 31 36" stroke="${hair}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
       <path d="M 41 36 Q 44 35, 48 36" stroke="${hair}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`
    : `<path d="M 24 36.5 Q 28 35.5, 32 36.5" stroke="${hair}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
       <path d="M 40 36.5 Q 44 35.5, 48 36.5" stroke="${hair}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;

  // Eyes — almond, with iris + highlight
  const eyes = `
    <ellipse cx="28" cy="40" rx="2.3" ry="1.5" fill="#fff"/>
    <ellipse cx="44" cy="40" rx="2.3" ry="1.5" fill="#fff"/>
    <circle cx="28" cy="40" r="1.2" fill="${eyeColor}"/>
    <circle cx="44" cy="40" r="1.2" fill="${eyeColor}"/>
    <circle cx="28.4" cy="39.6" r="0.4" fill="#fff"/>
    <circle cx="44.4" cy="39.6" r="0.4" fill="#fff"/>
  `;

  // Glasses
  let glassesPath = '';
  if (glasses === 'round') {
    glassesPath = `
      <circle cx="28" cy="40" r="4.2" fill="none" stroke="#2a2a2a" stroke-width="0.8"/>
      <circle cx="44" cy="40" r="4.2" fill="none" stroke="#2a2a2a" stroke-width="0.8"/>
      <line x1="32.2" y1="40" x2="39.8" y2="40" stroke="#2a2a2a" stroke-width="0.7"/>
      <line x1="23.8" y1="40" x2="22" y2="38.5" stroke="#2a2a2a" stroke-width="0.7"/>
      <line x1="48.2" y1="40" x2="50" y2="38.5" stroke="#2a2a2a" stroke-width="0.7"/>`;
  } else if (glasses === 'rect') {
    glassesPath = `
      <rect x="23.5" y="36.5" width="9" height="6" rx="1" fill="none" stroke="#2a2a2a" stroke-width="0.8"/>
      <rect x="39.5" y="36.5" width="9" height="6" rx="1" fill="none" stroke="#2a2a2a" stroke-width="0.8"/>
      <line x1="32.5" y1="40" x2="39.5" y2="40" stroke="#2a2a2a" stroke-width="0.7"/>
      <line x1="23.5" y1="38" x2="22" y2="37" stroke="#2a2a2a" stroke-width="0.7"/>
      <line x1="48.5" y1="38" x2="50" y2="37" stroke="#2a2a2a" stroke-width="0.7"/>`;
  } else if (glasses === 'thick-round') {
    glassesPath = `
      <circle cx="28" cy="40" r="4.5" fill="none" stroke="#1a1a1a" stroke-width="1.4"/>
      <circle cx="44" cy="40" r="4.5" fill="none" stroke="#1a1a1a" stroke-width="1.4"/>
      <line x1="32.5" y1="40" x2="39.5" y2="40" stroke="#1a1a1a" stroke-width="1.2"/>
      <line x1="23.5" y1="40" x2="21.5" y2="38" stroke="#1a1a1a" stroke-width="1.2"/>
      <line x1="48.5" y1="40" x2="50.5" y2="38" stroke="#1a1a1a" stroke-width="1.2"/>`;
  } else if (glasses === 'half-rim') {
    glassesPath = `
      <path d="M 23.5 40 A 4.5 3 0 0 0 32.5 40" fill="none" stroke="#2a2a2a" stroke-width="0.8"/>
      <path d="M 39.5 40 A 4.5 3 0 0 0 48.5 40" fill="none" stroke="#2a2a2a" stroke-width="0.8"/>
      <line x1="23.5" y1="40" x2="32.5" y2="40" stroke="#2a2a2a" stroke-width="0.7"/>
      <line x1="39.5" y1="40" x2="48.5" y2="40" stroke="#2a2a2a" stroke-width="0.7"/>
      <line x1="32.5" y1="40" x2="39.5" y2="40" stroke="#2a2a2a" stroke-width="0.7"/>`;
  }

  // Mouth
  let mouth = '';
  if (expression === 'slight-smile') mouth = `<path d="M 30 50 Q 36 53, 42 50" stroke="#9a5a40" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
  else if (expression === 'serious') mouth = `<path d="M 30 50.5 L 42 50.5" stroke="#9a5a40" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
  else if (expression === 'thoughtful') mouth = `<path d="M 31 50 Q 36 49, 41 50.5" stroke="#9a5a40" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
  else mouth = `<path d="M 30 50 Q 36 51.5, 42 50" stroke="#9a5a40" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;

  // Facial hair
  let beard = '';
  if (facialHair === 'stubble') {
    beard = `<g fill="${hairShade}" opacity="0.45">
               <circle cx="26" cy="50" r="0.4"/><circle cx="28" cy="52" r="0.4"/><circle cx="30" cy="54" r="0.4"/>
               <circle cx="32" cy="55" r="0.4"/><circle cx="34" cy="55" r="0.4"/><circle cx="36" cy="55" r="0.4"/>
               <circle cx="38" cy="55" r="0.4"/><circle cx="40" cy="54" r="0.4"/><circle cx="42" cy="52" r="0.4"/>
               <circle cx="44" cy="50" r="0.4"/><circle cx="29" cy="48" r="0.35"/><circle cx="42" cy="48" r="0.35"/>
             </g>`;
  } else if (facialHair === 'beard') {
    beard = `<path d="M 24 46 C 24 54, 30 60, 36 60 C 42 60, 48 54, 48 46 C 46 50, 42 51, 36 51 C 30 51, 26 50, 24 46 Z" fill="${hair}"/>`;
  } else if (facialHair === 'grey-beard') {
    beard = `<path d="M 24 46 C 24 54, 30 60, 36 60 C 42 60, 48 54, 48 46 C 46 50, 42 51, 36 51 C 30 51, 26 50, 24 46 Z" fill="#b8b8b8"/>
             <path d="M 28 50 Q 36 54, 44 50" stroke="#999" stroke-width="0.4" fill="none" opacity="0.6"/>`;
  } else if (facialHair === 'mustache') {
    beard = `<path d="M 28 48 Q 32 49, 36 48 Q 40 49, 44 48 Q 42 50, 36 50 Q 30 50, 28 48 Z" fill="${hair}"/>`;
  }

  const svg = `<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="${id}-bg" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="oklch(0.78 ${bgFromChroma} ${bgFromHue})"/>
      <stop offset="60%" stop-color="oklch(0.55 ${bgFromChroma * 0.9} ${bgFromHue})"/>
      <stop offset="100%" stop-color="oklch(0.22 ${bgToChroma} ${bgToHue})"/>
    </radialGradient>
    <radialGradient id="${id}-skin" cx="38%" cy="35%" r="60%">
      <stop offset="0%" stop-color="${skinHi}"/>
      <stop offset="60%" stop-color="${skin}"/>
      <stop offset="100%" stop-color="${skinShade}"/>
    </radialGradient>
    <linearGradient id="${id}-jacket" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${bodyColor}"/>
      <stop offset="100%" stop-color="${bodyShade}"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="72" height="72" fill="url(#${id}-bg)"/>
  <circle cx="36" cy="36" r="36" fill="url(#${id}-bg)"/>

  <!-- Shoulders / jacket -->
  <path d="M 4 72 C 4 60, 14 54, 22 54 L 50 54 C 58 54, 68 60, 68 72 Z" fill="url(#${id}-jacket)"/>
  <!-- Lapel notches -->
  <path d="M 22 54 L 30 60 L 26 66 L 22 60 Z" fill="${bodyShade}" opacity="0.6"/>
  <path d="M 50 54 L 42 60 L 46 66 L 50 60 Z" fill="${bodyShade}" opacity="0.6"/>
  <!-- Collar / shirt triangle -->
  <path d="M 30 54 L 36 64 L 42 54 L 38 53 L 36 56 L 34 53 Z" fill="${collar}"/>
  <!-- Tie or pocket-square (subtle) -->
  <path d="M 35 56 L 37 56 L 36.5 64 L 35.5 64 Z" fill="${bodyShade}" opacity="0.5"/>

  <!-- Neck -->
  <path d="M 31 50 L 31 58 L 41 58 L 41 50 Z" fill="${skinShade}"/>
  <ellipse cx="36" cy="50" rx="5" ry="2" fill="${skinShade}" opacity="0.7"/>

  <!-- Hair (back of head, behind face) -->
  ${hairPaths.back}

  <!-- Head shape with subtle modeling -->
  <ellipse cx="36" cy="38" rx="13" ry="15" fill="url(#${id}-skin)"/>
  <!-- Side shadow on cheek -->
  <path d="M 23 36 Q 26 44, 30 50 Q 27 48, 24 42 Z" fill="${skinShade}" opacity="0.35"/>
  <!-- Highlight on temple -->
  <ellipse cx="42" cy="32" rx="3" ry="5" fill="${skinHi}" opacity="0.35"/>

  <!-- Ears -->
  <ellipse cx="22.5" cy="40" rx="1.6" ry="2.6" fill="${skinShade}"/>
  <ellipse cx="49.5" cy="40" rx="1.6" ry="2.6" fill="${skinShade}"/>

  <!-- Eyebrows -->
  ${browPath}

  <!-- Eyes -->
  ${eyes}

  <!-- Nose -->
  <path d="M 36 41 L 35 46 Q 36 47.2, 37 46 Z" fill="${skinShade}" opacity="0.55"/>
  <ellipse cx="35.5" cy="46.5" rx="0.5" ry="0.3" fill="${skinShade}" opacity="0.6"/>
  <ellipse cx="36.5" cy="46.5" rx="0.5" ry="0.3" fill="${skinShade}" opacity="0.6"/>

  <!-- Glasses -->
  ${glassesPath}

  <!-- Mouth -->
  ${mouth}

  <!-- Beard (over chin/lower face) -->
  ${beard}

  <!-- Hair (front, over forehead) -->
  ${hairPaths.front}

  <!-- Subtle vignette -->
  <circle cx="36" cy="36" r="35" fill="none" stroke="rgba(0,0,0,0.18)" stroke-width="2"/>
</svg>`;

  return { id: i, name, role, svg: svg.replace(/\n\s*/g, '') };
};

const Personas = [
  // 0 — Leo Aschenbrenner · young, dark short hair, intense
  _persona(0, 'Leo Aschenbrenner', 'AI · Compute Scaling', {
    bgFromHue: 270, bgFromChroma: 0.12, bgToHue: 270, bgToChroma: 0.08,
    skin: '#e8c4a0', skinShade: '#b88868', skinHi: '#f0d0b0',
    hair: '#2a1810', hairShade: '#10080a',
    hairStyle: 'short', age: 'young',
    bodyColor: '#1c1830', bodyShade: '#0a0818',
    expression: 'thoughtful',
  }),
  // 1 — Jim Simons · bald with white beard, mathematician
  _persona(1, 'Jim Simons', 'Quant Factor', {
    bgFromHue: 160, bgFromChroma: 0.09, bgToHue: 160, bgToChroma: 0.06,
    skin: '#e8c0a0', skinShade: '#b88868', skinHi: '#f0d0b0',
    hair: '#bbbbbb', hairShade: '#888',
    hairStyle: 'bald', age: 'older',
    bodyColor: '#1c2a2c', bodyShade: '#0c1416',
    facialHair: 'grey-beard',
    expression: 'thoughtful',
    glasses: 'rect',
  }),
  // 2 — Ken Griffin · sharp side-part, executive
  _persona(2, 'Ken Griffin', 'Multi-strategy · Citadel', {
    bgFromHue: 150, bgFromChroma: 0.10, bgToHue: 150, bgToChroma: 0.06,
    skin: '#e8c4a0', skinShade: '#b88868', skinHi: '#f0d0b0',
    hair: '#5a3a28', hairShade: '#2a1810',
    hairStyle: 'side-part', age: 'mid',
    bodyColor: '#0e1830', bodyShade: '#06091a',
    expression: 'serious',
  }),
  // 3 — Ray Dalio · grey-haired macro investor
  _persona(3, 'Ray Dalio', 'Macro · All-Weather', {
    bgFromHue: 240, bgFromChroma: 0.08, bgToHue: 240, bgToChroma: 0.06,
    skin: '#e8c4a0', skinShade: '#b88868', skinHi: '#f0d0b0',
    hair: '#bbbbbb', hairShade: '#7a7a7a',
    hairStyle: 'grey-side', age: 'older',
    bodyColor: '#1a2538', bodyShade: '#0c1220',
    expression: 'slight-smile',
  }),
  // 4 — Stanley Druckenmiller · white-grey crew cut
  _persona(4, 'S. Druckenmiller', 'Technical', {
    bgFromHue: 260, bgFromChroma: 0.08, bgToHue: 260, bgToChroma: 0.06,
    skin: '#e8c4a0', skinShade: '#b88868', skinHi: '#f0d0b0',
    hair: '#dddddd', hairShade: '#999',
    hairStyle: 'white-short', age: 'older',
    bodyColor: '#1c2238', bodyShade: '#0e1220',
    expression: 'serious',
  }),
  // 5 — Howard Marks · academic, balding, half-rim glasses
  _persona(5, 'Howard Marks', 'Credit', {
    bgFromHue: 280, bgFromChroma: 0.08, bgToHue: 280, bgToChroma: 0.06,
    skin: '#e8c0a0', skinShade: '#b88868', skinHi: '#f0d0b0',
    hair: '#aaaaaa', hairShade: '#777',
    hairStyle: 'balding', age: 'older',
    bodyColor: '#22202e', bodyShade: '#100e18',
    glasses: 'half-rim',
    expression: 'thoughtful',
  }),
  // 6 — Michael Burry · contrarian, dark unkempt hair, thick round glasses
  _persona(6, 'Michael Burry', 'Contrarian', {
    bgFromHue: 30, bgFromChroma: 0.10, bgToHue: 25, bgToChroma: 0.06,
    skin: '#f0d0b0', skinShade: '#c89878', skinHi: '#f8dcb8',
    hair: '#3a2818', hairShade: '#1c0e08',
    hairStyle: 'wavy', age: 'mid',
    bodyColor: '#2a1c14', bodyShade: '#160c08',
    glasses: 'thick-round',
    facialHair: 'stubble',
    expression: 'serious',
  }),
  // 7 — Paul Tudor Jones · brown wavy hair, intense
  _persona(7, 'P. Tudor Jones', 'Risk · Hedging', {
    bgFromHue: 25, bgFromChroma: 0.12, bgToHue: 25, bgToChroma: 0.08,
    skin: '#e8c4a0', skinShade: '#b88868', skinHi: '#f0d0b0',
    hair: '#5a3a24', hairShade: '#2a1810',
    hairStyle: 'wavy', age: 'mid',
    bodyColor: '#2a1818', bodyShade: '#160a0a',
    expression: 'serious',
  }),
  // 8 — Charlie Munger · older, balding white hair, thick round glasses, serious
  _persona(8, 'Charlie Munger', 'Inversion · Red-team', {
    bgFromHue: 50, bgFromChroma: 0.08, bgToHue: 50, bgToChroma: 0.06,
    skin: '#e6c0a0', skinShade: '#b88868', skinHi: '#f0d0b0',
    hair: '#dddddd', hairShade: '#aaaaaa',
    hairStyle: 'balding', age: 'older',
    bodyColor: '#1f1f24', bodyShade: '#0e0e12',
    glasses: 'thick-round',
    expression: 'serious',
  }),
  // 9 — Jamie Dimon · grey side-part, bank CEO, serious
  _persona(9, 'Jamie Dimon', 'Banking · Credit', {
    bgFromHue: 220, bgFromChroma: 0.10, bgToHue: 220, bgToChroma: 0.06,
    skin: '#e8c4a0', skinShade: '#b88868', skinHi: '#f0d0b0',
    hair: '#bbbbbb', hairShade: '#7a7a7a',
    hairStyle: 'grey-side', age: 'older',
    bodyColor: '#0e1830', bodyShade: '#06091a',
    expression: 'serious',
  }),
  // 10 — Seth Klarman · grey side hair, value investor with round glasses
  _persona(10, 'Seth Klarman', 'Deep Value', {
    bgFromHue: 180, bgFromChroma: 0.08, bgToHue: 180, bgToChroma: 0.06,
    skin: '#e8c4a0', skinShade: '#b88868', skinHi: '#f0d0b0',
    hair: '#aaaaaa', hairShade: '#777',
    hairStyle: 'grey-side', age: 'older',
    bodyColor: '#162828', bodyShade: '#0a1414',
    glasses: 'round',
    expression: 'thoughtful',
  }),
];

function Avatar({ i, size = 52 }) {
  const p = Personas[i % Personas.length];
  return <div style={{width: size, height: size, borderRadius: '50%', overflow: 'hidden'}}
    dangerouslySetInnerHTML={{__html: p.svg.replace('viewBox="0 0 72 72"', 'viewBox="0 0 72 72" width="100%" height="100%"')}} />;
}

Object.assign(window, { Personas, Avatar });
