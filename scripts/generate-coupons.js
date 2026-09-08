#!/usr/bin/env node
"use strict";

/**
 * Generates the three coupon files the challenge validates against.
 *
 *   node scripts/generate-coupons.js [--size-mb 200] [--out ./coupons] [--show-planted]
 *
 * Output: <out>/couponbase1.gz, couponbase2.gz, couponbase3.gz
 *   - newline-separated coupon codes, gzip-compressed
 *   - uppercase A-Z0-9, length 4..14 (so length filtering is not free)
 *   - deterministic: same args -> byte-identical files
 *
 * A fixed set of "planted" codes is guaranteed to appear in specific files so
 * the validation rule ("8-10 chars AND in >= 2 of 3 files") has known answers.
 * Run with --show-planted to print them.
 *
 * These files are git-ignored. Do not commit them.
 */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// ---- args -----------------------------------------------------------------

const args = process.argv.slice(2);
function opt(name, fallback) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}
const SIZE_MB = Number(opt("size-mb", "200"));
const OUT_DIR = path.resolve(process.cwd(), opt("out", "./coupons"));
const SHOW_PLANTED = args.includes("--show-planted");

if (!Number.isFinite(SIZE_MB) || SIZE_MB <= 0) {
  console.error("--size-mb must be a positive number");
  process.exit(1);
}

// ---- planted codes ------------------------------------------------------------
// `files` is 1-based. [] means "generated but in no file" is not possible, so a
// "no file" planted code is simply never emitted — it is listed here for the
// docs / test tables only and skipped during generation.

const PLANTED = [
  // public set (also in README / API_SPEC)
  { code: "HAPPYHRS", files: [1, 2, 3], valid: true, note: "public" },
  { code: "FIFTYOFF", files: [1, 3], valid: true, note: "public" },
  { code: "LONELY01", files: [2], valid: false, note: "public - one file only" },
  { code: "GHOSTCODE", files: [], valid: false, note: "public - no file" },
  { code: "SHORT7", files: [1, 2, 3], valid: false, note: "public - length 6" },
  { code: "WAYTOOLONG11", files: [1, 2, 3], valid: false, note: "public - length 12" },

  // held-back evaluation set (see EVALUATION.md)
  { code: "DINNER25X", files: [2, 3], valid: true, note: "held-back" },
  { code: "SUPERSAVE9", files: [1, 2], valid: true, note: "held-back" },
  { code: "WEEKEND42", files: [1, 3], valid: true, note: "held-back" },
  { code: "EDGE8CHR", files: [1], valid: false, note: "held-back - one file" },
  { code: "PROMO", files: [1, 2, 3], valid: false, note: "held-back - length 5" },
  { code: "ELEVENCHARS", files: [1, 2, 3], valid: false, note: "held-back - length 11" },
  { code: "MIDNIGHTSNACK", files: [2, 3], valid: false, note: "held-back - length 13" },
];

if (SHOW_PLANTED) {
  console.log("Planted codes (guaranteed):\n");
  for (const p of PLANTED) {
    console.log(
      `  ${p.code.padEnd(15)} len=${String(p.code.length).padStart(2)} ` +
        `files=[${p.files.join(",") || "-"}]`.padEnd(14) +
        `valid=${p.valid ? "YES" : "no "}  (${p.note})`
    );
  }
  console.log("");
  process.exit(0);
}

// ---- deterministic PRNG (mulberry32) ----------------------------------------

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomCode(rng) {
  const len = 4 + Math.floor(rng() * 11); // 4..14
  let s = "";
  for (let i = 0; i < len; i++) {
    s += ALPHABET[Math.floor(rng() * ALPHABET.length)];
  }
  return s;
}

// ---- generation ------------------------------------------------------------

const TARGET_BYTES = Math.round(SIZE_MB * 1024 * 1024);
const FLUSH_AT = 8 * 1024 * 1024; // build ~8 MB of text, then write

function writeFileForIndex(fileIndex) {
  return new Promise((resolve, reject) => {
    const outPath = path.join(OUT_DIR, `couponbase${fileIndex}.gz`);
    // Seed per file but fixed -> deterministic. Different seed per file so the
    // three files are not identical.
    const rng = mulberry32(0x51ed_0000 + fileIndex);

    const gzip = zlib.createGzip({ level: 6 });
    const out = fs.createWriteStream(outPath);
    gzip.pipe(out);
    out.on("error", reject);
    gzip.on("error", reject);
    out.on("finish", resolve);

    // planted codes for this file, dripped in at random points
    const planted = PLANTED.filter((p) => p.files.includes(fileIndex)).map(
      (p) => p.code
    );
    let plantedLeft = planted.length;

    let uncompressed = 0;
    let buf = "";
    let count = 0;

    function pump() {
      let ok = true;
      while (ok && uncompressed < TARGET_BYTES) {
        // ~1 in 250k lines, emit a planted code until they are all placed
        let code;
        if (plantedLeft > 0 && rng() < 0.000004) {
          code = planted[planted.length - plantedLeft];
          plantedLeft--;
        } else {
          code = randomCode(rng);
        }
        const line = code + "\n";
        buf += line;
        uncompressed += Buffer.byteLength(line);
        count++;

        if (buf.length >= FLUSH_AT) {
          ok = gzip.write(buf);
          buf = "";
        }
      }

      if (uncompressed >= TARGET_BYTES) {
        // place any planted codes that never got dripped in
        while (plantedLeft > 0) {
          buf += planted[planted.length - plantedLeft] + "\n";
          plantedLeft--;
          count++;
        }
        gzip.end(buf, () => {
          const mb = (uncompressed / 1024 / 1024).toFixed(1);
          console.log(
            `  couponbase${fileIndex}.gz  ${count.toLocaleString()} codes  ${mb} MB uncompressed`
          );
        });
        return;
      }

      // ok === false -> wait for drain
      gzip.once("drain", pump);
    }

    pump();
  });
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(
    `Generating 3 coupon files (~${SIZE_MB} MB each) in ${OUT_DIR}\n`
  );
  const started = Date.now();
  for (const idx of [1, 2, 3]) {
    // sequential keeps peak memory low on small machines
    // eslint-disable-next-line no-await-in-loop
    await writeFileForIndex(idx);
  }
  console.log(
    `\nDone in ${((Date.now() - started) / 1000).toFixed(1)}s. ` +
      `These files are git-ignored - do not commit them.`
  );
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
