import { contFracB, sumSeries, CodePathCapture } from "../internal/utils";
import { domain, DomainError, OverflowError } from "../internal/checks";
import {
  choose,
  factorials,
  fullGammaPrefix,
  gamma,
  gammaDeltaRatio,
  incompleteGamma,
  logGamma,
  regularisedGammaPrefix,
  scaledGamma,
} from "./gamma";
import { powm1 } from "./logexp";

export const codePaths = new CodePathCapture();

const eps = 1e-22;
const minRec = 20;
const maxTerms = 100;
const halfPi = Math.PI / 2;

function denormal(x: number): boolean {
  return Math.abs(x) < 2.2250738585072014e-308;
}

export function beta(a: number, b: number): number {
  domain(a, { greaterThan: 0 });
  domain(b, { greaterThan: 0 });

  let c = a + b;

  if (c == a && b < eps) {
    return 1 / b;
  }
  if (c == b && a < eps) {
    return 1 / a;
  }
  if (b == 1) {
    return 1 / a;
  }
  if (a == 1) {
    return 1 / b;
  }
  if (c < eps) {
    let res = c / a;
    res /= b;
    return res;
  }

  let aShift = 0;
  let bShift = 0;
  if (a < minRec) {
    aShift = 1 + Math.trunc(minRec - a);
  }
  if (b < minRec) {
    bShift = 1 + Math.trunc(minRec - b);
  }
  let cShift = aShift + bShift;

  if (aShift == 0 && bShift == 0) {
    return (Math.pow(a / c, a) * Math.pow(b / c, b) * scaledGamma(a) * scaledGamma(b)) / scaledGamma(c);
  }
  if (a < 1 && b < 1) {
    return (gamma(a) * gamma(b)) / gamma(c);
  }
  if (a < 1) {
    return gamma(a) * gammaDeltaRatio(b, a);
  }
  if (b < 1) {
    return gamma(b) * gammaDeltaRatio(a, b);
  }

  let res = beta(a + aShift, b + bShift);
  for (let i = 0; i < cShift; ++i) {
    res *= c + i;
    if (i < aShift) {
      res /= a + i;
    }
    if (i < bShift) {
      res /= b + i;
    }
  }
  return res;
}

function incompleteBetaPowerTerms(a: number, b: number, x: number, y: number, norm: boolean, prefix: number = 1): number {
  if (!norm) {
    return prefix * Math.pow(x, a) * Math.pow(y, b);
  }

  let c = a + b;

  let aShift = 0;
  let bShift = 0;
  if (a < minRec) {
    aShift = 1 + Math.trunc(minRec - a);
  }
  if (b < minRec) {
    bShift = 1 + Math.trunc(minRec - b);
  }

  if (aShift == 0 && bShift == 0) {
    let pow1;
    let pow2;
    if (a < b) {
      pow1 = Math.pow((x * y * c * c) / (a * b), a);
      pow2 = Math.pow((y * c) / b, b - a);
    } else {
      pow1 = Math.pow((x * y * c * c) / (a * b), b);
      pow2 = Math.pow((x * c) / a, a - b);
    }
    if (denormal(pow1) || denormal(pow2)) {
      return (
        (prefix * Math.exp(a * Math.log((x * c) / a) + b * Math.log((y * c) / b)) * scaledGamma(c)) /
        (scaledGamma(a) * scaledGamma(b))
      );
    }
    return (prefix * pow1 * pow2 * scaledGamma(c)) / (scaledGamma(a) * scaledGamma(b));
  }

  let pow1 = Math.pow(x, a);
  let pow2 = Math.pow(y, b);
  let bet = beta(a, b);

  if (denormal(pow1) || denormal(pow2) || denormal(bet)) {
    let cShift = aShift + bShift;
    let res = incompleteBetaPowerTerms(a + aShift, b + bShift, x, y, norm, prefix);
    if (!denormal(res)) {
      for (let i = 0; i < cShift; ++i) {
        if (i < aShift) {
          res *= a + i;
          res /= x;
        }
        if (i < bShift) {
          res *= b + i;
          res /= y;
        }
        res /= c + i;
      }
      return prefix * res;
    } else {
      let logRes = Math.log(x) * a + Math.log(y) * b + Math.log(prefix);
      if (!denormal(bet)) {
        logRes -= Math.log(bet);
      } else {
        logRes += logGamma(c) - logGamma(a) - logGamma(b);
      }
      return Math.exp(logRes);
    }
  }
  return prefix * pow1 * (pow2 / bet);
}

