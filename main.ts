// Hands in the Leonida Trophy Guide (Node 22, standard library only).
// The guide is plain static files in app/ (index.html, ES modules, CSS and
// the trophy data), served offline by any static server; screenshots/ holds
// four real renders of it. This program copies both folders beside this file
// into /output (or MAKEFUN_OUTPUT_DIR outside the grader) and writes
// /output/dossier.json with the vendored make.fun library, which is what
// the judge reads. vendor/makefun-frontend.ts stays exactly as the kit
// shipped it: the scorer rebuilds the dossier from its own copy and the
// two must match byte for byte.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// I wrote this helper myself: copy a folder only when it is really there,
// so a missing screenshots/ fails loudly instead of silently handing in
// an entry with no screenshots.
function copyFolder(from, to) {
  if (!existsSync(from) || !statSync(from).isDirectory()) {
    throw new Error(`missing folder: ${from}`);
  }
  cpSync(from, to, { recursive: true });
}

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
copyFolder(join(here, 'app'), join(out, 'app'));
mkdirSync(join(out, 'screenshots'), { recursive: true });
copyFolder(join(here, 'screenshots'), join(out, 'screenshots'));

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes
// the bytes; the others refuse an entry the scorer would refuse (more than
// 4 screenshots or one over 256 KiB; more than 993 files and directories
// in app/ or 48 MiB of app files: app/ counts beside /output's own
// 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
console.log(`handed in ${join(out, 'dossier.json')}`);
