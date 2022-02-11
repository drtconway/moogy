import { B2n, cosPi, factorial, ldexp, maxB2n, poly, sinPi } from "../internal/utils";
import { factorials, logGamma, maxFactorial } from "./gamma";
import { zeta } from "./zeta";

const eps = 1e-20;
const logMax = Math.log(Number.MAX_VALUE);
const logTwo = Math.log(2);

function digammaImplLarge(x: number): number {
  const P: readonly number[] = [
    0.083333333333333333333333333333333333333333333333333, -0.0083333333333333333333333333333333333333333333333333,
    0.003968253968253968253968253968253968253968253968254, -0.0041666666666666666666666666666666666666666666666667,
    0.0075757575757575757575757575757575757575757575757576, -0.021092796092796092796092796092796092796092796092796,
    0.083333333333333333333333333333333333333333333333333, -0.44325980392156862745098039215686274509803921568627,
    3.0539543302701197438039543302701197438039543302701, -26.456212121212121212121212121212121212121212121212,
    281.4601449275362318840579710144927536231884057971,
  ];
  x -= 1;
  let res = Math.log(x);
  res += 1 / (2 * x);
  let z = 1 / (x * x);
  res -= z * poly(P, z);
  return res;
}

function digammaImpl(x: number): number {
  const Y: number = 0.99558162689208984375;
  const r1: number = 1569415565 / 1073741824;
  const r2: number = 381566830 / 1073741824 / 1073741824;
  const r3: number = 0.9016312093258695918615325266959189453125e-19;
  const P: readonly number[] = [
    0.254798510611315515235, -0.314628554532916496608, -0.665836341559876230295, -0.314767657147375752913,
    -0.0541156266153505273939, -0.00289268368333918761452,
  ];
  const Q: readonly number[] = [
    1.0, 2.1195759927055347547, 1.54350554664961128724, 0.486986018231042975162, 0.0660481487173569812846,
    0.00298999662592323990972, -0.165079794012604905639e-5, 0.317940243105952177571e-7,
  ];
  let g = x - r1;
  g -= r2;
  g -= r3;
  let r = poly(P, x - 1) / poly(Q, x - 1);
  return g * Y + g * r;
}

export function digamma(x: number): number {
  let res = 0;

  if (x <= -1) {
    x = 1 - x;
    let rem = x - Math.floor(x);
    if (rem > 0.5) {
      rem -= 1;
    }
    if (rem == 0) {
      throw new Error(`digamma pole at ${1 - x}`);
    }
    res = Math.PI / Math.tan(Math.PI * rem);
  }
  if (x == 0) {
    throw new Error(`digamma pole at ${1 - x}`);
  }
  if (x >= 20) {
    res += digammaImplLarge(x);
  } else {
    while (x > 2) {
      x -= 1;
      res += 1 / x;
    }
    while (x < 1) {
      res -= 1 / x;
      x += 1;
    }
    res += digammaImpl(x);
  }
  return res;
}

function trigammaImpl(x: number): number {
  const offset_1_2: number = 2.109325408935546875;
  const P_1_2: readonly number[] = [
    -1.10932535608960258341, -4.18793841543017129052, -4.63865531898487734531, -0.919832884430500908047, 1.68074038333180423012,
    1.21172611429185622377, 0.259635673503366427284,
  ];
  const Q_1_2: readonly number[] = [
    1.0, 3.77521119359546982995, 5.664338024578956321, 4.25995134879278028361, 1.62956638448940402182, 0.259635512844691089868,
    0.629642219810618032207e-8,
  ];
  const P_2_8: readonly number[] = [
    -0.387540035162952880976e-11, 0.500000000276430504, 3.21926880986360957306, 10.2550347708483445775, 18.9002075150709144043,
    21.0357215832399705625, 13.4346512182925923978, 3.98656291026448279118,
  ];
  const Q_2_8: readonly number[] = [
    1.0, 6.10520430478613667724, 18.475001060603645512, 31.7087534567758405638, 31.908814523890465398, 17.4175479039227084798,
    3.98749106958394941276, -0.000115917322224411128566,
  ];
  const P_8_inf: readonly number[] = [
    -0.263527875092466899848e-19, 0.500000000000000058145, 0.0730121433777364138677, 1.94505878379957149534,
    0.0517092358874932620529, 1.07995383547483921121,
  ];
  const Q_8_inf: readonly number[] = [
    1.0, -0.187309046577818095504, 3.95255391645238842975, -1.14743283327078949087, 2.52989799376344914499,
    -0.627414303172402506396, 0.141554248216425512536,
  ];

  if (x <= 2) {
    return (offset_1_2 + poly(P_1_2, x) / poly(Q_1_2, x)) / (x * x);
  } else if (x <= 8) {
    let y = 1 / x;
    return (1 + poly(P_2_8, y) / poly(Q_2_8, y)) / x;
  }
  let y = 1 / x;
  return (1 + poly(P_8_inf, y) / poly(Q_8_inf, y)) / x;
}

