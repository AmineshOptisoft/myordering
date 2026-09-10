"use strict";

/*
1. `8 <= code.length <= 10`.
2. The code appears in **at least two of the three** files
   `couponbase1.gz`, `couponbase2.gz`, `couponbase3.gz` (see
   `scripts/generate-coupons.js`). Matching is exact and case-sensitive; each
   file is newline-separated codes, gzip-compressed.
*/

const path = require("path");
const fs = require("fs");
const zlib = require("zlib");
const readline = require("readline");

class CouponValidator {
    constructor({ dir } = {}) {
        this.dir = dir || path.resolve(__dirname, "../../../coupons");

        // Partitioned buckets for A-Z and 0-9 to prevent V8 Set size limits
        this.validBuckets = {};
        for (const ch of "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789") {
            this.validBuckets[ch] = new Set();
        }
    }

    async init() {
        const onceBuckets = {};
        for (const ch of "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789") {
            onceBuckets[ch] = new Set();
        }

        for (let i = 1; i <= 3; i++) {
            const filePath = path.join(this.dir, `couponbase${i}.gz`);
            if (!fs.existsSync(filePath)) continue;

            const fileStream = fs.createReadStream(filePath);
            const gunzip = zlib.createGunzip();
            const rl = readline.createInterface({
                input: fileStream.pipe(gunzip),
                crlfDelay: Infinity
            });

            const seenInThisFile = new Set();

            for await (const rawLine of rl) {
                const line = rawLine.trim();
                // Filter rule: length must be between 8 and 10 characters
                if (line.length >= 8 && line.length <= 10) {
                    seenInThisFile.add(line);
                }
            }

            for (const code of seenInThisFile) {
                const firstChar = code[0];
                if (!onceBuckets[firstChar]) continue;

                if (onceBuckets[firstChar].has(code)) {
                    this.validBuckets[firstChar].add(code);
                } else {
                    onceBuckets[firstChar].add(code);
                }
            }
        }
    }

    async isValid(code) {
        if (!code || typeof code !== "string") return false;
        if (code.length < 8 || code.length > 10) return false;
        const firstChar = code[0].toUpperCase();
        const bucket = this.validBuckets[firstChar];
        return bucket ? bucket.has(code) : false;
    }
}

module.exports = { CouponValidator };

