// Generates the custom SVG artwork used by README.md.
// Usage: node scripts/build-assets.mjs   (Node 18+, no dependencies)

import { mkdir, writeFile } from "node:fs/promises";

const OUT = new URL("../assets/", import.meta.url);

const C = {
  bg: "#0d1117",
  bg2: "#111827",
  card: "#161b22",
  border: "#30363d",
  line: "#21262d",
  text: "#e6edf3",
  soft: "#c9d1d9",
  muted: "#8b949e",
  blue: "#58a6ff",
  purple: "#a371f7",
  green: "#3fb950",
};

const SANS = `'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif`;
const MONO = `'JetBrains Mono', 'Fira Code', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace`;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const svg = (w, h, body, title) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
${body}
</svg>
`;

// Shared card frame: dark rounded panel with a soft dot grid and border.
const frame = (w, h, id, { grid = true, rx = 20 } = {}) => `
<defs>
  <linearGradient id="${id}-bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${C.bg}"/><stop offset="1" stop-color="${C.bg2}"/>
  </linearGradient>
  <pattern id="${id}-dots" width="22" height="22" patternUnits="userSpaceOnUse">
    <circle cx="1.5" cy="1.5" r="1.2" fill="#ffffff" fill-opacity=".07"/>
  </pattern>
  <clipPath id="${id}-clip"><rect width="${w}" height="${h}" rx="${rx}"/></clipPath>
</defs>
<g clip-path="url(#${id}-clip)">
  <rect width="${w}" height="${h}" fill="url(#${id}-bg)"/>
  ${grid ? `<rect width="${w}" height="${h}" fill="url(#${id}-dots)"/>` : ""}
  __INNER__
</g>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${rx}" stroke="${C.border}"/>`;

const inFrame = (w, h, id, inner, opts) => frame(w, h, id, opts).replace("__INNER__", inner);

/* ───────────────────────────── HERO ───────────────────────────── */