function incompleteBetaSeriesTerms(a: number, b: number, x: number, m: number): () => number {
  let res = m;
  let apn = a;
  let poch = 1 - b;
  let n = 1;
  return () => {
    let r = res / apn;
    apn += 1;
    res *= (poch * x) / n;
    n += 1;
    poch += 1;
    return r;
  };
}

function incompleteBetaSeries(
  a: number,
  b: number,
  x: number,
  s0: number,
  norm: boolean,
  y: number,
  deriv?: { value: number }
): number {
  let res;
  if (norm) {
    let c = a + b;

    let aShift = 0;
    let bShift = 0;
    if (a < minRec) {
      aShift = 1 + Math.trunc(minRec - a);
    }
    if (b < minRec) {
      bShift = 1 + Math.trunc(minRec - b);
    }
    if (aShift == 0 && bShift == 0) {
      res = (Math.pow((x * c) / a, a) * Math.pow(c / b, b) * scaledGamma(c)) / (scaledGamma(a) * scaledGamma(b));
    } else if (a < 1 && b > 1) {
      res = Math.pow(x, a) / (gamma(a) * gammaDeltaRatio(b, a));
    } else {
      let pow0 = Math.pow(x, a);
      let bet = beta(a, b);
      if (denormal(pow0) || denormal(bet)) {
        res = Math.exp(a * Math.log(x) + logGamma(c) - logGamma(a) - logGamma(b));
      } else {
        res = pow0 / bet;
      }
    }
    if (deriv) {
      deriv.value = res * Math.pow(y, b);
    }
  } else {
    res = Math.pow(x, a);
  }
  if (denormal(res)) {
    return s0;
  }
  return sumSeries(incompleteBetaSeriesTerms(a, b, x, res), eps, maxTerms, s0);
}

function incompleteBetaFractionTerms(a: number, b: number, x: number, y: number): () => [number, number] {
  let m = 0;
  return () => {
    let an = (a + m - 1) * (a + b + m - 1) * m * (b - m) * x * x;
    let den = a + 2 * m - 1;
    an /= den * den;

    let bn = m;
    bn += (m * (b - m) * x) / (a + 2 * m - 1);
    bn += ((a + m) * (a * y - b * x + 1 + m * (2 - x))) / (a + 2 * m + 1);

    m += 1;
    return [an, bn];
  };
}

function incompleteBetaFraction(a: number, b: number, x: number, y: number, norm: boolean, deriv?: { value: number }): number {
  let res = incompleteBetaPowerTerms(a, b, x, y, norm);
  if (deriv) {
    deriv.value = res;
  }
  if (res == 0) {
    return res;
  }

  let frac = contFracB(incompleteBetaFractionTerms(a, b, x, y), eps, maxTerms);
  return res / frac;
}

function incompleteBetaAStep(
  a: number,
  b: number,
  x: number,
  y: number,
  k: number,
  norm: boolean,
  deriv?: { value: number }
): number {
  let pfx = incompleteBetaPowerTerms(a, b, x, y, norm);
  if (deriv) {
    deriv.value = pfx;
  }
  pfx /= a;
  if (pfx == 0) {
    return pfx;
  }
  let s = 1;
  let t = 1;
  for (let i = 0; i < k - 1; ++i) {
    t *= ((a + b + i) * x) / (a + i + 1);
    s += t;
  }
  pfx *= s;
  return pfx;
}

function risingFactorialRatio(a: number, b: number, k: number): number {
  if (k == 0) {
    return 1;
  }
  let res = 1;
  for (let i = 0; i < k; ++i) {
    res *= (a + i) / (b + i);
  }
  return res;
}

const PnSize = 30;

