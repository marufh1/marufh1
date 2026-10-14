// Generates the custom SVG artwork used by README.md.
// Usage: node scripts/build-assets.mjs   (Node 18+, no dependencies)
//
// Every fact here comes from the CV / portfolio at https://marufh1.github.io —
// keep them in sync when either changes.

import { mkdir, writeFile, rm } from "node:fs/promises";

const OUT = new URL("../assets/", import.meta.url);
const PORTFOLIO = "https://marufh1.github.io";
const USER = "marufh1";

const C = {
  bg: "#0d1117",
  bg2: "#111827",
  card: "#161b22",
  border: "#30363d",
  line: "#21262d",
  text: "#e6edf3",
  soft: "#c9d1d9",
  muted: "#8b949e",
  dim: "#484f58",
  blue: "#58a6ff",
  purple: "#a371f7",
  green: "#3fb950",
  orange: "#f78166",
  pink: "#f778ba",
};

const SANS = `'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif`;
const MONO = `'JetBrains Mono', 'Fira Code', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Rough text width for the sans stack — good enough for layout and wrapping.
const textW = (s, size, bold = false) => s.length * size * (bold ? 0.56 : 0.52);
const monoW = (s, size) => s.length * size * 0.55;

function wrap(s, size, maxW) {
  const lines = [];
  let cur = "";
  for (const word of s.split(" ")) {
    const next = cur ? `${cur} ${word}` : word;
    if (textW(next, size) > maxW && cur) {
      lines.push(cur);
      cur = word;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

const svg = (w, h, body, title) => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
${body}
</svg>
`;

// Shared card frame: dark rounded panel with an optional dot grid and a hairline border.
function frame(w, h, id, inner, { grid = true, rx = 20 } = {}) {
  return `
<defs>
  <linearGradient id="${id}-bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${C.bg}"/><stop offset="1" stop-color="${C.bg2}"/>
  </linearGradient>
  <pattern id="${id}-dots" width="22" height="22" patternUnits="userSpaceOnUse">
    <circle cx="1.5" cy="1.5" r="1.2" fill="#ffffff" fill-opacity=".06"/>
  </pattern>
  <clipPath id="${id}-clip"><rect width="${w}" height="${h}" rx="${rx}"/></clipPath>
</defs>
<g clip-path="url(#${id}-clip)">
  <rect width="${w}" height="${h}" fill="url(#${id}-bg)"/>
  ${grid ? `<rect width="${w}" height="${h}" fill="url(#${id}-dots)"/>` : ""}
  ${inner}
</g>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${rx}" stroke="${C.border}"/>`;
}

