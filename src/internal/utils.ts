const _logFactorials: number[] = [0, 0];
for (let i = 2; i <= 25; ++i) {
  _logFactorials.push(Math.log(i) + _logFactorials[i - 1]);
}

export function logFactorial(n: number): number {
  // Ramanujan's formula
  // n! ~= sqrt(PI)*pow(n/e, n)*pow(((8*n + 4)*n + 1)*n + 1/30), 1/6)
  if (n == 0 || n == 1) {
    return 0;
  }
  if (n <= 25) {
    return _logFactorials[n];
  }
  const lsp = Math.log(Math.sqrt(Math.PI));
  const le = n * Math.log(n / Math.E);
  const lp = (1 / 6) * Math.log(((8 * n + 4) * n + 1) * n + 1 / 30);
  return lsp + le + lp;
}

export function logChoose(n: number, k: number): number {
  if (k == 0 || k == n) {
    return 0;
  }
  return logFactorial(n) - logFactorial(n - k) - logFactorial(k);
}

const _factorials: number[] = [1];
for (let i = 1; i <= 25; ++i) {
  _factorials.push(i * _factorials[i - 1]);
}

export function factorial(n: number): number {
  if (n <= 25 && Number.isInteger(n)) {
    return _factorials[n];
  }
  return Math.exp(logFactorial(n));
}

export function choose(n: number, k: number): number {
  if (k == 0 || k == n) {
    return 1;
  }
  let nmk = n - k;
  let res = 1;
  for (let j = 1; j <= k; ++j) {
    res *= nmk + j;
    res /= j;
  }
  return res;
}

export function logAdd(a: number, b: number): number {
  const x = Math.max(a, b);
  const y = Math.min(a, b);
  const w = y - x;
  return x + Math.log1p(Math.exp(w));
}

export function poly(P: readonly number[], z: number): number {
  let n = P.length - 1;
  let s = P[n--];
  while (n >= 0) {
    s *= z;
    s += P[n--];
  }
  return s;
}

export function frexp(value: number): [number, number] {
  if (value === 0) return [value, 0];
  const data = new DataView(new ArrayBuffer(8));
  data.setFloat64(0, value);
  let bits = (data.getUint32(0) >>> 20) & 0x7ff;
  if (bits === 0) {
    // denormal
    data.setFloat64(0, value * Math.pow(2, 64)); // exp + 64
    bits = ((data.getUint32(0) >>> 20) & 0x7ff) - 64;
  }
  const exponent = bits - 1022;
  const mantissa = ldexp(value, -exponent);
  return [mantissa, exponent];
}

export function ldexp(mantissa: number, exponent: number): number {
  const steps = Math.min(3, Math.ceil(Math.abs(exponent) / 1023));
  let result = mantissa;
  for (let i = 0; i < steps; i++) {
    result *= Math.pow(2, Math.floor((exponent + i) / steps));
  }
  return result;
}

export function correlation(xs: number[], ys: number[]): number {
  let sx = 0;
  let s2x = 0;
  let sy = 0;
  let s2y = 0;
  let sxy = 0;
  let n = xs.length;
  for (let i = 0; i < n; ++i) {
    sx += xs[i];
    s2x += xs[i] * xs[i];
    sy += ys[i];
    s2y += ys[i] * ys[i];
    sxy += xs[i] * ys[i];
  }
  return (n * sxy - sx * sy) / (Math.sqrt(n * s2x - sx * sx) * Math.sqrt(n * s2y - sy * sy));
}

export function contFracA(g: () => [number, number], factor: number, maxTerms: number = 20): number {
  const tiny = 1e-300;
  const terminator = Math.abs(factor);

  let v = g();
  let a0 = v[0];
  let f = v[1];
  if (f == 0) {
    f = tiny;
  }
  let C = f;
  let D = 0;
  let counter = maxTerms;
  while (counter > 0) {
    v = g();
    D = v[1] + v[0] * D;
    if (D == 0) {
      D = tiny;
    }
    C = v[1] + v[0] / C;
    if (C == 0) {
      C = tiny;
    }
    D = 1 / D;
    let delta = C * D;
    f *= delta;
    if (Math.abs(delta - 1) < terminator) {
      break;
    }
    counter -= 1;
  }
  return a0 / f;
}

