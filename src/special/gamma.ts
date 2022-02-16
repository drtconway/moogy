import { B2n, contFracA, log1pmx, maxB2n, poly, powm1, sumSeries } from "../internal/utils";
import { DomainCriteria, domain, OverflowError } from "../internal/checks";
import { erfc } from "./erf";
import { polygamma } from "./polygamma";

const eps = 1e-20;
const minRec = 20;

const maxIter = 100;
const euler = 5.77215664901532860606512090082402431e-1;
const piSqr = 9.869604401089358618834490999876151135;
const logPi = Math.log(Math.PI);
const logMax = 709.0;
const logMin = -709.0;
const rootEps = 0.32927225399135962333569506281281311031656150598474e-9;
const rootPi = 1.772453850905516027298167483341145182;
const rootTwoPi = 2.506628274631000502415765284811045253;
const logRootTwoPi = Math.log(rootTwoPi);

export function sinpx(z: number): number {
  let sign = 1;
  if (z < 0) {
    z = -z;
  }
  let fl = Math.floor(z);
  let dist;
  if ((fl & 1) == 1) {
    fl += 1;
    dist = fl - z;
    sign = -sign;
  } else {
    dist = z - fl;
  }
  if (dist > 0.5) {
    dist = 1 - dist;
  }
  return sign * z * Math.sin(dist * Math.PI);
}

function upperIncompleteGammaFract(a1: number, z1: number): () => [number, number] {
  let z: number = z1 - a1 + 1;
  let a: number = a1;
  let k: number = 0;
  return () => {
    k += 1;
    z += 2;
    return [k * (a - k), z];
  };
}

function upperGammaFraction(a: number, z: number): number {
  return 1 / (z - a + 1 + contFracA(upperIncompleteGammaFract(a, z), eps, 40));
}

function lowerIncompleteGammaSeries(a1: number, z1: number): () => number {
  let a = a1;
  let z = z1;
  let res = 1;
  return () => {
    let r = res;
    a += 1;
    res *= z / a;
    return r;
  };
}

function lowerGammaSeries(a: number, z: number, initValue: number = 0): number {
  return sumSeries(lowerIncompleteGammaSeries(a, z), eps, maxIter, initValue);
}

export function scaledGamma(z: number, islog: boolean = false): number {
  let nB2n = maxB2n;

  let ooxptnm1 = 1 / z;
  const oox2 = ooxptnm1 * ooxptnm1;
  let sum = (B2n(1) / 2) * ooxptnm1;
  const target = sum * eps;
  const hl2poz = Math.sqrt((Math.PI * 2) / z);
  let lt = 2 * sum;
  for (let n = 2; ; ++n) {
    if (n == nB2n) {
      throw new Error(`scaledGamma(${z}) failed to converge.`);
    }
    ooxptnm1 *= oox2;
    let n2 = 2 * n;
    let t = (B2n(n) * ooxptnm1) / (n2 * (n2 - 1));
    let ft = Math.abs(t);
    if (n >= 3 && ft < target) {
      break;
    }
    sum += t;

    if (ft > lt) {
      throw new Error(`scaledGamma(${z}) diverges.`);
    }
    lt = ft;
  }
  return islog ? sum + Math.log(hl2poz) : Math.exp(sum) * hl2poz;
}