const glow = (id, color, opacity = 0.25) =>
  `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${opacity}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;

// Pill-shaped chip with a colored dot; returns { el, w }.
function chip(x, y, label, color, { size = 14, h = 30 } = {}) {
  const w = label.length * size * 0.58 + 38;
  return {
    w,
    el: `<g transform="translate(${x} ${y})">
      <rect width="${w}" height="${h}" rx="${h / 2}" fill="#ffffff" fill-opacity=".04" stroke="${C.border}"/>
      ${color ? `<circle cx="15" cy="${h / 2}" r="4.5" fill="${color}"/>` : ""}
      <text x="${color ? 26 : w / 2}" y="${h / 2 + size * 0.36}" ${color ? "" : `text-anchor="middle"`} fill="${C.soft}" font-family="${SANS}" font-size="${size}">${esc(label)}</text>
    </g>`,
  };
}

function chipRow(x, y, items, opts = {}) {
  let cx = x;
  return items.map(([label, color]) => {
    const c = chip(cx, y, label, color, opts);
    cx += c.w + 8;
    return c.el;
  }).join("\n");
}

async function fetchBuf(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}
const fetchText = async (url) => (await fetchBuf(url)).toString("utf8");
const dataUri = async (url, type) => `data:${type};base64,${(await fetchBuf(url)).toString("base64")}`;

const STACK_COLORS = {
  "ASP.NET Core": "#512BD4", "ASP.NET MVC": "#512BD4", "C#": "#178600", "SQL Server": "#CC2927",
  React: "#61DAFB", "REST APIs": C.blue, "Node.js": "#3fb950", TypeScript: "#3178C6",
  PostgreSQL: "#4169E1", MongoDB: "#47A248", Azure: "#0089D6", "Web Forms": "#8b949e",
  NestJS: "#E0234E", Prisma: "#a5b4fc", PWA: "#5A0FC8", Playwright: "#2EAD33",
  "Next.js": "#e6edf3", Fastify: "#e6edf3", Turborepo: "#EF4444", Mapbox: "#4264FB",
  "Socket.io": "#e6edf3", "Stored Procedures": "#CC2927",
};
const stackChips = (names) => names.map((n) => [n, STACK_COLORS[n] || C.muted]);

/* ───────────────────────────── HERO ───────────────────────────── */

function hero() {
  const W = 1200, H = 420;
  const kw = "#ff7b72", fn = "#d2a8ff", prop = "#79c0ff", str = "#a5d6ff", cm = C.muted, pl = C.soft;
  const code = [
    [0, [["const ", kw], ["maruf", fn], [" = {", pl]]],
    [1, [["role", prop], [": ", pl], ['"Senior Software Engineer"', str], [",", pl]]],
    [1, [["company", prop], [": ", pl], ['"Grapes Technology"', str], [",", pl]]],
    [1, [["experience", prop], [": ", pl], ['"6+ years"', str], [",", pl]]],
    [1, [["stack", prop], [": [", pl], ['".NET"', str], [", ", pl], ['"SQL Server"', str], [", ", pl], ['"React"', str], [", ", pl], ['"Node"', str], ["],", pl]]],
    [1, [["building", prop], [": [", pl], ['"fintech"', str], [", ", pl], ['"products"', str], ["],", pl]]],
    [0, [["};", pl]]],
    [0, [["maruf", fn], [".", pl], ["ship", fn], ["(); ", pl], ["// reliable systems", cm]]],
  ];
  const cx = 632, cy = 62, cw = 508, ch = 296, fs = 14.5;
  const lineH = 27.5, codeX = cx + 54, codeY = cy + 82;
  const codeLines = code.map(([indent, parts], i) => {
    const d = (0.5 + i * 0.3).toFixed(2);
    const spans = parts.map(([t, col]) => `<tspan fill="${col}">${esc(t)}</tspan>`).join("");
    return `<g class="ln" style="animation-delay:${d}s">
      <text x="${cx + 22}" y="${codeY + i * lineH}" fill="${C.dim}" font-family="${MONO}" font-size="13">${i + 1}</text>
      <text x="${codeX + indent * 20}" y="${codeY + i * lineH}" font-family="${MONO}" font-size="${fs}" xml:space="preserve">${spans}</text>
    </g>`;
  }).join("\n");
  const last = code.at(-1)[1].map(([t]) => t).join("");
  const caretX = codeX + monoW(last, fs) + 6;
  const caretY = codeY + (code.length - 1) * lineH;

  const status = "Open to remote roles";
  const pillW = textW(status, 13.5, true) + 46;

  const inner = `
  <defs>
    ${glow("h-orb1", C.blue, 0.35)}
    ${glow("h-orb2", C.purple, 0.32)}
    <linearGradient id="h-name" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#cfe3ff"/><stop offset="1" stop-color="${C.blue}"/>
    </linearGradient>
    <linearGradient id="h-bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.blue}"/><stop offset="1" stop-color="${C.purple}"/>
    </linearGradient>
  </defs>
  <style>
    .orb1 { animation: drift1 14s ease-in-out infinite alternate; }
    .orb2 { animation: drift2 18s ease-in-out infinite alternate; }
    @keyframes drift1 { to { transform: translate(120px, 40px); } }
    @keyframes drift2 { to { transform: translate(-140px, -30px); } }
    .ln { opacity: 0; animation: type .45s ease-out forwards; }
    @keyframes type { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: none; } }
    .caret { animation: blink 1s steps(1) infinite; }
    @keyframes blink { 50% { opacity: 0; } }
    .pulse { transform-origin: 88px 96px; animation: pulse 2s ease-out infinite; }
    @keyframes pulse { 0% { opacity: .7; transform: scale(1); } 100% { opacity: 0; transform: scale(2.6); } }
    .fade { opacity: 0; animation: type .6s ease-out forwards; }
  </style>

  <ellipse class="orb1" cx="260" cy="120" rx="360" ry="260" fill="url(#h-orb1)"/>
  <ellipse class="orb2" cx="980" cy="360" rx="380" ry="260" fill="url(#h-orb2)"/>
  <rect width="${W}" height="4" fill="url(#h-bar)"/>

  <g class="fade" style="animation-delay:.1s">
    <rect x="70" y="80" width="${pillW}" height="32" rx="16" fill="${C.green}" fill-opacity=".1" stroke="${C.green}" stroke-opacity=".45"/>
    <circle class="pulse" cx="88" cy="96" r="5" fill="${C.green}"/>
    <circle cx="88" cy="96" r="5" fill="${C.green}"/>
    <text x="102" y="101" fill="#7ee787" font-family="${SANS}" font-size="13.5" font-weight="600">${status}</text>
  </g>

  <g class="fade" style="animation-delay:.2s">
    <text x="70" y="156" fill="${C.muted}" font-family="${MONO}" font-size="17">Hello, world — I'm</text>
    <text x="68" y="220" fill="url(#h-name)" font-family="${SANS}" font-size="66" font-weight="800" letter-spacing="-1.5">Maruf Hossain</text>
  </g>
  <g class="fade" style="animation-delay:.35s">
    <text x="70" y="264" fill="${C.text}" font-family="${SANS}" font-size="25" font-weight="600">Senior Software Engineer<tspan fill="${C.muted}" font-weight="400">  ·  </tspan>Full-Stack</text>
    <text x="70" y="298" font-family="${SANS}" font-size="18" font-weight="600">
      <tspan fill="${C.blue}">.NET &amp; SQL Server</tspan><tspan fill="${C.dim}" font-weight="400">   /   </tspan><tspan fill="${C.purple}">Node.js &amp; React</tspan>
    </text>
  </g>
  <g class="fade" style="animation-delay:.5s">${chipRow(70, 326, [["6+ years", null], ["Fintech & products", null], ["Dhaka · UTC+6", null]], { size: 14, h: 32 })}</g>

  <g class="fade" style="animation-delay:.25s">
    <rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="14" fill="${C.bg}" fill-opacity=".85" stroke="${C.border}"/>
    <path d="M${cx} ${cy + 14}a14 14 0 0 1 14-14h${cw - 28}a14 14 0 0 1 14 14v26h-${cw}z" fill="${C.card}"/>
    <line x1="${cx}" y1="${cy + 40}" x2="${cx + cw}" y2="${cy + 40}" stroke="${C.border}"/>
    <circle cx="${cx + 22}" cy="${cy + 20}" r="6" fill="#ff5f57"/>
    <circle cx="${cx + 42}" cy="${cy + 20}" r="6" fill="#febc2e"/>
    <circle cx="${cx + 62}" cy="${cy + 20}" r="6" fill="#28c840"/>
    <text x="${cx + cw / 2}" y="${cy + 25}" text-anchor="middle" fill="${C.muted}" font-family="${MONO}" font-size="13">maruf.ts</text>
  </g>
  ${codeLines}
  <rect class="caret" x="${caretX}" y="${caretY - 14}" width="9" height="18" fill="${C.blue}"/>`;
  return svg(W, H, frame(W, H, "h", inner, { rx: 22 }), "Maruf Hossain — Senior Software Engineer, Full-Stack (.NET & SQL Server / Node.js & React)");
}

/* ─────────────────────────── HIGHLIGHTS ─────────────────────────── */

function highlights() {
  const W = 1200, H = 150, gap = 16, pad = 0;
  const items = [
    ["6+", "years shipping", "production systems", C.blue],
    ["3", "engineering teams", "Bangladesh & Australia", C.purple],
    ["2", "independent products", "built solo — live today", C.green],
    ["2", "stacks in depth", ".NET  ·  Node.js / React", C.orange],
  ];
  const tw = (W - pad * 2 - gap * (items.length - 1)) / items.length;
  const tiles = items.map(([num, a, b, col], i) => {
    const x = pad + i * (tw + gap);
    return `<g transform="translate(${x} 0)">
      ${frame(tw, H, `s${i}`, `<ellipse cx="${tw}" cy="0" rx="160" ry="110" fill="url(#s-glow${i})"/><rect width="${tw}" height="3" fill="${col}"/>`, { grid: false, rx: 16 })}
      <text x="28" y="78" fill="${col}" font-family="${SANS}" font-size="52" font-weight="800" letter-spacing="-1">${esc(num)}</text>
      <text x="${28 + textW(num, 52, true) + 16}" y="58" fill="${C.text}" font-family="${SANS}" font-size="17" font-weight="600">${esc(a)}</text>
      <text x="${28 + textW(num, 52, true) + 16}" y="80" fill="${C.muted}" font-family="${SANS}" font-size="14.5">${esc(b)}</text>
      <rect x="28" y="106" width="${tw - 56}" height="1" fill="${C.line}"/>
      <text x="28" y="130" fill="${C.dim}" font-family="${MONO}" font-size="12" letter-spacing="1.5">${["EXPERIENCE", "TEAMS", "PRODUCTS", "DUAL-STACK"][i]}</text>
    </g>`;
  }).join("\n");
  const defs = `<defs>${items.map(([, , , col], i) => glow(`s-glow${i}`, col, 0.18)).join("")}</defs>`;
  return svg(W, H, defs + tiles, "6+ years in production · 3 engineering teams · 2 live independent products · .NET and Node.js/React");
}

/* ─────────────────────────── EXPERIENCE ─────────────────────────── */

const EXPERIENCE = [
  {
    role: "Senior Software Engineer",
    company: "Grapes Technology",
    where: "Dhaka, Bangladesh",
    when: "Dec 2025 — Present",
    current: true,
    color: C.blue,
    points: [
      "Architecting and maintaining a high-performance microfinance platform on ASP.NET Core, C#, SQL Server and React.",
      "Optimizing SQL queries, indexing strategies and stored procedures — reducing execution time on critical reports.",
      "Integrating mobile financial service providers, including Safaricom M-Pesa and GeePay.",
    ],
    stack: ["ASP.NET Core", "C#", "SQL Server", "React", "REST APIs"],
  },
  {
    role: "Senior Software Engineer / Team Lead",
    company: "Siara Solutions Pty Ltd.",
    where: "Remote · Liverpool, NSW, Australia",
    when: "Jul 2022 — Nov 2025",
    color: C.purple,
    points: [
      "Led full-stack development in React, Node.js and TypeScript for car rental, food-ordering and tutoring platforms.",
      "Engineered real-time chat with WebSocket / Socket.io and secure Jitsi video conferencing for online tutoring.",
      "Built backends on PostgreSQL and MongoDB; integrated Brevo, Infobip and Mapbox for messaging and maps.",
    ],
    stack: ["React", "Node.js", "TypeScript", "PostgreSQL", "MongoDB", "Azure"],
  },
  {
    role: "Software Engineer",
    company: "Advanced Software and IT Services Ltd.",
    where: "Dhaka, Bangladesh",
    when: "Mar 2019 — Jun 2022",
    color: C.green,
    points: [
      "Built the land survey web application settlement.gov.bd on ASP.NET MVC, integrated with government web services.",
      "Developed land case and audit management systems on ASP.NET Core and SQL Server with stored procedures.",
      "Extended an ERP with leave and duty-shift modules; mentored junior developers alongside the CTO.",
    ],
    stack: ["ASP.NET Core", "ASP.NET MVC", "C#", "SQL Server", "Web Forms"],
  },
];

function experience() {
  const W = 1200, pad = 32, railX = 56, cardX = 92, cardW = W - cardX - pad;
  const bSize = 17, bLH = 26, textMax = cardW - 64;
  let y = pad;
  const cards = EXPERIENCE.map((e, i) => {
    const bullets = e.points.map((p) => wrap(p, bSize, textMax));
    const bodyH = bullets.reduce((a, l) => a + l.length * bLH, 0) + (bullets.length - 1) * 6;
    const h = 92 + bodyH + 64;
    const top = y;
    y += h + 20;
    let by = top + 112;
    const pts = bullets.map((lines) => {
      const el = `<circle cx="${cardX + 38}" cy="${by - 6}" r="3" fill="${e.color}"/>` +
        lines.map((l, k) => `<text x="${cardX + 54}" y="${by + k * bLH}" fill="${C.soft}" font-family="${SANS}" font-size="${bSize}">${esc(l)}</text>`).join("");
      by += lines.length * bLH + 6;
      return el;
    }).join("\n");
    const whenW = monoW(e.when, 13) + 28;
    return `<g>
      <circle cx="${railX}" cy="${top + 40}" r="9" fill="${C.bg}" stroke="${e.color}" stroke-width="3"/>
      ${e.current ? `<circle class="pulse" cx="${railX}" cy="${top + 40}" r="9" fill="${e.color}"/>` : `<circle cx="${railX}" cy="${top + 40}" r="3.5" fill="${e.color}"/>`}
      <rect x="${cardX}" y="${top}" width="${cardW}" height="${h}" rx="16" fill="#ffffff" fill-opacity=".025" stroke="${C.line}"/>
      <rect x="${cardX}" y="${top + 20}" width="3" height="44" rx="1.5" fill="${e.color}"/>
      <text x="${cardX + 30}" y="${top + 44}" fill="${C.text}" font-family="${SANS}" font-size="23" font-weight="700">${esc(e.role)}</text>
      <text x="${cardX + 30}" y="${top + 72}" font-family="${SANS}" font-size="16.5"><tspan fill="${e.color}" font-weight="600">${esc(e.company)}</tspan><tspan fill="${C.muted}">   ·   ${esc(e.where)}</tspan></text>
      <g transform="translate(${cardX + cardW - 28 - whenW} ${top + 24})">
        <rect width="${whenW}" height="30" rx="15" fill="${e.color}" fill-opacity="${e.current ? ".14" : ".06"}" stroke="${e.color}" stroke-opacity="${e.current ? ".5" : ".25"}"/>
        <text x="${whenW / 2}" y="20" text-anchor="middle" fill="${e.current ? e.color : C.soft}" font-family="${MONO}" font-size="13">${esc(e.when)}</text>
      </g>
      ${pts}
      ${chipRow(cardX + 30, top + h - 50, stackChips(e.stack), { size: 13.5, h: 30 })}
    </g>`;
  });
  const H = y - 20 + pad;
  const inner = `
  <style>
    .pulse { transform-box: fill-box; transform-origin: center; animation: pulse 2s ease-out infinite; }
    @keyframes pulse { 0% { opacity: .6; transform: scale(1); } 100% { opacity: 0; transform: scale(2.4); } }
  </style>
  <defs><linearGradient id="x-rail" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${C.blue}"/><stop offset=".5" stop-color="${C.purple}"/><stop offset="1" stop-color="${C.green}" stop-opacity=".2"/>
  </linearGradient></defs>
  <rect x="${railX - 1}" y="${pad + 40}" width="2" height="${H - pad * 2 - 60}" fill="url(#x-rail)" opacity=".6"/>
  ${cards.join("\n")}`;
  const alt = EXPERIENCE.map((e) => `${e.role} at ${e.company} (${e.when})`).join("; ");
  return svg(W, H, frame(W, H, "x", inner, { grid: false }), `Experience: ${alt}`);
}

/* ─────────────────────────── PRODUCTS ─────────────────────────── */

const PRODUCTS = [
  {
    file: "jogan",
    name: "Jogan",
    mark: "J",
    markBg: "#f472b6",
    markFg: "#1a0b12",
    tag: "ISP BILLING  ·  SAAS",
    accent: C.pink,
    status: "Live · looking for pilot ISPs",
    url: "jogan-web.vercel.app",
    pitch: "Small internet providers in Bangladesh still run on paper ledgers, spreadsheets and WhatsApp. Jogan puts subscribers, bills, payments and complaints in one app — in Bangla and English.",
    points: [
      "Offline-first collector app — a payment is recorded exactly once, even when a phone retries it",
      "Tenant isolation enforced in the database itself, not only in code",
      "bKash / Nagad payments, MikroTik router check and a coverage map",
    ],
    stack: ["React", "NestJS", "PostgreSQL", "Prisma", "PWA", "Playwright"],
    desktop: "jogan-dashboard-800.webp",
    mobile: "jogan-mobile-360.webp",
  },
  {
    file: "khujenao",
    name: "KhujeNao",
    mark: "K",
    markBg: "#d9f99d",
    markFg: "#1a2e05",
    tag: "HOME RENTALS  ·  MARKETPLACE",
    accent: "#a3e635",
    status: "Live · starting in Feni",
    url: "ghorly-web.vercel.app",
    pitch: "Finding a flat in Feni still means TO-LET signs, old Facebook posts and calling number after number. KhujeNao shows the rent, who posted it and when it was last confirmed — before you call.",
    points: [
      "Search by area, rent and bedrooms — as a list or on a map",
      "Listings expire unless owners re-confirm, so results stay fresh",
      "Server-rendered PWA for cheap phones; sign in with passkeys, Google or email code",
    ],
    stack: ["Next.js", "Fastify", "PostgreSQL", "Prisma", "Turborepo", "Mapbox"],
    desktop: "khujenao-home-800.webp",
    mobile: "khujenao-mobile-360.webp",
  },
];

async function productCard(p) {
  const W = 1200, id = `p-${p.file}`;
  const leftX = 48, leftW = 520;
  const desktop = await dataUri(`${PORTFOLIO}/assets/img/projects/${p.desktop}`, "image/webp");
  const mobile = await dataUri(`${PORTFOLIO}/assets/img/projects/${p.mobile}`, "image/webp");

  // Left column
  const pitch = wrap(p.pitch, 16.5, leftW);
  let y = 196;
  const pitchEl = pitch.map((l, i) => `<text x="${leftX}" y="${y + i * 25}" fill="${C.muted}" font-family="${SANS}" font-size="16.5">${esc(l)}</text>`).join("");
  y += pitch.length * 25 + 18;
  const pts = p.points.map((pt) => {
    const lines = wrap(pt, 15.5, leftW - 20);
    const el = `<path d="M${leftX} ${y - 9}l4 4 8-9" stroke="${p.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` +
      lines.map((l, k) => `<text x="${leftX + 24}" y="${y + k * 23}" fill="${C.soft}" font-family="${SANS}" font-size="15.5">${esc(l)}</text>`).join("");
    y += lines.length * 23 + 10;
    return el;
  }).join("\n");
  const statusW = textW(p.status, 13, true) + 40;
  const chipsY = y + 6, linkY = chipsY + 66;

  // Right column: browser frame + phone frame
  const bx = 612, by = 44, bw = 548, bh = 34 + 548 * (500 / 800);
  const H = Math.max(600, linkY + 40);
  const px = 1030, py = by + bh - 190, pw = 138, ph = 138 * (780 / 360);

  const inner = `
  <defs>
    ${glow(`${id}-g1`, p.accent, 0.22)}
    ${glow(`${id}-g2`, C.blue, 0.14)}
    <clipPath id="${id}-shot"><rect x="${bx}" y="${by + 34}" width="${bw}" height="${bh - 34}" rx="0"/></clipPath>
    <clipPath id="${id}-phone"><rect x="${px + 6}" y="${py + 6}" width="${pw - 12}" height="${ph - 12}" rx="18"/></clipPath>
    <clipPath id="${id}-win"><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="12"/></clipPath>
  </defs>
  <ellipse cx="${W - 120}" cy="${H}" rx="520" ry="320" fill="url(#${id}-g1)"/>
  <ellipse cx="80" cy="0" rx="420" ry="260" fill="url(#${id}-g2)"/>
  <rect width="${W}" height="3" fill="${p.accent}"/>

  <!-- identity -->
  <rect x="${leftX}" y="44" width="52" height="52" rx="14" fill="${p.markBg}"/>
  <text x="${leftX + 26}" y="80" text-anchor="middle" fill="${p.markFg}" font-family="${SANS}" font-size="28" font-weight="800">${p.mark}</text>
  <text x="${leftX + 68}" y="66" fill="${p.accent}" font-family="${MONO}" font-size="12.5" font-weight="700" letter-spacing="1.6">${esc(p.tag)}</text>
  <text x="${leftX + 68}" y="94" fill="${C.text}" font-family="${SANS}" font-size="30" font-weight="800" letter-spacing="-.5">${esc(p.name)}</text>
  <g transform="translate(${leftX} 124)">
    <rect width="${statusW}" height="30" rx="15" fill="${C.green}" fill-opacity=".1" stroke="${C.green}" stroke-opacity=".45"/>
    <circle cx="16" cy="15" r="4.5" fill="${C.green}"/>
    <text x="28" y="20" fill="#7ee787" font-family="${SANS}" font-size="13" font-weight="600">${esc(p.status)}</text>
  </g>
  <text x="${leftX + statusW + 14}" y="144" fill="${C.muted}" font-family="${MONO}" font-size="13">Independent product · solo build</text>

  ${pitchEl}
  ${pts}
  ${chipRow(leftX, chipsY, stackChips(p.stack), { size: 13.5, h: 30 })}
  <text x="${leftX}" y="${linkY}" font-family="${SANS}" font-size="15.5" font-weight="600"><tspan fill="${C.blue}">See it live  ↗</tspan><tspan fill="${C.dim}" font-family="${MONO}" font-size="13" font-weight="400">   ${esc(p.url)}</tspan></text>

  <!-- browser -->
  <g>
    <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="12" fill="${C.card}" stroke="${C.border}"/>
    <g clip-path="url(#${id}-win)">
      <rect x="${bx}" y="${by}" width="${bw}" height="34" fill="${C.card}"/>
      <image x="${bx}" y="${by + 34}" width="${bw}" height="${bh - 34}" preserveAspectRatio="xMidYMin slice" href="${desktop}" xlink:href="${desktop}"/>
    </g>
    <circle cx="${bx + 18}" cy="${by + 17}" r="5" fill="#ff5f57"/>
    <circle cx="${bx + 34}" cy="${by + 17}" r="5" fill="#febc2e"/>
    <circle cx="${bx + 50}" cy="${by + 17}" r="5" fill="#28c840"/>
    <rect x="${bx + 140}" y="${by + 8}" width="${bw - 280}" height="18" rx="9" fill="${C.bg}"/>
    <text x="${bx + bw / 2}" y="${by + 21}" text-anchor="middle" fill="${C.muted}" font-family="${MONO}" font-size="11">${esc(p.url)}</text>
    <rect x="${bx + .5}" y="${by + .5}" width="${bw - 1}" height="${bh - 1}" rx="12" stroke="${C.border}"/>
  </g>
  <!-- phone -->
  <g>
    <rect x="${px - 2}" y="${py + 10}" width="${pw + 4}" height="${ph}" rx="26" fill="#000" opacity=".45"/>
    <rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="24" fill="#05070a" stroke="#3b434d" stroke-width="1.5"/>
    <image x="${px + 6}" y="${py + 6}" width="${pw - 12}" height="${ph - 12}" preserveAspectRatio="xMidYMin slice" clip-path="url(#${id}-phone)" href="${mobile}" xlink:href="${mobile}"/>
  </g>`;
  return svg(W, H, frame(W, H, id, inner, { grid: true }), `${p.name} — ${p.pitch}`);
}

