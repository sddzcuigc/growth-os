import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const sourcePath = resolve("成长OS_100Boss每日小Boss与每周Boss战_完整设计_V1.0.md");
const outputPath = resolve("data/boss-catalog.json");
const source = readFileSync(sourcePath, "utf8");
const worldHeadings = [...source.matchAll(/^### 第([^：\n]+)世界：([^\n]+)$/gm)];
const worlds = worldHeadings.map((match, index) => {
  const start = match.index;
  const end = worldHeadings[index + 1]?.index ?? source.indexOf("## 6. Boss战剧情生成规则", start);
  const section = source.slice(start, end);
  const domain = section.match(/^\*\*能力域：([^*\n]+)\*\*/m)?.[1]?.trim() || "";
  const bossMatches = [...section.matchAll(/^#### (B\d{3})｜([^\n]+)$/gm)];
  const bosses = bossMatches.map((bossMatch, bossIndex) => {
    const bossStart = bossMatch.index;
    const bossEnd = bossMatches[bossIndex + 1]?.index ?? section.length;
    const block = section.slice(bossStart, bossEnd);
    const field = (name) => block.match(new RegExp(`^- \\*\\*${name}：\\*\\* ([^\\n]+)$`, "m"))?.[1]?.trim() || "";
    return {
      id: bossMatch[1],
      skillId: `S${bossMatch[1].slice(1)}`,
      worldId: `W${String(index + 1).padStart(2, "0")}`,
      name: bossMatch[2].trim(),
      skillName: field("对应未来能力"),
      rank: field("Boss等级").includes("守关") ? "world_guardian" : "standard",
      attackNarrative: field("Boss攻击"),
      victoryEvidence: field("本周胜利证据"),
      finalChallengeTemplate: field("周日决战"),
      rewardTheme: field("偏向掉落"),
      ageMin: 6,
      ageMax: 15,
      safetyTags: domain.includes("身心") ? ["age_check", "health_check", "guardian_review"] : ["child_safe"]
    };
  });
  const id = `W${String(index + 1).padStart(2, "0")}`;
  return { id, index: index + 1, name: match[2].trim(), domain, assetPath: `assets/boss/worlds/${id}.png`, bosses };
});

const bosses = worlds.flatMap((world) => world.bosses);
const required = ["id", "skillId", "worldId", "name", "skillName", "attackNarrative", "victoryEvidence", "finalChallengeTemplate", "rewardTheme"];
if (worlds.length !== 10) throw new Error(`Expected 10 worlds, found ${worlds.length}`);
if (bosses.length !== 100) throw new Error(`Expected 100 bosses, found ${bosses.length}`);
if (new Set(bosses.map((boss) => boss.id)).size !== 100) throw new Error("Boss ids are not unique");
for (const boss of bosses) {
  boss.portraitPath = `assets/boss/portraits/${boss.id}.png`;
  boss.iconPath = `assets/boss/icons/${boss.id}.png`;
  for (const key of required) if (!boss[key]) throw new Error(`${boss.id} missing ${key}`);
}

writeFileSync(outputPath, `${JSON.stringify({ version: "2026.1", source: "成长OS开发文档V1.0", worlds, bosses }, null, 2)}\n`);
console.log(`Generated ${bosses.length} bosses across ${worlds.length} worlds.`);
