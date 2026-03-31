/**
 * generate_readme.js
 * Fetches Projects + My Journey from Notion and writes a fresh README.md
 *
 * Required env vars:
 *   NOTION_TOKEN          — your Notion internal integration secret
 *   NOTION_PROJECTS_DB    — b8891f8b3db247ebb95c59c96431edf9
 *   NOTION_JOURNEY_DB     — 99ba1a41a3db414cb05fbd8aa352b045
 */

import { Client } from "@notionhq/client";
import { writeFileSync } from "fs";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const PROJECTS_DB = process.env.NOTION_PROJECTS_DB;
const JOURNEY_DB = process.env.NOTION_JOURNEY_DB;

// ── helpers ────────────────────────────────────────────────────────────────

function richText(prop) {
  return prop?.rich_text?.map((r) => r.plain_text).join("") ?? "";
}
function title(prop) {
  return prop?.title?.map((r) => r.plain_text).join("") ?? "";
}
function select(prop) {
  return prop?.select?.name ?? "";
}
function multiSelect(prop) {
  return prop?.multi_select?.map((o) => o.name) ?? [];
}
function url(prop) {
  return prop?.url ?? "";
}
function checkbox(prop) {
  return prop?.checkbox ?? false;
}
function number(prop) {
  return prop?.number ?? 999;
}

// shield.io badge for a tech tag
const BADGE_COLORS = {
  "React Native": "61DAFB",
  React: "61DAFB",
  Node: "339933",
  Supabase: "3ECF8E",
  PostgreSQL: "4169E1",
  Kotlin: "7F52FF",
  "Jetpack Compose": "4285F4",
  Flutter: "02569B",
  Firebase: "FFCA28",
  Python: "3776AB",
  "Agentic AI": "FF6B6B",
  OpenCV: "5C3EE8",
  Blender: "E87D0D",
  Unity: "000000",
  "C#": "239120",
  Figma: "F24E1E",
  Docker: "2496ED",
  PyMuPDF: "CC2936",
};

function techBadge(tag) {
  const color = BADGE_COLORS[tag] ?? "555555";
  const encoded = encodeURIComponent(tag);
  return `![${tag}](https://img.shields.io/badge/${encoded}-${color}?style=flat-square&labelColor=1a1a1a&color=${color})`;
}

// category emoji
const CAT_EMOJI = {
  "AR/VR": "🥽",
  "AI/ML": "🤖",
  "Web Dev": "🌐",
  Tools: "🔧",
};

// ── fetch ──────────────────────────────────────────────────────────────────

async function fetchProjects() {
  const res = await notion.databases.query({
    database_id: PROJECTS_DB,
    sorts: [{ property: "Sort Order", direction: "ascending" }],
  });
  return res.results.map((page) => {
    const p = page.properties;
    return {
      name: title(p["Name"]),
      description: richText(p["Description"]),
      category: select(p["Category"]),
      techStack: multiSelect(p["Tech Stack"]),
      github: url(p["GitHub URL"]),
      featured: checkbox(p["Featured"]),
      sortOrder: number(p["Sort Order"]),
    };
  });
}

async function fetchJourney() {
  const res = await notion.databases.query({
    database_id: JOURNEY_DB,
    sorts: [{ property: "Sort Order", direction: "ascending" }],
  });
  return res.results.map((page) => {
    const p = page.properties;
    return {
      name: title(p["Name"]),
      description: richText(p["Description"]),
      dateRange: richText(p["Date Range"]),
      category: select(p["Category"]),
      sortOrder: number(p["Sort Order"]),
    };
  });
}

// ── render ─────────────────────────────────────────────────────────────────

function renderProjects(projects) {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  const renderCard = (p) => {
    const emoji = CAT_EMOJI[p.category] ?? "📦";
    const badges = p.techStack.map(techBadge).join(" ");
    const githubLink =
      p.github ? `[**↗ GitHub**](${p.github})` : "*repo coming soon*";
    return [
      `#### ${emoji} ${p.name}`,
      `> ${p.description}`,
      ``,
      badges ? `${badges}` : "",
      ``,
      `${githubLink}`,
    ]
      .filter((l) => l !== null)
      .join("\n");
  };

  let out = `## 🚀 Projects\n\n`;

  if (featured.length > 0) {
    out += `### ⭐ Featured\n\n`;
    out += featured.map(renderCard).join("\n\n---\n\n");
    out += `\n\n`;
  }

  if (rest.length > 0) {
    out += `### 📁 Other Projects\n\n`;
    out += `<details>\n<summary>Show all (${rest.length})</summary>\n\n`;
    out += rest.map(renderCard).join("\n\n---\n\n");
    out += `\n\n</details>\n\n`;
  }

  return out;
}