/* ─────────────────────────── SELECTED WORK ─────────────────────────── */

const WORK = [
  {
    file: "fintech-platform",
    title: "Fintech Transaction Platform",
    tag: "FINANCIAL SYSTEMS",
    accent: C.blue,
    desc: ["Transaction & reporting modules on SQL Server,", "with Safaricom M-Pesa and GeePay integrations."],
    stack: ["ASP.NET Core", "SQL Server", "React"],
  },
  {
    file: "rental-food-platforms",
    title: "Car Rental & Food Ordering",
    tag: "PRODUCT PLATFORMS · TEAM LEAD",
    accent: C.purple,
    desc: ["Three consumer products on one Node.js API layer —", "real-time chat, maps and video conferencing."],
    stack: ["React", "Node.js", "PostgreSQL", "MongoDB"],
  },
  {
    file: "land-administration",
    title: "Government Land Systems",
    tag: "PUBLIC SECTOR",
    accent: C.green,
    desc: ["settlement.gov.bd land survey platform and a", "land case management system for government."],
    stack: ["ASP.NET MVC", "SQL Server"],
  },
  {
    file: "audit-erp",
    title: "Audit, ERP & Workflow",
    tag: "ENTERPRISE WORKFLOW",
    accent: C.orange,
    desc: ["Audit management plus leave and duty-shift", "modules for an existing enterprise ERP."],
    stack: ["ASP.NET Core", "Stored Procedures", "Web Forms"],
  },
];