export const factorials: number[] = [
  1.0, 1.0, 2.0, 6.0, 24.0, 120.0, 720.0, 5040.0, 40320.0, 362880.0, 3628800.0, 39916800.0, 479001600.0, 6227020800.0,
  87178291200.0, 1307674368000.0, 20922789888000.0, 355687428096000.0, 6402373705728000.0, 121645100408832000.0,
  0.243290200817664e19, 0.5109094217170944e20, 0.112400072777760768e22, 0.2585201673888497664e23, 0.62044840173323943936e24,
  0.15511210043330985984e26, 0.403291461126605635584e27, 0.10888869450418352160768e29, 0.304888344611713860501504e30,
  0.8841761993739701954543616e31, 0.26525285981219105863630848e33, 0.822283865417792281772556288e34,
  0.26313083693369353016721801216e36, 0.868331761881188649551819440128e37, 0.29523279903960414084761860964352e39,
  0.103331479663861449296666513375232e41, 0.3719933267899012174679994481508352e42, 0.137637530912263450463159795815809024e44,
  0.5230226174666011117600072241000742912e45, 0.203978820811974433586402817399028973568e47,
  0.815915283247897734345611269596115894272e48, 0.3345252661316380710817006205344075166515e50,
  0.1405006117752879898543142606244511569936e52, 0.6041526306337383563735513206851399750726e53,
  0.265827157478844876804362581101461589032e55, 0.1196222208654801945619631614956577150644e57,
  0.5502622159812088949850305428800254892962e58, 0.2586232415111681806429643551536119799692e60,
  0.1241391559253607267086228904737337503852e62, 0.6082818640342675608722521633212953768876e63,
  0.3041409320171337804361260816606476884438e65, 0.1551118753287382280224243016469303211063e67,
  0.8065817517094387857166063685640376697529e68, 0.427488328406002556429801375338939964969e70,
  0.2308436973392413804720927426830275810833e72, 0.1269640335365827592596510084756651695958e74,
  0.7109985878048634518540456474637249497365e75, 0.4052691950487721675568060190543232213498e77,
  0.2350561331282878571829474910515074683829e79, 0.1386831185456898357379390197203894063459e81,
  0.8320987112741390144276341183223364380754e82, 0.507580213877224798800856812176625227226e84,
  0.3146997326038793752565312235495076408801e86, 0.1982608315404440064116146708361898137545e88,
  0.1268869321858841641034333893351614808029e90, 0.8247650592082470666723170306785496252186e91,
  0.5443449390774430640037292402478427526443e93, 0.3647111091818868528824985909660546442717e95,
  0.2480035542436830599600990418569171581047e97, 0.1711224524281413113724683388812728390923e99,
  0.1197857166996989179607278372168909873646e101, 0.8504785885678623175211676442399260102886e102,
  0.6123445837688608686152407038527467274078e104, 0.4470115461512684340891257138125051110077e106,
  0.3307885441519386412259530282212537821457e108, 0.2480914081139539809194647711659403366093e110,
  0.188549470166605025498793226086114655823e112, 0.1451830920282858696340707840863082849837e114,
  0.1132428117820629783145752115873204622873e116, 0.8946182130782975286851441715398316520698e117,
  0.7156945704626380229481153372318653216558e119, 0.5797126020747367985879734231578109105412e121,
  0.4753643337012841748421382069894049466438e123, 0.3945523969720658651189747118012061057144e125,
  0.3314240134565353266999387579130131288001e127, 0.2817104114380550276949479442260611594801e129,
  0.2422709538367273238176552320344125971528e131, 0.210775729837952771721360051869938959523e133,
  0.1854826422573984391147968456455462843802e135, 0.1650795516090846108121691926245361930984e137,
  0.1485715964481761497309522733620825737886e139, 0.1352001527678402962551665687594951421476e141,
  0.1243841405464130725547532432587355307758e143, 0.1156772507081641574759205162306240436215e145,
  0.1087366156656743080273652852567866010042e147, 0.103299784882390592625997020993947270954e149,
  0.9916779348709496892095714015418938011582e150, 0.9619275968248211985332842594956369871234e152,
  0.942689044888324774562618574305724247381e154, 0.9332621544394415268169923885626670049072e156,
  0.9332621544394415268169923885626670049072e158, 0.9425947759838359420851623124482936749562e160,
  0.9614466715035126609268655586972595484554e162, 0.990290071648618040754671525458177334909e164,
  0.1029901674514562762384858386476504428305e167, 0.1081396758240290900504101305800329649721e169,
  0.1146280563734708354534347384148349428704e171, 0.1226520203196137939351751701038733888713e173,
  0.132464181945182897449989183712183259981e175, 0.1443859583202493582204882102462797533793e177,
  0.1588245541522742940425370312709077287172e179, 0.1762952551090244663872161047107075788761e181,
  0.1974506857221074023536820372759924883413e183, 0.2231192748659813646596607021218715118256e185,
  0.2543559733472187557120132004189335234812e187, 0.2925093693493015690688151804817735520034e189,
  0.339310868445189820119825609358857320324e191, 0.396993716080872089540195962949863064779e193,
  0.4684525849754290656574312362808384164393e195, 0.5574585761207605881323431711741977155627e197,
  0.6689502913449127057588118054090372586753e199, 0.8094298525273443739681622845449350829971e201,
  0.9875044200833601362411579871448208012564e203, 0.1214630436702532967576624324188129585545e206,
  0.1506141741511140879795014161993280686076e208, 0.1882677176888926099743767702491600857595e210,
  0.237217324288004688567714730513941708057e212, 0.3012660018457659544809977077527059692324e214,
  0.3856204823625804217356770659234636406175e216, 0.4974504222477287440390234150412680963966e218,
  0.6466855489220473672507304395536485253155e220, 0.8471580690878820510984568758152795681634e222,
  0.1118248651196004307449963076076169029976e225, 0.1487270706090685728908450891181304809868e227,
  0.1992942746161518876737324194182948445223e229, 0.269047270731805048359538766214698040105e231,
  0.3659042881952548657689727220519893345429e233, 0.5012888748274991661034926292112253883237e235,
  0.6917786472619488492228198283114910358867e237, 0.9615723196941089004197195613529725398826e239,
  0.1346201247571752460587607385894161555836e242, 0.1898143759076170969428526414110767793728e244,
  0.2695364137888162776588507508037290267094e246, 0.3854370717180072770521565736493325081944e248,
  0.5550293832739304789551054660550388118e250, 0.80479260574719919448490292577980627711e252,
  0.1174997204390910823947958271638517164581e255, 0.1727245890454638911203498659308620231933e257,
  0.2556323917872865588581178015776757943262e259, 0.380892263763056972698595524350736933546e261,
  0.571338395644585459047893286526105400319e263, 0.8627209774233240431623188626544191544816e265,
  0.1311335885683452545606724671234717114812e268, 0.2006343905095682394778288746989117185662e270,
  0.308976961384735088795856467036324046592e272, 0.4789142901463393876335775239063022722176e274,
  0.7471062926282894447083809372938315446595e276, 0.1172956879426414428192158071551315525115e279,
  0.1853271869493734796543609753051078529682e281, 0.2946702272495038326504339507351214862195e283,
  0.4714723635992061322406943211761943779512e285, 0.7590705053947218729075178570936729485014e287,
  0.1229694218739449434110178928491750176572e290, 0.2004401576545302577599591653441552787813e292,
  0.3287218585534296227263330311644146572013e294, 0.5423910666131588774984495014212841843822e296,
  0.9003691705778437366474261723593317460744e298, 0.1503616514864999040201201707840084015944e301,
  0.2526075744973198387538018869171341146786e303, 0.4269068009004705274939251888899566538069e305,
  0.7257415615307998967396728211129263114717e307,
];
export const maxFactorial: number = factorials.length;

