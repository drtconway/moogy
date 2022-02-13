import { B2n, factorial, ldexp, maxB2n, poly, sinPi } from "../internal/utils";
import { factorials, gamma, logGamma, maxFactorial } from "./gamma";

const logRoot2Pi: number = 9.189385332046727417803297364056176398e-1;
const log2Pi: number = Math.log(2 * Math.PI);

function zetaImpPrec(s: number, sc: number): number {
  let res;
  if (s < 1) {
    const P: readonly number[] = [
      0.243392944335937499969, -0.496837806864865688082, 0.0680008039723709987107, -0.00511620413006619942112,
      0.000455369899250053003335, -0.279496685273033761927e-4,
    ];
    const Q: readonly number[] = [
      1.0, -0.30425480068225790522, 0.050052748580371598736, -0.00519355671064700627862, 0.000360623385771198350257,
      -0.159600883054550987633e-4, 0.339770279812410586032e-6,
    ];
    res = poly(P, sc) / poly(Q, sc);
    res -= 1.2433929443359375;
    res += sc;
    res /= sc;
  } else if (s <= 2) {
    const P: readonly number[] = [
      0.577215664901532860605, 0.222537368917162139445, 0.0356286324033215682729, 0.00304465292366350081446,
      0.000178102511649069421904, 0.700867470265983665042e-5,
    ];
    const Q: readonly number[] = [
      1.0, 0.259385759149531030085, 0.0373974962106091316854, 0.00332735159183332820617, 0.000188690420706998606469,
      0.635994377921861930071e-5, 0.226583954978371199405e-7,
    ];
    res = poly(P, -sc) / poly(Q, -sc);
    res += 1 / -sc;
  } else if (s <= 4) {
    const Y: number = 0.6986598968505859375;
    const P: readonly number[] = [
      -0.053725830002359501027, 0.0470551187571475844778, 0.0101339410415759517471, 0.00100240326666092854528,
      0.685027119098122814867e-4, 0.390972820219765942117e-5, 0.540319769113543934483e-7,
    ];
    const Q: readonly number[] = [
      1.0, 0.286577739726542730421, 0.0447355811517733225843, 0.00430125107610252363302, 0.000284956969089786662045,
      0.116188101609848411329e-4, 0.278090318191657278204e-6, -0.19683620233222028478e-8,
    ];
    res = poly(P, s - 2) / poly(Q, s - 2);
    res += Y + 1 / -sc;
  } else if (s <= 7) {
    const P: readonly number[] = [
      -2.49710190602259407065, -3.36664913245960625334, -1.77180020623777595452, -0.464717885249654313933,
      -0.0643694921293579472583, -0.00464265386202805715487, -0.000165556579779704340166, -0.252884970740994069582e-5,
    ];
    const Q: readonly number[] = [
      1.0, 1.01300131390690459085, 0.387898115758643503827, 0.0695071490045701135188, 0.00586908595251442839291,
      0.000217752974064612188616, 0.397626583349419011731e-5, -0.927884739284359700764e-8, 0.119810501805618894381e-9,
    ];
    res = poly(P, s - 4) / poly(Q, s - 4);
    res = 1 + Math.exp(res);
  } else if (s < 15) {
    const P: readonly number[] = [
      -4.78558028495135548083, -3.23873322238609358947, -0.892338582881021799922, -0.131326296217965913809,
      -0.0115651591773783712996, -0.000657728968362695775205, -0.252051328129449973047e-4, -0.626503445372641798925e-6,
      -0.815696314790853893484e-8,
    ];
    const Q: readonly number[] = [
      1.0, 0.525765665400123515036, 0.10852641753657122787, 0.0115669945375362045249, 0.000732896513858274091966,
      0.30683952282420248448e-4, 0.819649214609633126119e-6, 0.117957556472335968146e-7, -0.193432300973017671137e-12,
    ];
    res = poly(P, s - 7) / poly(Q, s - 7);
    res = 1 + Math.exp(res);
  } else if (s < 42) {
    const P: readonly number[] = [
      -10.3948950573308861781, -2.82646012777913950108, -0.342144362739570333665, -0.0249285145498722647472,
      -0.00122493108848097114118, -0.423055371192592850196e-4, -0.1025215577185967488e-5, -0.165096762663509467061e-7,
      -0.145392555873022044329e-9,
    ];
    const Q: readonly number[] = [
      1.0, 0.205135978585281988052, 0.0192359357875879453602, 0.00111496452029715514119, 0.434928449016693986857e-4,
      0.116911068726610725891e-5, 0.206704342290235237475e-7, 0.209772836100827647474e-9, -0.939798249922234703384e-16,
      0.264584017421245080294e-18,
    ];
    res = poly(P, s - 15) / poly(Q, s - 15);
    res = 1 + Math.exp(res);
  } else if (s < 63) {
    res = 1 + Math.pow(2, -s);
  } else {
    res = 1;
  }
  return res;
}