function workCard(p) {
  const W = 600, H = 230, id = `w-${p.file}`;
  const inner = `
  <defs>${glow(`${id}-glow`, p.accent, 0.22)}</defs>
  <ellipse cx="${W - 40}" cy="10" rx="240" ry="150" fill="url(#${id}-glow)"/>
  <rect width="${W}" height="3" fill="${p.accent}"/>
  <g transform="translate(32 34)" stroke="${C.muted}" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <rect x="1" y="4" width="20" height="15" rx="2.5"/><path d="M7 4V2.5A1.5 1.5 0 0 1 8.5 1h5A1.5 1.5 0 0 1 15 2.5V4M1 10h20"/>
  </g>
  <text x="62" y="51" fill="${p.accent}" font-family="${MONO}" font-size="12.5" font-weight="700" letter-spacing="1.6">${esc(p.tag)}</text>
  <text x="32" y="96" fill="${C.text}" font-family="${SANS}" font-size="27" font-weight="700" letter-spacing="-.3">${esc(p.title)}</text>
  <text font-family="${SANS}" font-size="16" fill="${C.muted}">
    <tspan x="32" y="128">${esc(p.desc[0])}</tspan>
    <tspan x="32" y="151">${esc(p.desc[1])}</tspan>
  </text>
  ${chipRow(32, 176, stackChips(p.stack), { size: 13, h: 28 })}
  <g transform="translate(${W - 66} 28)">
    <rect width="38" height="38" rx="19" fill="#ffffff" fill-opacity=".05" stroke="${C.border}"/>
    <path d="M14 24l10-10M16 14h8v8" stroke="${C.text}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;
  return svg(W, H, frame(W, H, id, inner, { grid: false, rx: 18 }), `${p.title} — ${p.desc.join(" ")}`);
}

/* ─────────────────────────── TECH STACK ─────────────────────────── */

const STACK = [
  ["Languages", [["cs", "C#"], ["ts", "TypeScript"], ["js", "JavaScript"], ["html", "HTML5"], ["css", "CSS3"]]],
  ["Backend", [["dotnet", "ASP.NET Core"], ["nodejs", "Node.js"], ["nestjs", "NestJS"], ["express", "Express"]]],
  ["Frontend", [["react", "React"], ["nextjs", "Next.js"], ["redux", "Redux"], ["tailwind", "Tailwind"], ["materialui", "MUI"], ["vite", "Vite"]]],
  ["Data", [["@sqlserver", "SQL Server"], ["postgres", "PostgreSQL"], ["mongodb", "MongoDB"], ["prisma", "Prisma"]]],
  ["Cloud & DevOps", [["azure", "Azure DevOps"], ["githubactions", "Actions"], ["docker", "Docker"], ["vercel", "Vercel"]]],
  ["Testing & Tools", [["vitest", "Vitest"], ["git", "Git"], ["postman", "Postman"], ["visualstudio", "Visual Studio"], ["vscode", "VS Code"]]],
];
const INTEGRATIONS = ["M-Pesa", "GeePay", "bKash / Nagad", "Socket.io", "Jitsi", "Brevo", "Infobip", "Mapbox", "MikroTik RouterOS", "Passkeys"];

let uid = 0;
// Make every id inside an embedded icon unique so icons can't clash.
function scopeIds(markup) {
  const p = `i${uid++}-`;
  return markup
    .replace(/id="([^"]+)"/g, `id="${p}$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${p}$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${p}$1"`);
}

async function iconInner(id) {
  if (id === "@sqlserver") {
    const dev = await fetchText("https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/microsoftsqlserver/microsoftsqlserver-plain.svg");
    const paths = dev.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
    return `<rect width="256" height="256" rx="60" fill="#242938"/><svg x="40" y="40" width="176" height="176" viewBox="0 0 128 128">${paths.replace(/#ee352c/gi, "#f0483e")}</svg>`;
  }
  const raw = await fetchText(`https://skillicons.dev/icons?i=${id}`);
  // A single skillicons icon is a 256×256 root <svg>; keep everything inside it.
  if (!/viewBox="0 0 256 256"/.test(raw.slice(0, 300))) throw new Error(`Unexpected skillicons markup for ${id}`);
  return raw.trim().replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
}

async function techStack() {
  const W = 1200, pad = 32, gap = 18;
  const colW = (W - pad * 2 - gap) / 2;
  const tile = 54, step = 82, groupH = 152;
  const rows = Math.ceil(STACK.length / 2);
  const intY = pad + rows * (groupH + gap);
  const H = intY + 110 + pad;

  const groups = [];
  for (let gi = 0; gi < STACK.length; gi++) {
    const [label, items] = STACK[gi];
    const gx = pad + (gi % 2) * (colW + gap);
    const gy = pad + Math.floor(gi / 2) * (groupH + gap);
    const icons = [];
    for (let k = 0; k < items.length; k++) {
      const [id, name] = items[k];
      const ix = gx + 22 + k * step + (step - tile) / 2;
      const iy = gy + 52;
      icons.push(`<svg x="${ix}" y="${iy}" width="${tile}" height="${tile}" viewBox="0 0 256 256">${scopeIds(await iconInner(id))}</svg>
      <text x="${ix + tile / 2}" y="${iy + tile + 22}" text-anchor="middle" fill="${C.muted}" font-family="${SANS}" font-size="12.5">${esc(name)}</text>`);
    }
    const accent = [C.blue, C.purple][gi % 2];
    groups.push(`<g>
      <rect x="${gx}" y="${gy}" width="${colW}" height="${groupH}" rx="16" fill="#ffffff" fill-opacity=".025" stroke="${C.line}"/>
      <rect x="${gx + 24}" y="${gy + 22}" width="4" height="16" rx="2" fill="${accent}"/>
      <text x="${gx + 38}" y="${gy + 35}" fill="${C.text}" font-family="${MONO}" font-size="14" font-weight="700" letter-spacing="1.5">${esc(label.toUpperCase())}</text>
      <text x="${gx + colW - 24}" y="${gy + 35}" text-anchor="end" fill="${C.dim}" font-family="${MONO}" font-size="13">${String(items.length).padStart(2, "0")}</text>
      ${icons.join("\n")}
    </g>`);
  }
  groups.push(`<g>
    <rect x="${pad}" y="${intY}" width="${W - pad * 2}" height="110" rx="16" fill="#ffffff" fill-opacity=".025" stroke="${C.line}"/>
    <rect x="${pad + 24}" y="${intY + 22}" width="4" height="16" rx="2" fill="${C.green}"/>
    <text x="${pad + 38}" y="${intY + 35}" fill="${C.text}" font-family="${MONO}" font-size="14" font-weight="700" letter-spacing="1.5">INTEGRATIONS I'VE SHIPPED</text>
    ${chipRow(pad + 24, intY + 58, INTEGRATIONS.map((n) => [n, C.green]), { size: 14, h: 32 })}
  </g>`);
  return svg(W, H, frame(W, H, "t", groups.join("\n")), `Tech stack — ${STACK.map(([l, i]) => `${l}: ${i.map((x) => x[1]).join(", ")}`).join("; ")}; Integrations: ${INTEGRATIONS.join(", ")}`);
}

/* ─────────────────────────── EDUCATION ─────────────────────────── */

function education() {
  const W = 1200, H = 176, gap = 16;
  const items = [
    ["M.Sc.", "Computer Science & Engineering", "Bangladesh University of Professionals (BUP)", "2025", null, C.blue],
    ["B.Sc.", "Computer Science & Engineering", "Bangladesh University of Business and Technology", "2022", "CGPA 3.95 / 4.00", C.purple],
    ["Diploma", "Data Telecommunication & Networking", "Feni Computer Institute", "2017", "CGPA 3.52 / 4.00", C.green],
  ];
  const tw = (W - gap * 2) / 3;
  const tiles = items.map(([deg, field, school, year, gpa, col], i) => {
    const schoolLines = wrap(school, 14.5, tw - 56);
    return `<g transform="translate(${i * (tw + gap)} 0)">
      ${frame(tw, H, `e${i}`, `<rect width="${tw}" height="3" fill="${col}"/>`, { grid: false, rx: 16 })}
      <text x="28" y="46" fill="${col}" font-family="${MONO}" font-size="13" font-weight="700" letter-spacing="1.5">${esc(deg.toUpperCase())}</text>
      <text x="${tw - 28}" y="46" text-anchor="end" fill="${C.muted}" font-family="${MONO}" font-size="13">${year}</text>
      <text x="28" y="78" fill="${C.text}" font-family="${SANS}" font-size="18" font-weight="700">${esc(field)}</text>
      ${schoolLines.map((l, k) => `<text x="28" y="${106 + k * 21}" fill="${C.muted}" font-family="${SANS}" font-size="14.5">${esc(l)}</text>`).join("")}
      ${gpa ? `<text x="28" y="152" fill="${C.soft}" font-family="${MONO}" font-size="13">${gpa}</text>` : ""}
    </g>`;
  }).join("\n");
  return svg(W, H, tiles, `Education: ${items.map(([d, f, s, y]) => `${d} ${f}, ${s} (${y})`).join("; ")}`);
}

/* ─────────────────────────── TOP LANGUAGES ─────────────────────────── */

// Markup/template languages skew the picture of what I actually write.
const SKIP_LANGS = new Set(["HTML", "CSS", "SCSS", "Hack", "Less"]);
const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", "C#": "#178600", Python: "#3572A5",
  PHP: "#4F5D95", Java: "#b07219", "C++": "#f34b7d", C: "#a8b9cc", Shell: "#89e051",
  Dockerfile: "#384d54", Go: "#00ADD8", Dart: "#00B4AB", Kotlin: "#A97BFF",
};