export function factorial(n: number): number {
  domain(n, { integer: true, greaterThanOrEqual: 0 });

  if (n < maxFactorial) {
    return factorials[n];
  }
  return gamma(n + 1);
}

export function logFactorial(n: number): number {
  domain(n, { integer: true, greaterThanOrEqual: 0 });

  if (n < maxFactorial) {
    return Math.log(factorials[n]);
  }
  return logGamma(n + 1);
}

export function logChoose(n: number, k: number): number {
  domain(n, { integer: true, greaterThanOrEqual: 0 });
  domain(k, { integer: true, greaterThanOrEqual: 0, lessThanOrEqual: n });

  if (k == 0 || k == n) {
    return 0;
  }
  return logFactorial(n) - logFactorial(n - k) - logFactorial(k);
}

export function choose(n: number, k: number): number {
  domain(n, { integer: true, greaterThanOrEqual: 0 });
  domain(k, { integer: true, greaterThanOrEqual: 0, lessThanOrEqual: n });

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

function not_negative_integer_or_zero(z: number): true | string {
  return z > 0 || Math.floor(z) != z || `gamma cannot be evaluated at non-positive integer (${z})`;
}

export function gamma(z: number): number {
  domain(z, { satisfies: not_negative_integer_or_zero });

  const b_neg = z < 0;
  const zint = Math.floor(z) == z;

  if (!b_neg && zint && z <= factorials.length) {
    return factorials[z - 1];
  }

  let zz = Math.abs(z);

  if (zz < 6e-6) {
    const a0 = 1;
    const a1 = euler;
    const se2 = euler * euler * 6;
    const a2 = se2 - piSqr / 12;
    const igs = z * ((a2 * z + a1) * z + a0);
    return 1 / igs;
  }

  let nRec = 0;
  if (zz < minRec) {
    nRec = Math.trunc(minRec - zz) + 1;
    zz += nRec;
  }
  if (nRec == 0) {
    if (zz > logMax || (Math.log(zz) * zz) / 2 > logMax) {
      throw new Error(`gamma overflow (${z})`);
    }
  }

  let gammaVal = scaledGamma(zz);
  let powTerm = Math.pow(zz, zz / 2);
  let expTerm = Math.exp(-zz);
  gammaVal *= powTerm * expTerm;
  if (nRec == 0 && Number.MAX_VALUE / powTerm < gammaVal) {
    throw new Error(`gamma overflow (${z})`);
  }
  gammaVal *= powTerm;
  if (nRec != 0) {
    zz = Math.abs(z) + 1;
    for (let k = 1; k < nRec; ++k) {
      gammaVal /= zz;
      zz += 1;
    }
    gammaVal /= Math.abs(z);
  }

  if (b_neg) {
    gammaVal *= sinpx(z);

    if (Math.abs(gammaVal) < 1 && Number.MAX_VALUE * Math.abs(gammaVal) < Math.PI) {
      throw new OverflowError(`gamma overflow (${z})`);
    }

    gammaVal = -Math.PI / gammaVal;
  }
  return gammaVal;
}

export function logGammaSmall(z: number, zm1: number, zm2: number): number {
  let res = 0;
  if (z < eps) {
    res = -Math.log(z);
  } else if (zm1 == 0 || zm2 == 0) {
    res = 0;
  } else if (z > 2) {
    if (z >= 3) {
      while (true) {
        z -= 1;
        zm2 -= 1;
        res += Math.log(z);
        if (z < 3) {
          break;
        }
      }
      zm2 = z - 2;
    }

    const Y: number = 0.158963680267333984375;
    const P: readonly number[] = [
      -0.180355685678449379109e-1, 0.25126649619989678683e-1, 0.494103151567532234274e-1, 0.172491608709613993966e-1,
      -0.259453563205438108893e-3, -0.541009869215204396339e-3, -0.324588649825948492091e-4,
    ];
    const Q: readonly number[] = [
      0.1e1, 0.196202987197795200688e1, 0.148019669424231326694e1, 0.541391432071720958364, 0.988504251128010129477e-1,
      0.82130967464889339326e-2, 0.224936291922115757597e-3, -0.223352763208617092964e-6,
    ];
    let r = zm2 * (z + 1);
    let R = poly(P, zm2) / poly(Q, zm2);
    res += r * Y + r * R;
  } else {
    if (z < 1) {
      res += -Math.log(z);
      zm2 = zm1;
      zm1 = z;
      z += 1;
    }

    if (z <= 1.5) {
      const Y = 0.52815341949462890625;

      const P: readonly number[] = [
        0.490622454069039543534e-1, -0.969117530159521214579e-1, -0.414983358359495381969, -0.406567124211938417342,
        -0.158413586390692192217, -0.240149820648571559892e-1, -0.100346687696279557415e-2,
      ];
      const Q: readonly number[] = [
        0.1e1, 0.302349829846463038743e1, 0.348739585360723852576e1, 0.191415588274426679201e1, 0.507137738614363510846,
        0.577039722690451849648e-1, 0.195768102601107189171e-2,
      ];

      let r = poly(P, zm1) / poly(Q, zm1);
      let prefix = zm1 * zm2;
      res += prefix * Y + prefix * r;
    } else {
      const Y: number = 0.452017307281494140625;

      const P: readonly number[] = [
        -0.292329721830270012337e-1, 0.144216267757192309184, -0.142440390738631274135, 0.542809694055053558157e-1,
        -0.850535976868336437746e-2, 0.431171342679297331241e-3,
      ];
      const Q: readonly number[] = [
        0.1e1, -0.150169356054485044494e1, 0.846973248876495016101, -0.220095151814995745555, 0.25582797155975869989e-1,
        -0.100666795539143372762e-2, -0.827193521891290553639e-6,
      ];
      let r = zm2 * zm1;
      let R = poly(P, -zm2) / poly(Q, -zm2);

      res += r * Y + r * R;
    }
  }
  return res;
}

export type Sign = { value: number };

export function logGamma(z: number, sign?: Sign): number {
  domain(z, { satisfies: not_negative_integer_or_zero });

  let res = 0;
  let resSign = 1;

  if (z <= -rootEps) {
    let t = sinpx(z);
    z = -z;
    if (t < 0) {
      t = -t;
    } else {
      resSign = -resSign;
    }
    res = logPi - logGamma(z) - Math.log(t);
  } else if (z < rootEps) {
    if (4 * Math.abs(z) < eps) {
      res = -Math.log(Math.abs(z));
    } else {
      res = Math.log(Math.abs(1 / z - euler));
    }
    if (z < 0) {
      resSign = -1;
    }
  } else if (z < 15) {
    res = logGammaSmall(z, z - 1, z - 2);
  } else if (z >= 3 && z < 30) {
    res = Math.log(gamma(z));
  } else {
    let sum = scaledGamma(z, true);
    res = z * (Math.log(z) - 1) + sum;
  }

  if (sign) {
    sign.value = resSign;
  }
  return res;
}

export function finiteGammaQ(a: number, x: number, deriv?: { value: number }): number {
  const e: number = Math.exp(-x);
  let sum: number = e;
  if (sum != 0) {
    let t = sum;
    for (let n = 1; n < a; ++n) {
      t /= n;
      t *= x;
      sum += t;
    }
  }
  if (deriv) {
    deriv.value = (e * Math.pow(x, a)) / factorial(Math.floor(a - 1));
  }
  return sum;
}

function finiteHalfGammaQ(a: number, x: number, deriv?: { value: number }): number {
  let e = erfc(Math.sqrt(x));
  if (e != 0 && a > 1) {
    let t = Math.exp(-x) / Math.sqrt(Math.PI * x);
    t *= x;
    t /= 0.5;
    let sum = t;
    for (let n = 2; n < a; ++n) {
      t /= n - 0.5;
      t *= x;
      sum += t;
    }
    e += sum;
    if (deriv) {
      deriv.value = 0;
    }
  } else if (deriv) {
    deriv.value = (Math.sqrt(x) * Math.exp(-x)) / rootPi;
  }
  return e;
}

function incompleteGammaLargeSeries(a: number, x: number): () => number {
  let ap = a;
  let t = 1;
  let k = 0;
  return () => {
    let res = t;
    k += 1;
    ap -= 1;
    t *= ap / x;
    return res;
  };
}

function incompleteGammaLarge(a: number, x: number): number {
  return sumSeries(incompleteGammaLargeSeries(a, x), 1e-25, 1000);
}

function regularisedGammaPrefix(a: number, z: number): number {
  if (a < 1 && z < 1) {
    return (Math.pow(z, a) * Math.exp(-z)) / gamma(a);
  } else if (a > minRec) {
    let scaled = scaledGamma(a);
    let powTerm = Math.pow(z / a, a / 2);
    let amz = a - z;
    if (powTerm == 0 || Math.abs(amz) > logMax) {
      return Math.exp(a * Math.log(z / a) + amz - Math.log(scaled));
    }
    return powTerm * Math.exp(amz) * (powTerm / scaled);
  } else {
    let shift = 1 + Math.trunc(minRec - a);
    let res = regularisedGammaPrefix(a + shift, z);
    if (res != 0) {
      for (let i = 0; i < shift; ++i) {
        res /= z;
        res *= a + i;
      }
      return res;
    } else {
      let scaled = scaledGamma(a + shift);
      let powTerm1 = Math.pow(z / (a + shift), a);
      let powTerm2 = Math.pow(a + shift, -shift);
      let powTerm3 = Math.exp(a + shift - z);
      if (powTerm1 == 0 || powTerm2 == 0 || powTerm3 == 0 || Math.abs(a + shift - z) > logMax) {
        return Math.exp(a * Math.log(z) - z - gamma(a));
      }
      res = (powTerm1 * powTerm2 * powTerm3) / scaled;
      for (let i = 0; i < shift; ++i) {
        res *= a + i;
      }
      return res;
    }
  }
}

function fullGammaPrefix(a: number, z: number): number {
  let pfx;
  const alz = a * Math.log(z);
  if (z >= 1) {
    if (alz < logMax && -z > logMin) {
      pfx = Math.pow(z, a) * Math.exp(-z);
    } else if (a >= 1) {
      pfx = Math.pow(z / Math.exp(z / a), a);
    } else {
      pfx = Math.exp(alz - z);
    }
  } else {
    if (alz > logMin) {
      pfx = Math.pow(z, a) * Math.exp(-z);
    } else if (z / a < logMax) {
      pfx = Math.pow(z / Math.exp(z / a), a);
    } else {
      pfx = Math.exp(alz - z);
    }
  }
  return pfx;
}

export function gamma1pm1(z: number): number {
  if (z < 0) {
    if (z < -0.5) {
      return gamma(1 + z) - 1;
    } else {
      return Math.expm1(-Math.log1p(z) + logGammaSmall(z + 2, z + 1, z));
    }
  } else {
    if (z < 2) {
      return Math.expm1(logGammaSmall(z + 1, z, z - 1));
    } else {
      return gamma(1 + z) - 1;
    }
  }
}

function smallGammaSeries(a: number, x: number) : () => number {
  let k = 0;
  let part = 1;
  return () => {
    k += 1;
    part *= -x;
    part /= k;
    return part / (a + k);
  }
}

function gammaSmallUpperPart(a: number, x: number, inv: boolean, deriv?: { value: number }): { res: number; gam: number } {
  let res;
  let gam;
  res = gamma1pm1(a);
  gam = (res + 1) / a;
  let p = powm1(x, a);
  res -= p;
  res /= a;
  p += 1;
  if (deriv) {
    deriv.value = p / (gam * Math.exp(x));
  }
  let init = inv ? gam : 0;
  init = (init - res) / p;
  res = -p * sumSeries(smallGammaSeries(a, x), eps, maxIter - 10, init);
  if (inv) {
    res = -res;
  }
  return { res, gam };
}

function incompleteGammaTemmeLarge(a: number, x: number): number {
  let sigma = (x - a) / a;
  let phi = -log1pmx(sigma);
  let y = a * phi;
  let z = Math.sqrt(2 * phi);
  if (x < a) {
    z = -z;
  }

  let W: number[] = [];

  const Cs: readonly number[][] = [
    [
      -0.333333333333333333333, 0.0833333333333333333333, -0.0148148148148148148148, 0.00115740740740740740741,
      0.000352733686067019400353, -0.0001787551440329218107, 0.39192631785224377817e-4, -0.218544851067999216147e-5,
      -0.18540622107151599607e-5, 0.829671134095308600502e-6, -0.176659527368260793044e-6, 0.670785354340149858037e-8,
      0.102618097842403080426e-7, -0.438203601845335318655e-8, 0.914769958223679023418e-9, -0.255141939949462497669e-10,
      -0.583077213255042506746e-10, 0.243619480206674162437e-10, -0.502766928011417558909e-11,
    ],
    [
      -0.00185185185185185185185, -0.00347222222222222222222, 0.00264550264550264550265, -0.000990226337448559670782,
      0.000205761316872427983539, -0.40187757201646090535e-6, -0.18098550334489977837e-4, 0.764916091608111008464e-5,
      -0.161209008945634460038e-5, 0.464712780280743434226e-8, 0.137863344691572095931e-6, -0.575254560351770496402e-7,
      0.119516285997781473243e-7, -0.175432417197476476238e-10, -0.100915437106004126275e-8, 0.416279299184258263623e-9,
      -0.856390702649298063807e-10,
    ],
    [
      0.00413359788359788359788, -0.00268132716049382716049, 0.000771604938271604938272, 0.200938786008230452675e-5,
      -0.000107366532263651605215, 0.529234488291201254164e-4, -0.127606351886187277134e-4, 0.342357873409613807419e-7,
      0.137219573090629332056e-5, -0.629899213838005502291e-6, 0.142806142060642417916e-6, -0.204770984219908660149e-9,
      -0.140925299108675210533e-7, 0.622897408492202203356e-8, -0.136704883966171134993e-8,
    ],
    [
      0.000649434156378600823045, 0.000229472093621399176955, -0.000469189494395255712128, 0.000267720632062838852962,
      -0.756180167188397641073e-4, -0.239650511386729665193e-6, 0.110826541153473023615e-4, -0.56749528269915965675e-5,
      0.142309007324358839146e-5, -0.278610802915281422406e-10, -0.169584040919302772899e-6, 0.809946490538808236335e-7,
      -0.191111684859736540607e-7,
    ],
    [
      -0.000861888290916711698605, 0.000784039221720066627474, -0.000299072480303190179733, -0.146384525788434181781e-5,
      0.664149821546512218666e-4, -0.396836504717943466443e-4, 0.113757269706784190981e-4, 0.250749722623753280165e-9,
      -0.169541495365583060147e-5, 0.890750753220530968883e-6, -0.229293483400080487057e-6,
    ],
    [
      -0.000336798553366358150309, -0.697281375836585777429e-4, 0.000277275324495939207873, -0.000199325705161888477003,
      0.679778047793720783882e-4, 0.141906292064396701483e-6, -0.135940481897686932785e-4, 0.801847025633420153972e-5,
      -0.229148117650809517038e-5,
    ],
    [
      0.000531307936463992223166, -0.000592166437353693882865, 0.000270878209671804482771, 0.790235323266032787212e-6,
      -0.815396936756196875093e-4, 0.561168275310624965004e-4, -0.183291165828433755673e-4, -0.307961345060330478256e-8,
      0.346515536880360908674e-5, -0.20291327396058603727e-5, 0.57887928631490037089e-6,
    ],
    [
      0.000344367606892377671254, 0.517179090826059219337e-4, -0.000334931610811422363117, 0.000281269515476323702274,
      -0.000109765822446847310235, -0.127410090954844853795e-6, 0.277444515115636441571e-4, -0.182634888057113326614e-4,
      0.578769494973505239894e-5,
    ],
    [
      -0.000652623918595309418922, 0.000839498720672087279993, -0.000438297098541721005061, -0.696909145842055197137e-6,
      0.000166448466420675478374, -0.000127835176797692185853, 0.462995326369130429061e-4,
    ],
    [
      -0.000596761290192746250124, -0.720489541602001055909e-4, 0.000678230883766732836162, -0.0006401475260262758451,
      0.000277501076343287044992,
    ],
    [0.00133244544948006563713, -0.0019144384985654775265, 0.00110893691345966373396],
    [
      0.00157972766073083495909, 0.000162516262783915816899, -0.00206334210355432762645, 0.00213896861856890981541,
      -0.00101085593912630031708,
    ],
    [-0.00407251211951401664727, 0.00640336283380806979482, -0.00404101610816766177474],
  ];
  for (let C of Cs) {
    W.push(poly(C, z));
  }

  let res = poly(W, 1 / a);
  res *= Math.exp(-y) / Math.sqrt(2 * Math.PI * a);
  if (x < a) {
    res = -res;
  }
  res += erfc(Math.sqrt(y)) / 2;
  return res;
}

function gammaIncompleteImpl(a: number, x: number, norm: boolean, inv: boolean, deriv?: { value: number }): number {
  domain(a, { greaterThan: 0 });
  domain(x, { greaterThanOrEqual: 0 });

  let res = 0;

  if (a >= maxFactorial && !norm) {
    if (inv && 4 * a < x) {
      res = a * Math.log(x) - x;
      if (deriv) {
        deriv.value = Math.exp(res);
      }
      res += Math.log(upperGammaFraction(a, x));
    } else if (!inv && a > 4 * x) {
      res = a * Math.log(x) - x;
      if (deriv) {
        deriv.value = Math.exp(res);
      }
      let init = 0;
      res + Math.log(lowerGammaSeries(a, x, init) / a);
    } else {
      res = gammaIncompleteImpl(a, x, true, inv, deriv);
      if (res == 0) {
        if (inv) {
          res = 1 + 1 / (12 * a) + 1 / (288 * a * a);
          res = Math.log(res) - a + (a - 0.5) * Math.log(a) + logRootTwoPi;
          if (deriv) {
            deriv.value = Math.exp(a * Math.log(x) - x);
          }
        } else {
          res = a * Math.log(x) - x;
          if (deriv) {
            deriv.value = Math.exp(res);
          }
          let init = 0;
          res += Math.log(lowerGammaSeries(a, x, init) / a);
        }
      } else {
        res = Math.log(res) + logGamma(a);
      }
    }
    if (res > logMax) {
      throw new OverflowError(`gammaIncompleteImpl(${a}, ${x}, ${norm}, ${inv}) overflow`);
    }
    return Math.exp(res);
  }

  let isInt: boolean = false;
  let isHalfInt: boolean = false;
  let isSmallA: boolean = a < 30 && a <= x + 1 && x < logMax;
  if (isSmallA) {
    let fa = Math.floor(a);
    isInt = fa == a;
    isHalfInt = isInt ? false : Math.abs(fa - a) == 0.5;
  }

  let evalMethod: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  if (isInt && x > 0.6) {
    inv = !inv;
    evalMethod = 0;
  } else if (isHalfInt && x > 0.2) {
    inv = !inv;
    evalMethod = 1;
  } else if (x < rootEps && a > 1) {
    evalMethod = 6;
  } else if (x > 1000 && (a < x || Math.abs(a - 50) / x < 1)) {
    inv = !inv;
    evalMethod = 7;
  } else if (x < 0.5) {
    if (-0.4 / Math.log(x) < a) {
      evalMethod = 2;
    } else {
      evalMethod = 3;
    }
  } else if (x < 1.1) {
    if (x * 0.75 < a) {
      evalMethod = 2;
    } else {
      evalMethod = 3;
    }
  } else {
    let useTemme = false;
    if (norm && a > 20) {
      let sigma = Math.abs((x - a) / a);
      if (a > 200) {
        if (20 / a > sigma * sigma) {
          useTemme = true;
        }
      } else {
        if (sigma < 0.4) {
          useTemme = true;
        }
      }
    }
    if (useTemme) {
      evalMethod = 5;
    } else {
      if (x - 1 / (3 * x) < a) {
        evalMethod = 2;
      } else {
        inv = !inv;
        evalMethod = 4;
      }
    }
  }

  console.log(`gammaIncompleteImpl(${a}, ${x}, ${norm}, ${inv}, ${deriv}) using evaluation method ${evalMethod}`);

  switch (evalMethod) {
    case 0: {
      res = finiteGammaQ(a, x, deriv);
      if (!norm) {
        res *= gamma(a);
      }
      break;
    }
    case 1: {
      res = finiteHalfGammaQ(a, x, deriv);
      if (!norm) {
        res *= gamma(a);
      }
      if (deriv && deriv.value == 0) {
        deriv.value = regularisedGammaPrefix(a, x);
      }
      break;
    }
    case 2: {
      res = norm ? regularisedGammaPrefix(a, x) : fullGammaPrefix(a, x);
      if (deriv) {
        deriv.value = res;
      }
      if (res != 0) {
        let init = 0;
        let optInv = false;
        if (inv) {
          init = norm ? 1 : gamma(a);
          if (norm || res >= 1 || Number.MAX_VALUE * res > init) {
            init /= res;
            if (norm || a < 1 || Number.MAX_VALUE / a > init) {
              init *= -a;
              optInv = true;
            } else {
              init = 0;
            }
          }
        }
        res *= lowerGammaSeries(a, x, init) / a;
        if (optInv) {
          inv = false;
          res = -res;
        }
      }
      break;
    }
    case 3: {
      inv = !inv;
      let v = gammaSmallUpperPart(a, x, inv, deriv);
      inv = false;
      res = v.res;
      if (norm) {
        res /= v.gam;
      }
      break;
    }
    case 4: {
      res = norm ? regularisedGammaPrefix(a, x) : fullGammaPrefix(a, x);
      if (deriv) {
        deriv.value = res;
      }
      if (res != 0) {
        res *= upperGammaFraction(a, x);
      }
      break;
    }
    case 5: {
      res = incompleteGammaTemmeLarge(a, x);
      if (x >= a) {
        inv = !inv;
      }
      if (deriv) {
        deriv.value = regularisedGammaPrefix(a, x);
      }
      break;
    }
    case 6: {
      if (!norm) {
        res = Math.pow(x, a) / a;
      } else {
        res = Math.pow(x, a) / gamma(a + 1);
      }
      res *= 1 - (a * x) / (a + 1);
      if (deriv) {
        deriv.value = regularisedGammaPrefix(a, x);
      }
      break;
    }
    case 7: {
      res = norm ? regularisedGammaPrefix(a, x) : fullGammaPrefix(a, x);
      if (deriv) {
        deriv.value = res;
      }
      res /= x;
      if (res != 0) {
        res *= incompleteGammaLarge(a, x);
      }
      break;
    }
  }
  if (norm && res > 1) {
    res = 1;
  }
  if (inv) {
    let gam = norm ? 1 : gamma(a);
    res = gam - res;
  }
  if (deriv) {
    if (x < 1 && Number.MAX_VALUE * x < deriv.value) {
      deriv.value = Number.MAX_VALUE / 2;
    }
    deriv.value /= x;
  }
  return res;
}

export interface IncompleteGammaOptions {
  lower?: boolean;
  normalised?: boolean;
}

export function incompleteGamma(a: number, x: number, options?: IncompleteGammaOptions): number {
  let inv = false;
  if (options && options.lower != undefined) {
    inv = !options.lower;
  }
  let norm = true;
  if (options && options.normalised != undefined) {
    norm = options.normalised;
  }
  return gammaIncompleteImpl(a, x, norm, inv);
}