export function contFracB(g: () => [number, number], factor: number, maxTerms: number = 20): number {
  const tiny = 1e-300;
  const terminator = Math.abs(factor);

  let v = g();
  let f = v[1];
  if (f == 0) {
    f = tiny;
  }
  let C = f;
  let D = 0;

  let counter = maxTerms;
  while (counter > 0) {
    v = g();
    D = v[1] + v[0] * D;
    if (D == 0) {
      D = tiny;
    }
    C = v[1] + v[0] / C;
    if (C == 0) {
      C = tiny;
    }
    D = 1 / D;
    let delta = C * D;
    f *= delta;
    if (Math.abs(delta - 1) < terminator) {
      break;
    }
    counter -= 1;
  }
  return f;
}

export function sumSeries(g: () => number, factor: number, maxTerms: number = 20, initValue = 0): number {
  let res = initValue;
  let counter = maxTerms;
  while (counter > 0) {
    let t = g();
    res += t;
    if (Math.abs(factor * res) > Math.abs(t)) {
      break;
    }
    counter -= 1;
  }
  return res;
}

const bernoulliNumerators: readonly number[] = [
  1, 1, -1, 1, -1, 5, -691, 7, -3617, 43867, -174611, 854513, -236364091, 8553103, -23749461029, 8615841276005, -7709321041217,
  2577687858367, -26315271553053477373, 2929993913841559, -261082718496449122051,
];
const bernoulliDenominators: readonly number[] = [
  1, 6, 30, 42, 30, 66, 2730, 6, 510, 798, 330, 138, 2730, 6, 870, 14322, 510, 6, 1919190, 6, 13530, 1806, 690, 282, 46410, 66,
  1590, 798, 870, 354, 56786730, 6, 510, 64722, 30, 4686, 140100870, 6, 30, 3318, 230010, 498, 3404310, 6, 61410, 272118, 1410, 6,
  4501770, 6, 33330, 4326, 1590, 642, 209191710, 1518, 1671270, 42,
];

export const maxB2n = bernoulliNumerators.length - 1;

export function B2n(n: number): number {
  return bernoulliNumerators[n] / bernoulliDenominators[n];
}

export function sinPi(x: number): number {
  if (x < 0) {
    return -sinPi(-x);
  }
  if (x < 0.5) {
    return Math.sin(Math.PI * x);
  }
  let inv = false;
  if (x < 1) {
    inv = true;
    x = -x;
  }
  let rem = Math.floor(x);
  if (rem & 1) {
    inv = !inv;
  }
  rem = x - rem;
  if (rem > 0.5) {
    rem = 1 - rem;
  }
  if (rem == 0.5) {
    return inv ? -1 : 1;
  }
  rem = Math.sin(Math.PI * rem);
  return inv ? -rem : rem;
}

export function cosPi(x : number) : number {
    if (Math.abs(x) < 0.25) {
        return Math.cos(Math.PI * x);
    }
    if (x < 0) {
        x = -x;
    }
    let rem = Math.floor(x);
    let inv : boolean = false;
    if (rem & 1) {
        inv = !inv;
    }
    rem = x - rem;
    if (rem > 0.5) {
        rem = 1 - rem;
        inv = !inv;
    }
    if (rem == 0.5) {
        return 0;
    }
    if (rem > 0.25) {
        rem = 0.5 - rem;
        rem = Math.sin(Math.PI*rem);
    } else {
        rem = Math.cos(Math.PI*rem);
    }
    return inv ? -rem : rem;
}