async function gh(path) {
  const headers = { "User-Agent": USER, Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`${res.status} GitHub API ${path}`);
  return res.json();
}

async function topLanguages() {
  const repos = (await gh(`/users/${USER}/repos?per_page=100&type=owner`)).filter((r) => !r.fork);
  const totals = {};
  for (const r of repos) {
    const langs = await gh(`/repos/${USER}/${r.name}/languages`);
    for (const [lang, bytes] of Object.entries(langs)) {
      if (!SKIP_LANGS.has(lang)) totals[lang] = (totals[lang] || 0) + bytes;
    }
  }
  const sum = Object.values(totals).reduce((a, b) => a + b, 0);
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([name, bytes]) => ({ name, pct: (bytes / sum) * 100, color: LANG_COLORS[name] || C.muted }));

  const W = 400, H = 195, barX = 28, barW = W - 56;
  let x = barX;
  const bar = top.map((l, i) => {
    const w = i === top.length - 1 ? barX + barW - x : (l.pct / 100) * barW;
    const el = `<rect x="${x.toFixed(2)}" y="64" width="${Math.max(w, 0).toFixed(2)}" height="10" fill="${l.color}"/>`;
    x += w;
    return el;
  }).join("");
  const list = top.map((l, i) => {
    const lx = barX + (i % 2) * 180, ly = 110 + Math.floor(i / 2) * 28;
    return `<circle cx="${lx + 6}" cy="${ly - 4}" r="5.5" fill="${l.color}"/>
    <text x="${lx + 20}" y="${ly}" fill="${C.soft}" font-family="${SANS}" font-size="14">${esc(l.name)} <tspan fill="${C.muted}" font-size="13">${l.pct.toFixed(1)}%</tspan></text>`;
  }).join("\n");

  const inner = `
  <defs><clipPath id="l-bar"><rect x="${barX}" y="64" width="${barW}" height="10" rx="5"/></clipPath></defs>
  <text x="28" y="40" fill="${C.blue}" font-family="${SANS}" font-size="18" font-weight="600">Top Languages</text>
  <text x="${W - 28}" y="40" text-anchor="end" fill="${C.dim}" font-family="${MONO}" font-size="12">public repos</text>
  <g clip-path="url(#l-bar)">${bar}</g>
  ${list}`;
  return svg(W, H, frame(W, H, "l", inner, { grid: false, rx: 18 }), `Top languages in public repos: ${top.map((l) => `${l.name} ${l.pct.toFixed(1)}%`).join(", ")}`);
}

