import { sumSeries } from "../internal/utils";
import { domain, DomainError, OverflowError } from "../internal/checks";

const logMax = 709.0;

export function powm1(x: number, y: number): number {
  domain(y, {
    satisfies: () => {
      return x > 0 || Math.trunc(y) == y || `powm1(${x}, ${y}): y must be an integer.`;
    },
  });
  if (x > 0) {
    if (Math.abs(y * (x - 1)) < 0.5 || Math.abs(y) < 0.2) {
      let l = y * Math.log(x);
      if (l < 0.5) {
        return Math.expm1(l);
      }
      if (l > logMax) {
        throw new OverflowError(`powm1(${x}, ${y}) overflows.`);
      }
    }
  } else {
    if (Math.trunc(y / 2) == y / 2) {
      return powm1(-x, y);
    }
  }
  return Math.pow(x, y) - 1;
}

function log1pSeriesTerms(x: number): () => number {
  let k = 0;
  let m = -x;
  let p = -1;
  return () => {
    k += 1;
    p *= m;
    return p / k;
  };
}

export function log1pmx(x: number): number {
  domain(x, { greaterThan: -1 });
  let a = Math.abs(x);
  if (a > 0.95) {
    return Math.log1p(x) - x;
  }
  if (a < 1e-20) {
    return (-x * x) / 2;
  }
  let terms = log1pSeriesTerms(x);
  terms(); // drop the first term!
  return sumSeries(terms, 1e-20, 100);
}

const a0: number = 0.6931471805599452862268; // log 2

/**
 * log(1 - exp(-a))
 * @param a number a >= 0;
 * @returns log(1 - exp(-a))
 */
export function log1mexp(a: number): number {
  if (a <= 0) {
    throw new DomainError(`log1mexp: argument must be > 0`);
  }
  if (a <= a0) {
    return Math.log(-Math.expm1(-a));
  }
  return Math.log1p(-Math.exp(-a));
}

/**
 * log(1 + exp(x))
 * @param x number
 * @returns log(1 + exp(x))
 */
export function log1pexp(x: number): number {
  if (x < -37) {
    return Math.exp(x);
  }
  if (x <= 18) {
    return Math.log1p(Math.exp(x));
  }
  if (x <= 33.3) {
    return x + Math.exp(-x);
  }
  return x;
}

export function logAdd(a: number, b: number): number {
  const x = Math.max(a, b);
  const y = Math.min(a, b);
  const w = y - x;
  return x + log1pexp(w);
}