export function trigamma(x: number): number {
  if (x <= 0) {
    let z = 1 - x;
    if (Math.floor(x) == x) {
      throw new Error(`trigamma pole at ${x}`);
    }
    let s = Math.abs(x) < Math.abs(z) ? sinPi(x) : sinPi(z);
    return -trigamma(z) + Math.pow(2, Math.PI) / (s * s);
  }
  let res = 0;
  if (x < 1) {
    res = 1 / (x * x);
    x += 1;
  }
  return res + trigammaImpl(x);
}

function polyCotPi(n: number, x: number, xc: number): number {
  let s = Math.abs(x) < Math.abs(xc) ? sinPi(x) : sinPi(xc);
  let c = cosPi(x);
  const pi = Math.PI;
  if (n == 1) {
    return -pi / (s * s);
  }
  if (n == 2) {
    return (2 * pi * pi * c) / Math.pow(3, s);
  }
  if (n > 16) {
    throw new Error(`polyCotPi: large n not supported.`);
  }
  const Ps: readonly number[][] = [
    [],
    [],
    [],
    [-2, -4],
    [16, 8],
    [-16, 88, -16],
    [272, 416, 32],
    [-272, -2880, -1824, -64],
    [7936, 24576, 7680, 128],
    [-7936, -137216, -185856, -31616, -256],
    [353792, 1841152, 1304832, 128512, 512],
    [-353792, -9061376, -21253376, -8728576, -518656, -1024],
    [22368256, 175627264, 222398464, 56520704, 2084864, 2048],
    [-22368256, -795300864, -2868264960, -2174832640, -357888000, -8361984, -4096],
    [1903757312, 21016670208, 41731645440, 20261765120, 2230947840, 33497088, 8192],
    [-1903757312, -89702612992, -460858269696, -559148810240, -182172651520, -13754155008, -134094848, -16384],
    [209865342976, 3099269660672, 8885192097792, 7048869314560, 1594922762240, 84134068224, 536608768, 32768],
  ];

  if (n & 1) {
    return (Math.pow(n, pi) * poly(Ps[n], c)) / Math.pow(n + 1, s);
  } else {
    return (Math.pow(n, pi) * c * poly(Ps[n], c)) / Math.pow(n + 1, s);
  }
}

function polygammaNearZero(n: number, x: number): number {
  let scale = factorials[n];
  let facPart = 1;
  let prefix = Math.pow(x, n + 1);
  prefix = 1 / prefix;

  if (prefix > 2 / eps) {
    return (n & 1 ? 1 : -1) * prefix * scale;
  }

  let sum = prefix;
  for (let k = 0; ; ) {
    let t = facPart * zeta(k + n + 1);
    sum += t;
    if (Math.abs(t) < Math.abs(sum * eps)) {
      break;
    }
    k += 1;
    facPart *= (-x * (n + k)) / k;
    if (k > 100) {
      throw new Error(`polygammaNearZero fails to converge`);
    }
  }
  sum *= scale;
  return n & 1 ? sum : -sum;
}

