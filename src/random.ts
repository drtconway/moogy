export interface RandomSource {
  random: () => number;
}

export class RandomTools {
  private rng: RandomSource;

  constructor(rng: RandomSource) {
    this.rng = rng;
  }

  random(): number {
    return this.rng.random();
  }

  randint(lo: number, hi: number): number {
    const r = hi - lo + 1;
    return Math.floor(r * this.random()) + lo;
  }

  shuffle<T>(xs: T[]): void {
    const n = xs.length;
    for (let i = 0; i < n; ++i) {
      let j = this.randint(0, n - 1);
      if (i != j) {
        let t = xs[i];
        xs[i] = xs[j];
        xs[j] = t;
      }
    }
  }
}

export class MT19937 implements RandomSource {
  private w: number = 32;
  private n: number = 624;
  private m: number = 397;
  private r: number = 31;
  private a: number = 0x9908b0df;
  private u: number = 11;
  private d: number = 0xffffffff;
  private s: number = 7;
  private b: number = 0x9d2c5680;
  private t: number = 15;
  private c: number = 0xefc60000;
  private l: number = 18;
  private f: number = 1812433253;
  private lower: number = 0x7fffffff;
  private upper: number = 0x80000000;

  private MT: Uint32Array;
  private index: number;

  constructor(seed: number) {
    this.MT = new Uint32Array(this.n);
    this.MT[0] = seed;
    for (let i = 1; i < this.n; ++i) {
      let tmp = this.f * (this.MT[i - 1] ^ (this.MT[i - 1] >> (this.w - 2))) + i;
      this.MT[i] = tmp & 0xffffffff;
    }
    this.index = this.n;
  }

  random(): number {
    let x = 0;
    for (let i = 0; i < 2; ++i) {
      let w = this.word();
      for (let j = 0; j < 31; ++j) {
        x += w & 1;
        x /= 2;
        w >>= 1;
      }
    }
    return x;
  }

  word(): number {
    if (this.index >= this.n) {
      this.twist();
      this.index = 0;
    }
    let y = this.MT[this.index];
    y ^= (y >> this.u) & this.d;
    y ^= (y << this.s) & this.b;
    y ^= (y << this.t) & this.c;
    y ^= y >> this.l;
    this.index += 1;
    return y & 0xffffffff;
  }

  private twist() {
    for (let i = 0; i < this.n; ++i) {
      let x = (this.MT[i] & this.upper) + (this.MT[(i + 1) % this.n] & this.lower);
      let xA = x >> 1;
      if ((x & 1) != 0) {
        xA = xA ^ this.a;
      }
      this.MT[i] = this.MT[(i + this.m) % this.n] ^ xA;
    }
  }
}