function zetaImpOddInt(s: number): number {
  const R: readonly number[] = [
    1.20205690315959428539973816151145, 1.0369277551433699263313654864570342, 1.0083492773819228268397975498497968,
    1.0020083928260822144178527692324121, 1.0004941886041194645587022825264699, 1.0001227133475784891467518365263574,
    1.0000305882363070204935517285106451, 1.000007637197637899762273600293563, 1.0000019082127165539389256569577951,
    1.0000004769329867878064631167196044, 1.0000001192199259653110730677887189, 1.0000000298035035146522801860637051,
    1.0000000074507117898354294919810042, 1.0000000018626597235130490064039099, 1.0000000004656629065033784072989233,
    1.0000000001164155017270051977592974, 1.0000000000291038504449709968692943, 1.0000000000072759598350574810145209,
    1.0000000000018189896503070659475848, 1.0000000000004547473783042154026799, 1.0000000000001136868407680227849349,
    1.0000000000000284217097688930185546, 1.0000000000000071054273952108527129, 1.0000000000000017763568435791203275,
    1.0000000000000004440892103143813364, 1.0000000000000001110223025141066134, 1.0000000000000000277555756213612417,
    1.0000000000000000069388939045441537, 1.0000000000000000017347234760475766, 1.000000000000000000433680869002065,
    1.0000000000000000001084202172494241, 1.0000000000000000000271050543122347, 1.0000000000000000000067762635780452,
    1.0000000000000000000016940658945098, 1.0000000000000000000004235164736273, 1.0000000000000000000001058791184068,
    1.0000000000000000000000264697796017, 1.0000000000000000000000066174449004, 1.0000000000000000000000016543612251,
    1.0000000000000000000000004135903063, 1.0000000000000000000000001033975766, 1.0000000000000000000000000258493941,
    1.0000000000000000000000000064623485, 1.0000000000000000000000000016155871, 1.0000000000000000000000000004038968,
    1.0000000000000000000000000001009742, 1.0000000000000000000000000000252435, 1.0000000000000000000000000000063109,
    1.0000000000000000000000000000015777, 1.0000000000000000000000000000003944, 1.0000000000000000000000000000000986,
    1.0000000000000000000000000000000247, 1.0000000000000000000000000000000062, 1.0000000000000000000000000000000015,
    1.0000000000000000000000000000000004, 1.0000000000000000000000000000000001,
  ];
  let idx = (s - 3) >> 1;
  return idx < R.length ? R[idx] : 1;
}

function zetaImpl(s: number, sc: number): number {
  if (s > 40) {
    return 1;
  }
  if (Math.floor(s) == s) {
    let v = Math.trunc(s);
    if (v == s) {
      let vEven: boolean = (v & 1) == 0;
      if (v < 0) {
        let nv = -v;
        let nvEven: boolean = (nv & 1) == 0;
        if (nvEven) {
          return 0;
        }
        let n = (nv + 1) >> 1;
        if (n < maxB2n) {
          return ((nvEven ? 1 : -1) * B2n(n)) / (1 - v);
        }
      } else if (vEven) {
        const v2: number = v >> 1;
        const v2m1Even: boolean = ((v2 - 1) & 1) == 0;
        if (v2 < maxB2n && v <= maxFactorial) {
          return ((v2m1Even ? 1 : -1) * ldexp(1, v - 1) * Math.pow(Math.PI, v) * B2n(v2)) / factorials[v];
        }
        return ((v2m1Even ? 1 : -1) * ldexp(1, v - 1) * Math.pow(Math.PI, v) * B2n(v2)) / factorial(v);
      } else {
        return zetaImpOddInt(v);
      }
    }
  }

  let res;
  if (Math.abs(s) < 1e-20) {
    res = -0.5 * logRoot2Pi * s;
  } else if (s < 0) {
    {
      let tmp = s;
      s = sc;
      sc = tmp;
    }
    if (Math.floor(sc / 2) == sc / 2) {
      res = 0;
    } else {
      if (s > maxFactorial) {
        let mult = sinPi(0.5 * sc) * 2 * zetaImpl(s, sc);
        res = logGamma(s);
        res -= s * log2Pi;
        res = Math.exp(res);
        res *= mult;
      } else {
        res = sinPi(0.5 * sc) * 2 * Math.pow(2 * Math.PI, -s) * gamma(s) * zetaImpl(s, sc);
      }
    }
  } else {
    res = zetaImpPrec(s, sc);
  }
  return res;
}

export function zeta(s: number): number {
  return zetaImpl(s, 1 - s);
}