function hero() {
  const W = 1200, H = 420;

  // Code window lines: [indent, [[text, color], ...]]
  const kw = "#ff7b72", fn = "#d2a8ff", prop = "#79c0ff", str = "#a5d6ff", cm = C.muted, pl = C.soft;
  const code = [
    [0, [["const ", kw], ["engineer", fn], [" = {", pl]]],
    [1, [["name", prop], [": ", pl], ['"Maruf Hossain"', str], [",", pl]]],
    [1, [["role", prop], [": ", pl], ['"Software Engineer"', str], [",", pl]]],
    [1, [["stack", prop], [": [", pl], ['"MERN"', str], [", ", pl], ['".NET"', str], [", ", pl], ['"SQL"', str], ["],", pl]]],
    [1, [["focus", prop], [": ", pl], ['"scalable backends"', str], [",", pl]]],
    [1, [["coffee", prop], [": ", pl], ["Infinity", prop], [",", pl]]],
    [0, [["};", pl]]],
    [0, [["engineer", fn], [".", pl], ["ship", fn], ["(); ", pl], ["// always shipping", cm]]],
  ];
  const cx = 668, cy = 62, cw = 462, ch = 300;
  const lineH = 28, codeX = cx + 58, codeY = cy + 82;
  const codeLines = code.map(([indent, parts], i) => {
    const d = (0.5 + i * 0.32).toFixed(2);
    const spans = parts.map(([t, col]) => `<tspan fill="${col}">${esc(t)}</tspan>`).join("");
    return `<g class="ln" style="animation-delay:${d}s">
      <text x="${cx + 24}" y="${codeY + i * lineH}" fill="#484f58" font-family="${MONO}" font-size="14">${i + 1}</text>
      <text x="${codeX + indent * 22}" y="${codeY + i * lineH}" font-family="${MONO}" font-size="15.5" xml:space="preserve">${spans}</text>
    </g>`;
  }).join("\n");
  const caretY = codeY + (code.length - 1) * lineH;

  const chips = ["Dhaka, Bangladesh", "Clean Architecture", "REST &amp; GraphQL"];
  let chipX = 70;
  const chipEls = chips.map((c) => {
    const w = c.replace("&amp;", "&").length * 8.4 + 32;
    const el = `<g transform="translate(${chipX} 318)">
      <rect width="${w}" height="34" rx="17" fill="#ffffff" fill-opacity=".04" stroke="${C.border}"/>
      <text x="${w / 2}" y="22" text-anchor="middle" fill="${C.soft}" font-family="${SANS}" font-size="14">${c}</text>
    </g>`;
    chipX += w + 10;
    return el;
  }).join("\n");

  const inner = `
  <defs>
    <radialGradient id="h-orb1"><stop offset="0" stop-color="${C.blue}" stop-opacity=".35"/><stop offset="1" stop-color="${C.blue}" stop-opacity="0"/></radialGradient>
    <radialGradient id="h-orb2"><stop offset="0" stop-color="${C.purple}" stop-opacity=".32"/><stop offset="1" stop-color="${C.purple}" stop-opacity="0"/></radialGradient>
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
  <rect x="0" y="0" width="${W}" height="4" fill="url(#h-bar)"/>

  <!-- status pill -->
  <g class="fade" style="animation-delay:.1s">
    <rect x="70" y="80" width="250" height="32" rx="16" fill="${C.green}" fill-opacity=".1" stroke="${C.green}" stroke-opacity=".45"/>
    <circle class="pulse" cx="88" cy="96" r="5" fill="${C.green}"/>
    <circle cx="88" cy="96" r="5" fill="${C.green}"/>
    <text x="102" y="101" fill="#7ee787" font-family="${SANS}" font-size="13.5" font-weight="600">Open to collaborations</text>
  </g>

  <g class="fade" style="animation-delay:.2s">
    <text x="70" y="158" fill="${C.muted}" font-family="${MONO}" font-size="17">Hello, world — I'm</text>
    <text x="68" y="222" fill="url(#h-name)" font-family="${SANS}" font-size="66" font-weight="800" letter-spacing="-1.5">Maruf Hossain</text>
  </g>
  <g class="fade" style="animation-delay:.35s">
    <text x="70" y="270" font-family="${SANS}" font-size="24" font-weight="600">
      <tspan fill="${C.text}">Software Engineer</tspan><tspan fill="${C.muted}" font-weight="400">  ·  </tspan><tspan fill="${C.blue}">Backend</tspan><tspan fill="${C.muted}" font-weight="400"> &amp; </tspan><tspan fill="${C.purple}">Full-stack</tspan>
    </text>
  </g>
  <g class="fade" style="animation-delay:.5s">${chipEls}</g>

  <!-- code window -->
  <g class="fade" style="animation-delay:.25s">
    <rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="14" fill="${C.bg}" fill-opacity=".85" stroke="${C.border}"/>
    <path d="M${cx} ${cy + 14}a14 14 0 0 1 14-14h${cw - 28}a14 14 0 0 1 14 14v26h-${cw}z" fill="${C.card}"/>
    <line x1="${cx}" y1="${cy + 40}" x2="${cx + cw}" y2="${cy + 40}" stroke="${C.border}"/>
    <circle cx="${cx + 22}" cy="${cy + 20}" r="6" fill="#ff5f57"/>
    <circle cx="${cx + 42}" cy="${cy + 20}" r="6" fill="#febc2e"/>
    <circle cx="${cx + 62}" cy="${cy + 20}" r="6" fill="#28c840"/>
    <text x="${cx + cw / 2}" y="${cy + 25}" text-anchor="middle" fill="${C.muted}" font-family="${MONO}" font-size="13">engineer.ts</text>
  </g>
  ${codeLines}
  <rect class="caret" x="${codeX + 338}" y="${caretY - 15}" width="9" height="19" fill="${C.blue}"/>
  `;
  return svg(W, H, inFrame(W, H, "h", inner, { rx: 22 }), "Maruf Hossain — Software Engineer");
}

/* ─────────────────────────── TECH STACK ─────────────────────────── */

const STACK = [
  ["Languages", [["js", "JavaScript"], ["ts", "TypeScript"], ["cs", "C#"], ["cpp", "C++"], ["c", "C"], ["python", "Python"]]],
  ["Frontend", [["react", "React"], ["nextjs", "Next.js"], ["redux", "Redux"], ["materialui", "MUI"], ["bootstrap", "Bootstrap"], ["html", "HTML5"], ["css", "CSS3"]]],
  ["Backend", [["nodejs", "Node.js"], ["express", "Express"], ["nestjs", "NestJS"], ["dotnet", ".NET"], ["graphql", "GraphQL"]]],
  ["Databases", [["@sqlserver", "SQL Server"], ["mongodb", "MongoDB"], ["mysql", "MySQL"]]],
  ["Tools", [["git", "Git"], ["github", "GitHub"], ["postman", "Postman"], ["vscode", "VS Code"], ["visualstudio", "Visual Studio"]]],
  ["Learning", [["docker", "Docker"], ["azure", "Azure"]]],
];