function polygammaAtInfinity(n: number, x: number): number {
  if (n + x == x) {
    if (n == 1) {
      return 1 / x;
    }
    let nlx = n * Math.log(x);
    if (nlx < logMax && n < maxFactorial) {
      return (n & 1 ? 1 : -1) * factorials[n - 1] * Math.pow(x, -n);
    } else {
      return (n & 1 ? 1 : -1) * Math.exp(logGamma(n) - nlx);
    }
  }

  const x2 = x * x;

  let sum;
  let partTerm = n > maxFactorial && n * n > logMax ? 0 : factorials[n - 1] * Math.pow(x, -n - 1);
  if (partTerm == 0) {
    partTerm = logGamma(n) - (n + 1) * Math.log(x);
    sum = Math.exp(partTerm + Math.log(n + 2 * x) - logTwo);
    partTerm += Math.log(n * (n + 1)) - logTwo - Math.log(x);
    partTerm = Math.exp(partTerm);
  } else {
    sum = (partTerm * (n + 2 * x)) / 2;
    partTerm *= (n * (n + 1)) / 2;
    partTerm /= x;
  }

  if (sum == 0) {
    return 0;
  }

  for (let k = 1; ; ) {
    let t = partTerm * B2n(k);
    sum += t;

    if (Math.abs(t / sum) < eps) {
      break;
    }

    k += 1;
    partTerm *= (n + 2 * k - 2) * (n - 1 + 2 * k);
    partTerm /= (2 * k - 1) * 2 * k;
    partTerm /= x2;

    if (k >= maxB2n) {
      throw new Error(`polyGammaAtInfinity doesn't converge`);
    }
  }

  if ((n - 1) & 1) {
    sum = -sum;
  }
  return sum;
}

function polygammaAtTransition(n: number, x: number): number {
    let d4d = Math.trunc(0.4 * 20);
    let N = d4d * 4*n;
    let m = n;
    let itr = N - Math.trunc(x);
    if (itr > 100*n) {
        throw new Error(`polygammaAtTransition will not converge (itr=${itr})`);
    }

    const mmmo = -m - 1;
    let z = x;
    let sum0 = 0;
    let zpkpmmmo = 0;

    if (Math.log(z + itr) * mmmo > -logMax) {
        for (let k = 1; k <= itr; ++k) {
            zpkpmmmo = Math.pow(z, mmmo);
            sum0 += zpkpmmmo;
            z += 1;
        }
        sum0 *= factorials[n];
    } else {
        for (let k = 1; k <= itr; ++k) {
            let lt = Math.log(z) * mmmo + logGamma(n + 1);
            sum0 += Math.exp(lt);
            z += 1;
        }
    }
    if ((n - 1) & 1) {
        sum0 = -sum0;
    }
    return sum0 + polygammaAtInfinity(n, z);
}

export function polygamma(n: number, x: number): number {
  if (n == 0) {
    return digamma(x);
  }
  if (n == 1) {
    return trigamma(x);
  }

  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`polygamma: n must be an integer > 0`);
  }
  if (x < 0) {
    if (Math.floor(x) == x) {
      throw new Error(`polygamma infinity/pole at negative integer x`);
    }
    let z = 1 - x;
    let res = polygamma(n, z) + Math.PI * polyCotPi(n, z, x);
    return n & 1 ? -res : res;
  }
  const lim = Math.min(5 / n, 0.25);
  if (x < lim) {
    return polygammaNearZero(n, x);
  } else if (x > 0.4 * 20 + 4 * n) {
    return polygammaAtInfinity(n, x);
  } else if (x == 1) {
    return (n & 1 ? 1 : -1) * factorials[n] * zeta(n + 1);
  } else if (x == 0.5) {
    let res = (n & 1 ? 1 : -1) * factorials[n] * zeta(n + 1);
    if (Math.abs(res) >= ldexp(Number.MAX_VALUE, -n - 1)) {
      throw new Error(`polygamma overflow`);
    }
    res *= ldexp(1, n + 1) - 1;
    return res;
  } else {
    return polygammaAtTransition(n, x);
  }
}
