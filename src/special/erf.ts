import { frexp, ldexp, poly } from "../internal/utils";

function polish(z: number, res: number): number {
  let fx = frexp(z);
  let hi = Math.floor(ldexp(fx[0], 26));
  hi = ldexp(hi, fx[1] - 26);
  let lo = z - hi;
  let sq = z * z;
  let esq = hi * hi - sq + 2 * hi * lo + lo * lo;
  res *= (Math.exp(-sq) * Math.exp(-esq)) / z;
  return res;
}

function erfImpl(z: number, inv: boolean): number {
  if (z < 0) {
    if (!inv) {
      return -erfImpl(-z, inv);
    }
    else if (z < -0.5) {
      return 2 - erfImpl(-z, inv);
    } else {
      return 1 + erfImpl(-z, false);
    }
  }

  let res: number;

  if (z < 0.5) {
    if (z < 1e-10) {
      if (z == 0) {
        res = 0;
      } else {
        const c = 0.003379167095512573896158903121545171688;
        res = z * 1.125 + z * c;
      }
    } else {
      const Y: number = 1.044948577880859375;
      const P: readonly number[] = [
        0.0834305892146531832907, -0.338165134459360935041, -0.0509990735146777432841, -0.00772758345802133288487,
        -0.000322780120964605683831,
      ];
      const Q: readonly number[] = [
        1.0, 0.455004033050794024546, 0.0875222600142252549554, 0.00858571925074406212772, 0.000370900071787748000569,
      ];
      const zz = z * z;
      res = z * (Y + poly(P, zz) / poly(Q, zz));
    }
  } else if (inv ? z < 28 : z < 5.93) {
    inv = !inv;
    if (z < 1.5) {
      const Y: number = 0.405935764312744140625;
      const P: readonly number[] = [
        -0.098090592216281240205, 0.178114665841120341155, 0.191003695796775433986, 0.0888900368967884466578,
        0.0195049001251218801359, 0.00180424538297014223957,
      ];
      const Q: readonly number[] = [
        1.0, 1.84759070983002217845, 1.42628004845511324508, 0.578052804889902404909, 0.12385097467900864233,
        0.0113385233577001411017, 0.337511472483094676155e-5,
      ];
      res = Y + poly(P, z - 0.5) / poly(Q, z - 0.5);
      res *= Math.exp(-z * z) / z;
    } else if (z < 2.5) {
      const Y: number = 0.50672817230224609375;
      const P: readonly number[] = [
        -0.0243500476207698441272, 0.0386540375035707201728, 0.04394818964209516296, 0.0175679436311802092299,
        0.00323962406290842133584, 0.000235839115596880717416,
      ];
      const Q: readonly number[] = [
        1.0, 1.53991494948552447182, 0.982403709157920235114, 0.325732924782444448493, 0.0563921837420478160373,
        0.00410369723978904575884,
      ];
      res = Y + poly(P, z - 1.5) / poly(Q, z - 1.5);
      res = polish(z, res);
    } else if (z < 4.5) {
      const Y: number = 0.5405750274658203125;
      const P: readonly number[] = [
        0.00295276716530971662634, 0.0137384425896355332126, 0.00840807615555585383007, 0.00212825620914618649141,
        0.000250269961544794627958, 0.113212406648847561139e-4,
      ];
      const Q: readonly number[] = [
        1.0, 1.04217814166938418171, 0.442597659481563127003, 0.0958492726301061423444, 0.0105982906484876531489,
        0.000479411269521714493907,
      ];
      res = Y + poly(P, z - 3.5) / poly(Q, z - 3.5);
      res = polish(z, res);
    } else {
      const Y: number = 0.5579090118408203125;
      const P: readonly number[] = [
        0.00628057170626964891937, 0.0175389834052493308818, -0.212652252872804219852, -0.687717681153649930619,
        -2.5518551727311523996, -3.22729451764143718517, -2.8175401114513378771,
      ];
      const Q: readonly number[] = [
        1.0, 2.79257750980575282228, 11.0567237927800161565, 15.930646027911794143, 22.9367376522880577224, 13.5064170191802889145,
        5.48409182238641741584,
      ];
      res = Y + poly(P, 1 / z) / poly(Q, 1 / z);
      res = polish(z, res);
    }
  } else {
    res = 0;
    inv = !inv;
  }

  if (inv) {
    res = 1 - res;
  }
  return res;
}

export function erf(z: number): number {
  return erfImpl(z, false);
}

export function erfc(z: number): number {
  return erfImpl(z, true);
}
