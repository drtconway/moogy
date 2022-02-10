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

export function correlation(xs : number[], ys: number[]) : number {
    let sx = 0;
    let s2x = 0;
    let sy = 0;
    let s2y = 0;
    let sxy = 0;
    let n = xs.length;
    for (let i = 0; i < n; ++i) {
        sx += xs[i];
        s2x += xs[i]*xs[i];
        sy += ys[i];
        s2y += ys[i]*ys[i];
        sxy += xs[i]*ys[i];
    }
    return (n * sxy - sx*sy) / (Math.sqrt(n*s2x - sx*sx)*Math.sqrt(n*s2y - sy*sy));
}

export function contFracA(g : () => [number, number], factor: number, maxTerms: number = 20) : number {
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
        D = v[1] + v[0]*D;
        if (D == 0) {
            D = tiny;
        }
        C = v[1] + v[0]/C;
        if (C == 0) {
            C = tiny;
        }
        D = 1/D;
        let delta = C*D;
        f *= delta;
        if (Math.abs(delta - 1) < terminator) {
            break;
        }
        counter -= 1;
    }
    return a0/f;
}

export function contFracB(g : () => [number, number], factor: number, maxTerms: number = 20) : number {
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
        C = v[1] + v[0]/C;
        if (C == 0) {
            C = tiny;
        }
        D = 1/D;
        let delta = C*D;
        f *= delta;
        if (Math.abs(delta - 1) < terminator) {
            break;
        }
        counter -= 1;
    }
    return f;
}