let uid = 0;
// Make every id inside an embedded icon unique so icons can't clash.
function scopeIds(markup) {
  const p = `i${uid++}-`;
  return markup
    .replace(/id="([^"]+)"/g, `id="${p}$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${p}$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${p}$1"`);
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

async function iconInner(id) {
  if (id === "@sqlserver") {
    const dev = await fetchText("https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/microsoftsqlserver/microsoftsqlserver-plain.svg");
    const paths = dev.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
    return `<rect width="256" height="256" rx="60" fill="#242938"/><svg x="40" y="40" width="176" height="176" viewBox="0 0 128 128">${paths}</svg>`;
  }
  const raw = await fetchText(`https://skillicons.dev/icons?i=${id}`);
  // A single skillicons icon is a 256×256 root <svg>; keep everything inside it.
  if (!/viewBox="0 0 256 256"/.test(raw.slice(0, 300))) throw new Error(`Unexpected skillicons markup for ${id}`);
  return raw.trim().replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
}

async function techStack() {
  const W = 1200, pad = 36, gap = 20;
  const colW = (W - pad * 2 - gap) / 2;
  const tile = 54, step = 76, groupH = 150;
  const rows = Math.ceil(STACK.length / 2);
  const H = pad * 2 + rows * groupH + (rows - 1) * gap;

  const groups = [];
  for (let gi = 0; gi < STACK.length; gi++) {
    const [label, items] = STACK[gi];
    const gx = pad + (gi % 2) * (colW + gap);
    const gy = pad + Math.floor(gi / 2) * (groupH + gap);
    const icons = [];
    for (let k = 0; k < items.length; k++) {
      const [id, name] = items[k];
      const ix = gx + 24 + k * step + (step - tile) / 2;
      const iy = gy + 52;
      const inner = scopeIds(await iconInner(id));
      icons.push(`<svg x="${ix}" y="${iy}" width="${tile}" height="${tile}" viewBox="0 0 256 256">${inner}</svg>
      <text x="${ix + tile / 2}" y="${iy + tile + 22}" text-anchor="middle" fill="${C.muted}" font-family="${SANS}" font-size="12.5">${esc(name)}</text>`);
    }
    const accent = gi % 2 ? C.purple : C.blue;
    groups.push(`<g>
      <rect x="${gx}" y="${gy}" width="${colW}" height="${groupH}" rx="16" fill="#ffffff" fill-opacity=".025" stroke="${C.line}"/>
      <rect x="${gx + 24}" y="${gy + 22}" width="4" height="16" rx="2" fill="${accent}"/>
      <text x="${gx + 38}" y="${gy + 35}" fill="${C.text}" font-family="${MONO}" font-size="14" font-weight="700" letter-spacing="1.5">${label.toUpperCase()}</text>
      <text x="${gx + colW - 24}" y="${gy + 35}" text-anchor="end" fill="#484f58" font-family="${MONO}" font-size="13">${String(items.length).padStart(2, "0")}</text>
      ${icons.join("\n")}
    </g>`);
  }
  return svg(W, H, inFrame(W, H, "t", groups.join("\n")), "Tech stack");
}

/* ─────────────────────────── PROJECT CARDS ─────────────────────────── */

const PROJECTS = [
  {
    file: "delivery-food-app",
    title: "Food Delivery Platform",
    tag: "MICROSERVICES",
    accent: "#f78166",
    desc: ["Food delivery web app built as microservices,", "with a GraphQL API layer and Next.js frontend."],
    stack: [["NestJS", "#E0234E"], ["GraphQL", "#E10098"], ["Next.js", "#e6edf3"]],
  },
  {
    file: "mfa-api-express",
    title: "MFA Auth API",
    tag: "SECURITY",
    accent: C.green,
    desc: ["Backend service for multi-factor", "authentication, built with Express.js."],
    stack: [["Node.js", "#3fb950"], ["Express", "#e6edf3"], ["REST API", C.blue]],
  },
  {
    file: "study-schedule-optimizer",
    title: "Study Schedule Optimizer",
    tag: "PRODUCTIVITY",
    accent: C.purple,
    desc: ["Helps working students plan and optimize", "their study time — separate API & web client."],
    stack: [["TypeScript", "#3178C6"], ["Full-stack", C.purple]],
  },
  {
    file: "nestjs-task-planner",
    title: "NestJS Task Planner",
    tag: "ENTERPRISE BACKEND",
    accent: C.blue,
    desc: ["Enterprise back-end with NestJS & TypeScript:", "REST APIs, authentication and best practices."],
    stack: [["NestJS", "#E0234E"], ["TypeScript", "#3178C6"], ["REST API", C.blue]],
  },
];

