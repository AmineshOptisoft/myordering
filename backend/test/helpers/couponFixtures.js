"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const zlib = require("zlib");

/**
 * Write three small couponbaseN.gz files into a fresh temp dir.
 *
 * @param {{1: string[], 2: string[], 3: string[]}} byFile  codes per file
 * @param {string[]} [filler] extra codes appended to every file (noise)
 * @returns {string} the temp directory path (contains couponbase1..3.gz)
 */
function makeCouponDir(byFile, filler = []) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "coupons-"));
  for (const n of [1, 2, 3]) {
    const lines = [...(byFile[n] || []), ...filler].join("\n") + "\n";
    fs.writeFileSync(path.join(dir, `couponbase${n}.gz`), zlib.gzipSync(lines));
  }
  return dir;
}

module.exports = { makeCouponDir };