function incompleteBetaSmallBLargeASeries(
  a: number,
  b: number,
  x: number,
  y: number,
  s0: number,
  mult: number,
  norm: boolean
): number {
  const bm1 = b - 1;
  let t = a + bm1 / 2;
  let lx = y < 0.35 ? Math.log1p(-y) : Math.log(x);
  let u = -t * lx;
  let h = regularisedGammaPrefix(b, u);
  if (denormal(h)) {
    return s0;
  }
  let pfx;
  if (norm) {
    pfx = h / gammaDeltaRatio(a, b);
    pfx /= Math.pow(t, b);
  } else {
    pfx = fullGammaPrefix(b, u) / Math.pow(t, b);
  }
  pfx *= mult;

  let p: number[] = [1];

  let j = incompleteGamma(b, u, { lower: false, normalised: true }) / h;

  let s = s0 + pfx * j;
  let tnp1 = 1;
  let lx2 = (lx / 2) ** 2;
  let lxp = 1;
  let t4 = 4 * t * t;
  let b2n = b;

  for (let n = 1; n < PnSize; ++n) {
    tnp1 += 2;
    p.push(0);
    let mbn = b - n;
    let tmp1 = 3;
    for (let m = 1; m < n; ++m) {
      mbn = m * b - n;
      p[n] += (mbn * p[n - m]) / factorials[tmp1];
      tmp1 += 2;
    }
    p[n] /= n;
    p[n] += bm1 / factorials[tnp1];

    j = (b2n * (b2n + 1) * j + (u + b2n + 1) * lxp) / t4;
    lxp *= lx2;
    b2n += 2;

    let r = pfx * p[n] * j;
    s += r;
    if (r > 1) {
      if (r < eps * s) {
        break;
      }
    } else {
      if (Math.abs(r / eps) < Math.abs(s)) {
        break;
      }
    }
  }
  return s;
}

function binomialCCDF(n: number, k: number, x: number, y: number): number {
  let res = Math.pow(x, n);
  //console.log(`binomialCCDF(${n}, ${k}, ${x}, ${y}): pow(${x}, ${n}) = ${res}, denormal(res) = ${denormal(res)}`);
  if (!denormal(res)) {
    let t = res;
    for (let i = n - 1; i > k; --i) {
      t *= ((i + 1) * y) / ((n - i) * x);
      res += t;
    }
  } else {
    let start = Math.trunc(n * x);
    if (start <= k + 1) {
      start = Math.trunc(k + 2);
    }
    res = Math.pow(x, start) * Math.pow(y, n - start) * choose(n, start);
    if (res == 0) {
      for (let i = start - 1; i > k; --i) {
        res += Math.pow(x, i) * Math.pow(y, n - i) * choose(n, i);
      }
    } else {
      let t = res;
      let t0 = res;
      for (let i = start - 1; i > k; --i) {
        t *= ((i + 1) * y) / ((n - i) * x);
        res += t;
      }
      t = t0;
      for (let i = start + 1; i <= n; ++i) {
        t *= ((n - i + 1) * x) / (i * y);
        res += t;
      }
    }
  }
  return res;
}

