import { correlation } from "../src/internal/utils";
import { MT19937, RandomTools } from "../src/random";

describe("basic randoms", () => {
  let R = new MT19937(19);
  it("bytes of words", () => {
    const cts: number[] = [];
    for (let i = 0; i < 256; ++i) {
      cts.push(0);
    }
    for (let i = 0; i < 1024; ++i) {
      let w = R.word();
      for (let j = 0; j < 4; ++j) {
        let b = w & 0xff;
        cts[b] += 1;
        w >>= 8;
      }
    }
    for (let c of cts) {
      expect(c).toBeGreaterThan(0);
    }
  });

  it("uniform [0,1)", () => {
    const J = 251;
    const cts: number[] = [];
    for (let i = 0; i < J; ++i) {
      cts.push(0);
    }
    for (let i = 0; i < 10 * J; ++i) {
      let u = R.random();
      let j = Math.floor(u * J);
      cts[j] += 1;
    }
    for (let c of cts) {
      expect(c).toBeGreaterThan(0);
    }
  });
});

describe("random utilities", () => {
    let R = new MT19937(19);
    it("shuffle", () => {
        let xs = [];
        for (let i = 0; i < 100; ++i) {
            xs.push(i);
        }
        let ys = [...xs];
        let U = new RandomTools(R);
        U.shuffle(ys);
        let r = correlation(xs, ys);
        expect(r).toBeLessThan(0.3);
    });
});