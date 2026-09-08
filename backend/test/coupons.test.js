"use strict";

/**
 * These fail against the skeleton — CouponValidator is a stub. Make them pass.
 *
 * They use tiny in-memory .gz fixtures so they run fast. Your implementation
 * must also hold up against the real ~200 MB files within the memory / latency
 * budget in the README — add whatever measurement or larger-scale test you
 * think demonstrates that (a script under scripts/, a benchmark test, numbers
 * in DECISIONS.md).
 */

const fs = require("fs");
const { CouponValidator } = require("../src/coupons/validator");
const { makeCouponDir } = require("./helpers/couponFixtures");

const FILLER = ["AAAA", "BBBBBB", "CCCCCCCCCCCC", "1234", "ZZZZZZZZ"];

async function validatorFor(byFile) {
  const dir = makeCouponDir(byFile, FILLER);
  const v = new CouponValidator({ dir });
  await v.init();
  return { v, dir };
}

describe("CouponValidator", () => {
  const dirs = [];
  afterAll(() => dirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

  async function make(byFile) {
    const { v, dir } = await validatorFor(byFile);
    dirs.push(dir);
    return v;
  }

  it("valid: 8-10 chars AND in at least 2 of 3 files", async () => {
    const v = await make({
      1: ["HAPPYHRS", "FIFTYOFF"],
      2: ["HAPPYHRS"],
      3: ["HAPPYHRS", "FIFTYOFF"],
    });
    expect(await v.isValid("HAPPYHRS")).toBe(true); // 3 files
    expect(await v.isValid("FIFTYOFF")).toBe(true); // 2 files
  });

  it("invalid: present in only one file", async () => {
    const v = await make({ 1: ["LONELY01"], 2: [], 3: [] });
    expect(await v.isValid("LONELY01")).toBe(false);
  });

  it("invalid: present in no file", async () => {
    const v = await make({ 1: [], 2: [], 3: [] });
    expect(await v.isValid("GHOSTCODE")).toBe(false);
  });

  it("invalid: fails the length rule even if in all three files", async () => {
    const v = await make({
      1: ["SHORT7", "WAYTOOLONG11"],
      2: ["SHORT7", "WAYTOOLONG11"],
      3: ["SHORT7", "WAYTOOLONG11"],
    });
    expect(await v.isValid("SHORT7")).toBe(false); // 6
    expect(await v.isValid("WAYTOOLONG11")).toBe(false); // 12
  });

  it("length boundaries: 8 and 10 pass, 7 and 11 fail", async () => {
    const v = await make({
      1: ["EIGHTCHR", "TENCHARSXX", "SEVENCH", "ELEVENCHARX"],
      2: ["EIGHTCHR", "TENCHARSXX", "SEVENCH", "ELEVENCHARX"],
      3: [],
    });
    expect(await v.isValid("EIGHTCHR")).toBe(true); // 8
    expect(await v.isValid("TENCHARSXX")).toBe(true); // 10
    expect(await v.isValid("SEVENCH")).toBe(false); // 7
    expect(await v.isValid("ELEVENCHARX")).toBe(false); // 11
  });

  it("matching is exact and case-sensitive", async () => {
    const v = await make({ 1: ["HAPPYHRS"], 2: ["HAPPYHRS"], 3: [] });
    expect(await v.isValid("happyhrs")).toBe(false);
    expect(await v.isValid(" HAPPYHRS")).toBe(false);
    expect(await v.isValid("HAPPYHRS ")).toBe(false);
  });

  it("a code that is a substring of a file line does not match", async () => {
    const v = await make({ 1: ["HAPPYHRSX"], 2: ["XHAPPYHRS"], 3: ["HAPPYHRS"] });
    // "HAPPYHRS" is only really present in file 3 -> one file -> invalid
    expect(await v.isValid("HAPPYHRS")).toBe(false);
  });
});