export function incompleteBetaImpl(
  a: number,
  b: number,
  x: number,
  inv: boolean,
  norm: boolean,
  deriv?: { value: number }
): number {
  //const memento = {beta: {a, b, x, inv, norm, deriv: (deriv != undefined)}}
  domain(x, { greaterThanOrEqual: 0, lessThanOrEqual: 1 });
  if (norm) {
    domain(a, { greaterThanOrEqual: 0 });
    domain(b, { greaterThanOrEqual: 0 });
    if (a == 0 && b == 0) {
      throw new Error(`incompleteBetaImpl(${a}, ${b}, ${x}): a or b must be > 0`);
    }
    if (a == 0) {
      //codePaths.capture("beta 01", memento);
      if (deriv) {
        deriv.value = 0;
      }
      return inv ? 0 : 1;
    }
    if (b == 0) {
      //codePaths.capture("beta 02", memento);
      if (deriv) {
        deriv.value = 0;
      }
      return inv ? 1 : 0;
    }
  } else {
    domain(a, { greaterThan: 0 });
    domain(b, { greaterThan: 0 });
  }
  if (deriv && !norm) {
    throw new DomainError(`incompleteBetaImpl(${a}, ${b}, ${x}): derivative can only be computed on normalized incomplete beta`)
  }

  let y = 1 - x;

  if (deriv) {
    deriv.value = -1; // sentinel
  }

  if (x == 0) {
    //codePaths.capture("beta 03", memento);
    if (deriv) {
      if (a == 1) {
        //codePaths.capture("beta 03a", memento);
        deriv.value = 1;
      } else if (a < 1) {
        //codePaths.capture("beta 03b", memento);
        deriv.value = Number.MAX_VALUE / 2;
      } else {
        //codePaths.capture("beta 03c", memento);
        deriv.value = Number.MIN_VALUE * 2;
      }
    }
    return inv ? (norm ? 1 : beta(a, b)) : 0;
  }
  if (x == 1) {
    //codePaths.capture("beta 04", memento);
    if (deriv) {
      if (b == 1) {
        //codePaths.capture("beta 04a", memento);
        deriv.value = 1;
      } else if (b < 1) {
        //codePaths.capture("beta 04b", memento);
        deriv.value = Number.MAX_VALUE / 2;
      } else {
        //codePaths.capture("beta 04c", memento);
        deriv.value = Number.MIN_VALUE * 2;
      }
    }
    return !inv ? (norm ? 1 : beta(a, b)) : 0;
  }
  if (a == 0.5 && b == 0.5) {
    //codePaths.capture("beta 05", memento);
    if (deriv) {
      //codePaths.capture("beta 05a", memento);
      deriv.value = (1 / Math.PI) * Math.sqrt(y * x);
    }
    let p = inv ? Math.asin(Math.sqrt(y)) / halfPi : Math.asin(Math.sqrt(x)) / halfPi;
    if (!norm) {
      //codePaths.capture("beta 05b", memento);
      p *= Math.PI;
    }
    return p;
  }

  if (a == 1) {
    // swap a <-> b
    //      x <-> y
    // flip inv
    let t = a;
    a = b;
    b = t;
    t = x;
    x = y;
    y = t;
    inv = !inv;
  }

  if (b == 1) {
    if (a == 1) {
      //codePaths.capture("beta 06", memento);
      if (deriv) {
        //codePaths.capture("beta 06a", memento);
        deriv.value = 1;
      }
      return inv ? y : x;
    }

    //codePaths.capture("beta 07", memento);
    if (deriv) {
      //codePaths.capture("beta 07a", memento);
      deriv.value = a * Math.pow(x, a - 1);
    }
    let p;
    if (y < 0.5) {
      //codePaths.capture("beta 07b", memento);
      p = inv ? -Math.expm1(a * Math.log1p(-y)) : Math.exp(a * Math.log1p(-y));
    } else {
      //codePaths.capture("beta 07c", memento);
      p = inv ? -powm1(x, a) : Math.pow(x, a);
    }
    if (!norm) {
      //codePaths.capture("beta 07d", memento);
      p /= a;
    }
    return p;
  }

  let frac;
  if (Math.min(a, b) <= 1) {
    if (x > 0.5) {
      // swap a <-> b
      //      x <-> y
      // flip inv
      let t = a;
      a = b;
      b = t;
      t = x;
      x = y;
      y = t;
      inv = !inv;
    }

    if (Math.max(a, b) <= 1) {
      if (a >= Math.min(0.2, b) || Math.pow(x, a) < 0.9) {
        if (!inv) {
          //codePaths.capture("beta 08", memento);
          frac = incompleteBetaSeries(a, b, x, 0, norm, y, deriv);
        } else {
          //codePaths.capture("beta 09", memento);
          frac = norm ? -1 : -beta(a, b);
          inv = false;
          frac = -incompleteBetaSeries(a, b, x, frac, norm, y, deriv);
        }
      } else {
        // swap a <-> b
        //      x <-> y
        // flip inv
        let t = a;
        a = b;
        b = t;
        t = x;
        x = y;
        y = t;
        inv = !inv;
        if (y >= 0.3) {
          if (!inv) {
            //codePaths.capture("beta 10", memento);
            frac = incompleteBetaSeries(a, b, x, 0, norm, y, deriv);
          } else {
            //codePaths.capture("beta 11", memento);
            frac = norm ? -1 : -beta(a, b);
            inv = false;
            frac = -incompleteBetaSeries(a, b, x, frac, norm, y, deriv);
          }
        } else {
          let pfx;
          if (!norm) {
            //codePaths.capture("beta 12a", memento);
            pfx = risingFactorialRatio(a + b, a, 20);
          } else {
            //codePaths.capture("beta 12b", memento);
            pfx = 1;
          }
          frac = incompleteBetaAStep(a, b, x, y, 20, norm, deriv);
          if (!inv) {
            //codePaths.capture("beta 13a", memento);
            frac = incompleteBetaSmallBLargeASeries(a + 20, b, x, y, frac, pfx, norm);
          } else {
            //codePaths.capture("beta 13b", memento);
            frac -= norm ? 1 : beta(a, b);
            inv = false;
            frac = -incompleteBetaSmallBLargeASeries(a + 20, b, x, y, frac, pfx, norm);
          }
        }
      }
    } else {
      if (b <= 1 || (x < 0.1 && Math.pow(b * x, a) <= 0.7)) {
        if (!inv) {
          //codePaths.capture("beta 14a", memento);
          frac = incompleteBetaSeries(a, b, x, 0, norm, y, deriv);
        } else {
          //codePaths.capture("beta 14b", memento);
          frac = norm ? -1 : -beta(a, b);
          inv = false;
          frac = -incompleteBetaSeries(a, b, x, frac, norm, y, deriv);
        }
      } else {
        // swap a <-> b
        //      x <-> y
        // flip inv
        let t = a;
        a = b;
        b = t;
        t = x;
        x = y;
        y = t;
        inv = !inv;

        if (y >= 0.3) {
          if (!inv) {
            //codePaths.capture("beta 15a", memento);
            frac = incompleteBetaSeries(a, b, x, 0, norm, y, deriv);
          } else {
            //codePaths.capture("beta 15b", memento);
            frac = norm ? -1 : -beta(a, b);
            inv = false;
            frac = -incompleteBetaSeries(a, b, x, frac, norm, y, deriv);
          }
        } else if (a >= 15) {
          if (!inv) {
            //codePaths.capture("beta 16a", memento);
            frac = incompleteBetaSmallBLargeASeries(a, b, x, y, 0, 1, norm);
          } else {
            //codePaths.capture("beta 16b", memento);
            frac = norm ? -1 : -beta(a, b);
            inv = false;
            frac = -incompleteBetaSmallBLargeASeries(a, b, x, y, frac, 1, norm);
          }
        } else {
          let pfx;
          if (!norm) {
            //codePaths.capture("beta 17a", memento);
            pfx = risingFactorialRatio(a + b, a, 20);
          } else {
            //codePaths.capture("beta 17b", memento);
            pfx = 1;
          }
          frac = incompleteBetaAStep(a, b, x, y, 20, norm, deriv);
          if (!inv) {
            //codePaths.capture("beta 18a", memento);
            frac = incompleteBetaSmallBLargeASeries(a + 20, b, x, y, frac, pfx, norm);
          } else {
            //codePaths.capture("beta 18b", memento);
            frac -= norm ? 1 : beta(a, b);
            inv = false;
            frac = -incompleteBetaSmallBLargeASeries(a + 20, b, x, y, frac, pfx, norm);
          }
        }
      }
    }
  } else {
    let lam;
    if (a < b) {
      //codePaths.capture("beta 19a", memento);
      lam = a - (a + b) * x;
    } else {
      //codePaths.capture("beta 19b", memento);
      lam = (a + b) * y - b;
    }
    if (lam < 0) {
      //codePaths.capture("beta 19c", memento);
      // swap a <-> b
      //      x <-> y
      // flip inv
      let t = a;
      a = b;
      b = t;
      t = x;
      x = y;
      y = t;
      inv = !inv;
    }

    //console.log(`a=${a}, b=${b}, x=${x}, y=${y}, inv=${inv}`);
    if (b < 40) {
      if (Math.floor(a) == a && Math.floor(b) == b && a < Number.MAX_VALUE - 100 && y != 1) {
        //codePaths.capture("beta 20", memento);
        let k = a - 1;
        let n = b + k;
        frac = binomialCCDF(n, k, x, y);
        if (!norm) {
          //codePaths.capture("beta 20a", memento);
          frac *= beta(a, b);
        }
      } else if (b * x < 0.7) {
        if (!inv) {
          //codePaths.capture("beta 21a", memento);
          frac = incompleteBetaSeries(a, b, x, 0, norm, y, deriv);
        } else {
          //codePaths.capture("beta 21b", memento);
          frac = norm ? -1 : -beta(a, b);
          inv = false;
          frac = -incompleteBetaSeries(a, b, x, frac, norm, y, deriv);
        }
      } else if (a > 15) {
        //codePaths.capture("beta 22", memento);
        let n = Math.floor(b);
        if (n == b) {
          //codePaths.capture("beta 22a", memento);
          n -= 1;
        }
        let bbar = b - n;
        let pfx;
        if (!norm) {
          //codePaths.capture("beta 22b", memento);
          pfx = risingFactorialRatio(a + bbar, bbar, n);
        } else {
          //codePaths.capture("beta 22c", memento);
          pfx = 1;
        }
        frac = incompleteBetaAStep(bbar, a, y, x, n, norm);
        frac = incompleteBetaSmallBLargeASeries(a, bbar, x, y, frac, 1, norm);
        frac /= pfx;
      } else if (norm) {
        //codePaths.capture("beta 23", memento);
        let n = Math.floor(b);
        let bbar = b - n;
        if (bbar <= 0) {
          //codePaths.capture("beta 23a", memento);
          n -= 1;
          bbar += 1;
        }
        frac = incompleteBetaAStep(bbar, a, y, x, n, norm);
        frac += incompleteBetaAStep(a, bbar, x, y, 20, norm);
        if (inv) {
          //codePaths.capture("beta 23b", memento);
          frac -= 1;
        }
        frac = incompleteBetaSmallBLargeASeries(a + 20, bbar, x, y, frac, 1, norm);
        if (inv) {
          //codePaths.capture("beta 23c", memento);
          frac = -frac;
          inv = false;
        }
      } else {
        //codePaths.capture("beta 24", memento);
        frac = incompleteBetaFraction(a, b, x, y, norm, deriv);
      }
    } else {
      //codePaths.capture("beta 25", memento);
      frac = incompleteBetaFraction(a, b, x, y, norm, deriv);
    }
  }

  if (deriv) {
    if (deriv.value < 0) {
      //codePaths.capture("beta 26a", memento);
      deriv.value = incompleteBetaPowerTerms(a, b, x, y, true);
    }
    let div = y * x;

    if (deriv.value != 0) {
      if (Number.MAX_VALUE * div < deriv.value) {
        //codePaths.capture("beta 26b", memento);
        deriv.value = Number.MAX_VALUE / 2;
      } else {
        //codePaths.capture("beta 26c", memento);
        deriv.value /= div;
      }
    }
  }
  return inv ? (norm ? 1 : beta(a, b)) - frac : frac;
}

