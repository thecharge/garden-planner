#!/usr/bin/env node
import { speciesCatalogue } from "../data/species";
import { companionTable } from "../rotation/companions";
import { rotationRules } from "../rotation/rotation-rules";
import { speciesDemandTable } from "../nutrient/species-demand";

type Entry = { readonly label: string; readonly citation: string };

const run = (): number => {
  const entries: Entry[] = [];
  for (const s of speciesCatalogue) {
    entries.push({ label: `species:${s.id}`, citation: s.sourceCitation });
  }
  for (const c of companionTable) {
    entries.push({ label: `companion:${c.speciesA}<->${c.speciesB}`, citation: c.sourceCitation });
  }
  for (const r of rotationRules) {
    entries.push({ label: `rotation-rule:${r.id}`, citation: r.sourceCitation });
  }
  for (const d of speciesDemandTable) {
    entries.push({ label: `nutrient-demand:${d.speciesId}`, citation: d.sourceCitation });
  }
  const missing = entries.filter((e) => !e.citation || e.citation.trim().length === 0);
  if (missing.length === 0) {
    console.log(`Audited ${entries.length} data-file entries — all carry sourceCitation.`);
    return 0;
  }
  for (const m of missing) {
    console.error(`missing sourceCitation: ${m.label}`);
  }
  console.error(`\n${missing.length} entries without sourceCitation — failing CI.`);
  return 1;
};

process.exit(run());