function projectCard(p) {
  const W = 600, H = 220, id = `p-${p.file}`;
  let sx = 32;
  const chips = p.stack.map(([name, col]) => {
    const w = name.length * 8 + 34;
    const el = `<g transform="translate(${sx} 166)">
      <rect width="${w}" height="28" rx="14" fill="#ffffff" fill-opacity=".04" stroke="${C.border}"/>
      <circle cx="15" cy="14" r="4.5" fill="${col}"/>
      <text x="26" y="19" fill="${C.soft}" font-family="${SANS}" font-size="13">${esc(name)}</text>
    </g>`;
    sx += w + 8;
    return el;
  }).join("\n");

  const inner = `
  <defs>
    <radialGradient id="${id}-glow"><stop offset="0" stop-color="${p.accent}" stop-opacity=".22"/><stop offset="1" stop-color="${p.accent}" stop-opacity="0"/></radialGradient>
  </defs>
  <ellipse cx="${W - 40}" cy="10" rx="240" ry="150" fill="url(#${id}-glow)"/>
  <rect width="${W}" height="3" fill="${p.accent}"/>
  <!-- repo icon -->
  <g transform="translate(32 34)" stroke="${C.muted}" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 17V3.5A2.5 2.5 0 0 1 4.5 1H16v14H4.5A2.5 2.5 0 0 0 2 17.5 2.5 2.5 0 0 0 4.5 20H8"/>
    <path d="M10 18v4l2-1.4 2 1.4v-4"/>
  </g>
  <text x="62" y="51" fill="${p.accent}" font-family="${MONO}" font-size="12.5" font-weight="700" letter-spacing="1.6">${esc(p.tag)}</text>
  <text x="32" y="92" fill="${C.text}" font-family="${SANS}" font-size="27" font-weight="700" letter-spacing="-.3">${esc(p.title)}</text>
  <text font-family="${SANS}" font-size="16" fill="${C.muted}">
    <tspan x="32" y="124">${esc(p.desc[0])}</tspan>
    <tspan x="32" y="147">${esc(p.desc[1])}</tspan>
  </text>
  ${chips}
  <!-- open arrow -->
  <g transform="translate(${W - 66} 28)">
    <rect width="38" height="38" rx="19" fill="#ffffff" fill-opacity=".05" stroke="${C.border}"/>
    <path d="M14 24l10-10M16 14h8v8" stroke="${C.text}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;
  return svg(W, H, inFrame(W, H, id, inner, { grid: false, rx: 18 }), `${p.title} — ${p.desc.join(" ")}`);
}

/* ───────────────────────────── FOOTER ───────────────────────────── */

function footer() {
  const W = 1200, H = 120;
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
  <text x="${W / 2}" y="56" text-anchor="middle" fill="${C.text}" font-family="${SANS}" font-size="24" font-weight="700">Thanks for stopping by.</text>
  <text x="${W / 2}" y="86" text-anchor="middle" fill="${C.muted}" font-family="${MONO}" font-size="15">// let's build something reliable, fast and clean together</text>`;
  return svg(W, H, inFrame(W, H, "f", inner, { rx: 18 }), "Thanks for stopping by");
}

/* ─────────────────────────── TOP LANGUAGES ─────────────────────────── */

const USER = "marufh1";
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
  <text x="${W - 28}" y="40" text-anchor="end" fill="#484f58" font-family="${MONO}" font-size="12">${repos.length} repos</text>
  <g clip-path="url(#l-bar)">${bar}</g>
  ${list}`;
  return svg(W, H, inFrame(W, H, "l", inner, { grid: false, rx: 18 }), `Top languages: ${top.map((l) => `${l.name} ${l.pct.toFixed(1)}%`).join(", ")}`);
}

/* ───────────────────────────── BUILD ───────────────────────────── */

await mkdir(new URL("projects/", OUT), { recursive: true });
await writeFile(new URL("hero.svg", OUT), hero());
await writeFile(new URL("tech-stack.svg", OUT), await techStack());
for (const p of PROJECTS) await writeFile(new URL(`projects/${p.file}.svg`, OUT), projectCard(p));
await writeFile(new URL("footer.svg", OUT), footer());
await writeFile(new URL("top-languages.svg", OUT), await topLanguages());
console.log("assets built");