export interface IncompleteBetaOptions {
  lower?: boolean;
  normalised?: boolean;
  derivative?: {value: number};
}

export function incompleteBeta(a: number, b: number, x: number, options?: IncompleteBetaOptions): number {
  let inv = false;
  if (options && options.lower != undefined) {
    inv = !options.lower;
  }
  let norm = true;
  if (options && options.normalised != undefined) {
    norm = options.normalised;
  }
  let deriv = undefined;
  if (options && options.derivative) {
    deriv = options.derivative;
  }
  return incompleteBetaImpl(a, b, x, inv, norm, deriv);
}

export function incompleteBetaDerivative(a: number, b: number, x: number): number {
  domain(a, { greaterThan: 0 });
  domain(b, { greaterThan: 0 });
  domain(x, { greaterThanOrEqual: 0, lessThanOrEqual: 1 });

  if (x == 0) {
    if (a > 1) {
      return 0;
    }
    if (a == 1) {
      return 1 / beta(a, b);
    }
    throw new OverflowError(`incompleteBetaDerivative(${a}, ${b}, ${x})`);
  }
  if (x == 1) {
    if (b > 1) {
      return 0;
    }
    if (b == 1) {
      return 1 / beta(a, b);
    }
    throw new OverflowError(`incompleteBetaDerivative(${a}, ${b}, ${x})`);
  }
  let y = 1 - x;
  let z = x * y;
  return incompleteBetaPowerTerms(a, b, x, y, true, 1 / z);
}