/* ───────────────────────────── FOOTER ───────────────────────────── */

function footer() {
  const W = 1200, H = 130;
  const inner = `
  <defs>
    <linearGradient id="f-line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.blue}" stop-opacity="0"/>
      <stop offset=".5" stop-color="${C.blue}"/>
      <stop offset="1" stop-color="${C.purple}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <style>
    .sweep { animation: sweep 6s ease-in-out infinite alternate; }
    @keyframes sweep { from { transform: translateX(-380px); } to { transform: translateX(380px); } }
  </style>
  <rect class="sweep" x="300" y="0" width="600" height="3" fill="url(#f-line)"/>
  <text x="${W / 2}" y="60" text-anchor="middle" fill="${C.text}" font-family="${SANS}" font-size="25" font-weight="700">Open to remote roles — let's build something reliable.</text>
  <text x="${W / 2}" y="94" text-anchor="middle" fill="${C.muted}" font-family="${MONO}" font-size="15">Dhaka, Bangladesh · UTC+6 · overlaps EU, AU &amp; Asia hours</text>`;
  return svg(W, H, frame(W, H, "f", inner, { rx: 18 }), "Open to remote roles");
}

/* ───────────────────────────── BUILD ───────────────────────────── */

await rm(new URL("projects/", OUT), { recursive: true, force: true });
await mkdir(new URL("products/", OUT), { recursive: true });
await mkdir(new URL("work/", OUT), { recursive: true });

await writeFile(new URL("hero.svg", OUT), hero());
await writeFile(new URL("highlights.svg", OUT), highlights());
await writeFile(new URL("experience.svg", OUT), experience());
for (const p of PRODUCTS) await writeFile(new URL(`products/${p.file}.svg`, OUT), await productCard(p));
for (const w of WORK) await writeFile(new URL(`work/${w.file}.svg`, OUT), workCard(w));
await writeFile(new URL("tech-stack.svg", OUT), await techStack());
await writeFile(new URL("education.svg", OUT), education());
await writeFile(new URL("footer.svg", OUT), footer());
try {
  await writeFile(new URL("top-languages.svg", OUT), await topLanguages());
} catch (err) {
  // Unauthenticated API calls are rate-limited; keep the previous card in that case.
  console.warn(`top-languages.svg not refreshed: ${err.message}`);
}
console.log("assets built");