const CAT_JOURNEY_EMOJI = {
  Education: "🎓",
  Achievement: "🏆",
  Milestone: "📍",
  Leadership: "👥",
};

function renderJourney(journey) {
  let out = `## 🗺️ My Journey\n\n`;
  out += `<details>\n<summary>View timeline</summary>\n\n`;

  for (const item of journey) {
    const emoji = CAT_JOURNEY_EMOJI[item.category] ?? "📌";
    const date = item.dateRange ? ` · \`${item.dateRange}\`` : "";
    out += `**${emoji} ${item.name}**${date}  \n`;
    out += `${item.description}\n\n`;
  }

  out += `</details>\n\n`;
  return out;
}

// ── assemble README ────────────────────────────────────────────────────────

function buildReadme(projects, journey) {
  const now = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  return `# ✌️ Hey, I'm Sarvin

🎓 Pre-final year B.Tech CSE @ **KIET Group of Institutions**  
🏗️ Frontend Intern @ **Habuild Healthtech** · AR/VR Lead @ **Technocrats**  
🌐 Portfolio → [sarvinshrivastava.space](https://sarvinshrivastava.space)

---

## 🛠️ Tech Stack

#### Languages
![C++](https://img.shields.io/badge/C++-00599C?style=flat-square&labelColor=1a1a1a&logo=cplusplus&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&labelColor=1a1a1a&logo=python&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&labelColor=1a1a1a&logo=javascript&logoColor=white)
![Kotlin](https://img.shields.io/badge/Kotlin-7F52FF?style=flat-square&labelColor=1a1a1a&logo=kotlin&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&labelColor=1a1a1a&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&labelColor=1a1a1a&logo=css3&logoColor=white)

#### Frameworks & Tools
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&labelColor=1a1a1a&logo=react&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=flat-square&labelColor=1a1a1a&logo=react&logoColor=white)
![Flutter](https://img.shields.io/badge/Flutter-02569B?style=flat-square&labelColor=1a1a1a&logo=flutter&logoColor=white)
![Jetpack Compose](https://img.shields.io/badge/Jetpack_Compose-4285F4?style=flat-square&labelColor=1a1a1a&logo=jetpackcompose&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&labelColor=1a1a1a&logo=nodedotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&labelColor=1a1a1a&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&labelColor=1a1a1a&logo=supabase&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&labelColor=1a1a1a&logo=firebase&logoColor=white)
![Unity](https://img.shields.io/badge/Unity-000000?style=flat-square&labelColor=1a1a1a&logo=unity&logoColor=white)
![Blender](https://img.shields.io/badge/Blender-E87D0D?style=flat-square&labelColor=1a1a1a&logo=blender&logoColor=white)
![OpenCV](https://img.shields.io/badge/OpenCV-5C3EE8?style=flat-square&labelColor=1a1a1a&logo=opencv&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&labelColor=1a1a1a&logo=git&logoColor=white)
![Figma](https://img.shields.io/badge/Figma-F24E1E?style=flat-square&labelColor=1a1a1a&logo=figma&logoColor=white)

---

${renderProjects(projects)}
---

${renderJourney(journey)}
---

## 📊 GitHub Stats

[![GitHub Streak](https://github-readme-streak-stats-lime-omega.vercel.app?user=sarvinshrivastava&theme=vue-dark&hide_border=true)](https://git.io/streak-stats)
[![Stats](https://github-readme-stats.vercel.app/api?username=sarvinshrivastava&theme=vue-dark&show_icons=true&hide_border=true&count_private=true)](https://github.com/sarvinshrivastava)
[![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username=sarvinshrivastava&theme=vue-dark&show_icons=true&hide_border=true&layout=compact)](https://github.com/sarvinshrivastava)

---

<sub>🤖 Auto-generated from [Notion CMS](https://notion.so) · Last updated: ${now}</sub>
`;
}

// ── main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("⏳ Fetching Notion data...");
  const [projects, journey] = await Promise.all([
    fetchProjects(),
    fetchJourney(),
  ]);
  console.log(`✅ Got ${projects.length} projects, ${journey.length} milestones`);

  const readme = buildReadme(projects, journey);
  writeFileSync("README.md", readme, "utf-8");
  console.log("✅ README.md written!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
