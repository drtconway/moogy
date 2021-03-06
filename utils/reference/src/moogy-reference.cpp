#include <boost/math/distributions/beta.hpp>
#include <boost/math/distributions/binomial.hpp>
#include <boost/math/distributions/chi_squared.hpp>
#include <boost/math/distributions/normal.hpp>
#include <boost/math/special_functions/polygamma.hpp>
#include <boost/math/special_functions/zeta.hpp>
#include <boost/multiprecision/cpp_bin_float.hpp>
#include <docopt/docopt.h>
#include <iostream>
#include <map>
#include <nlohmann/json.hpp>
#include <random>

const char usage[] =
    R"(moogy-reference - compute reference data for testing moogy

    Usage:
      moogy-reference [options] <distribution>

    Options:
      -h --help                         Show this screen
)";

using Real = boost::multiprecision::cpp_bin_float_100;

nlohmann::json binom(const uint64_t N, const double p, uint64_t s) {
  using namespace boost::math;
  const double q = 1 - p;
  binomial_distribution<Real> dp(N, p);
  binomial_distribution<Real> dq(N, q);
  nlohmann::json res;
  res["distribution"] = "binomial";
  res["N"] = N;
  res["p"] = p;
  res["q"] = q;
  res["values"] = nlohmann::json::array();

  auto make = [&](uint64_t k) {
    std::cerr << "p = " << p << ", q = " << q << ", N = " << N << ", k = " << k
              << std::endl;
    nlohmann::json itm;
    itm["k"] = k;
    itm["p.pdf"] = double(pdf(dp, k));
    itm["p.pdf.log"] = double(log(pdf(dp, k)));
    itm["p.cdf.lower"] = double(cdf(dp, k));
    itm["p.cdf.lower.log"] = double(log(cdf(dp, k)));
    itm["p.cdf.upper"] = double(cdf(complement(dp, k)));
    itm["p.cdf.upper.log"] = double(log(cdf(complement(dp, k))));
    itm["q.pdf"] = double(pdf(dq, k));
    itm["q.pdf.log"] = double(log(pdf(dq, k)));
    itm["q.cdf.lower"] = double(cdf(dq, k));
    itm["q.cdf.lower.log"] = double(log(cdf(dq, k)));
    itm["q.cdf.upper"] = double(cdf(complement(dq, k)));
    itm["q.cdf.upper.log"] = double(log(cdf(complement(dq, k))));
    res["values"].push_back(itm);
  };

  if (N <= 100) {
    for (uint64_t k = 0; k <= N; ++k) {
      make(k);
    }
  } else {
    const uint64_t mp = N * p;
    const uint64_t mq = N * q;
    std::set<uint64_t> must_have{0, 1, mp, mp + 1, mq, mq + 1, N - 1, N};
    if (mp > 0) {
      must_have.insert(mp - 1);
    }

    if (mq > 0) {
      must_have.insert(mq - 1);
    }

    std::mt19937 rng{uint64_t(s)};
    std::uniform_int_distribution<uint64_t> U(0, N);
    while (must_have.size() < 50) {
      must_have.insert(U(rng));
    }
    for (auto itr = must_have.begin(); itr != must_have.end(); ++itr) {
      make(*itr);
    }
  }
  return res;
}

void main_binom() {
  nlohmann::json tests;
  std::vector<uint64_t> Ns{5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000};
  std::vector<double> ps{0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5};
  uint64_t seed = 19;
  for (auto itr = Ns.begin(); itr != Ns.end(); ++itr) {
    const uint64_t N = *itr;
    for (auto jtr = ps.begin(); jtr != ps.end(); ++jtr, ++seed) {
      const double p = *jtr;
      tests.push_back(binom(N, p, seed));
    }
  }
  std::cout << tests << std::endl;
}

nlohmann::json norm(const double mu, const double sigma, uint64_t s) {
  using namespace boost::math;
  normal_distribution<Real> nd(mu, sigma);
  nlohmann::json res;
  res["distribution"] = "normal";
  res["mu"] = mu;
  res["sigma"] = sigma;
  res["values"] = nlohmann::json::array();

  auto make = [&](double x) {
    nlohmann::json itm;
    itm["z"] = x;
    itm["pdf"] = double(pdf(nd, x));
    itm["pdf.log"] = double(log(pdf(nd, x)));
    itm["cdf.lower"] = double(cdf(nd, x));
    itm["cdf.lower.log"] = double(log(cdf(nd, x)));
    itm["cdf.upper"] = double(cdf(complement(nd, x)));
    itm["cdf.upper.log"] = double(log(cdf(complement(nd, x))));
    res["values"].push_back(itm);
  };

  std::mt19937 rng{uint64_t(s)};
  std::uniform_real_distribution<double> U(-8 * sigma, +8 * sigma);
  std::vector<double> zs;
  for (double z = -2; z <= 2; z += 0.125) {
    zs.push_back(z * sigma + mu);
  }
  for (size_t i = 0; i < 10; ++i) {
    zs.push_back(U(rng) + mu);
  }
  std::sort(zs.begin(), zs.end());
  for (auto itr = zs.begin(); itr != zs.end(); ++itr) {
    make(*itr);
  }

  return res;
}

void main_norm() {
  nlohmann::json tests;
  tests.push_back(norm(0, 1, 23));
  tests.push_back(norm(25, 25, 24));
  tests.push_back(norm(1e-3, 1e-4, 25));
  tests.push_back(norm(1e2, 1e3, 26));
  std::cout << tests << std::endl;
}

void main_special_beta() {
  nlohmann::json tests;
  for (Real a = 1e-5; a < 100; a *= 1.414213562373095145475) {
    for (Real b = 1e-5; b < 100; b *= 1.414213562373095145475) {
      Real v = boost::math::beta(a, b);
      nlohmann::json itm;
      itm["a"] = double(a);
      itm["b"] = double(b);
      itm["beta"] = double(v);
      tests.push_back(itm);
    }
  }
  std::cout << tests << std::endl;
}

void main_special_beta_incomplete() {
  nlohmann::json tests;
  Real w = sqrt(sqrt(2.0));
  Real v = sqrt(3);
  for (Real a = 1e-2; a < 1000; a *= 3) {
    for (Real b = 1e-2; b < 1000; b *= v) {
      for (Real x = 1e-3; x < 1; x *= w) {
        std::cerr << "ibeta(" << a << ", " << b << ", " << x << ")" << std::endl;
        Real lr = boost::math::ibeta(a, b, x);
        Real ur = boost::math::ibetac(a, b, x);
        Real lu = boost::math::beta(a, b, x);
        Real uu = boost::math::betac(a, b, x);
        nlohmann::json itm;
        itm["a"] = double(a);
        itm["b"] = double(b);
        itm["x"] = double(x);
        itm["beta.lower"] = double(lu);
        itm["beta.lower.norm"] = double(lr);
        itm["beta.upper"] = double(uu);
        itm["beta.upper.norm"] = double(ur);
        tests.push_back(itm);
      }
    }
  }
  std::cout << tests << std::endl;
}

void main_special_erf() {
  nlohmann::json tests;
  auto makeItem = [&](double z) {
    double xp = double(erf(Real(z)));
    xp = std::max(xp, -1.0);
    xp = std::min(xp, 1.0);
    double yp = double(erfc(Real(z)));
    yp = std::max(yp, 0.0);
    yp = std::min(yp, 2.0);
    nlohmann::json itm;
    itm["z"] = z;
    itm["erf"] = xp;
    itm["erfc"] = yp;
    tests.push_back(itm);
  };
  for (double lz = -25; lz <= 25; lz += 0.5) {
    double z = std::exp(lz);
    makeItem(z);
    makeItem(-z);
  }
  std::cout << tests << std::endl;
}

void main_special_gamma() {
  nlohmann::json tests;
  for (Real z10 = -50; z10 < 150; z10 += 2) {
    Real z = z10 / 10;
    if (z <= 0 && floor(z) == z) {
      continue;
    }
    nlohmann::json itm;
    Real r = boost::math::tgamma(z);
    Real lr = boost::math::lgamma(z);
    itm["z"] = double(z);
    itm["gamma"] = double(r);
    itm["gamma.log"] = double(lr);
    tests.push_back(itm);
  }
  for (Real z10 = 150; z10 < 250; z10 += 5) {
    Real z = z10 / 10;
    nlohmann::json itm;
    Real lr = boost::math::lgamma(z);
    itm["z"] = double(z);
    itm["gamma.log"] = double(lr);
    tests.push_back(itm);
  }
  for (Real z10 = 250; z10 <= 500; z10 += 12) {
    Real z = z10 / 10;
    nlohmann::json itm;
    Real lr = boost::math::lgamma(z);
    itm["z"] = double(z);
    itm["gamma.log"] = double(lr);
    tests.push_back(itm);
  }
  std::cout << tests << std::endl;
}

void main_special_gamma_derivative() {
  nlohmann::json tests;
  for (Real a = 1e-3; a < 1e3; a *= 2.1) {
    Real lga = boost::math::lgamma(a);
    for (Real x = 1e-10; x < 1.5e3; x *= 2.1) {
      Real d = boost::math::gamma_p_derivative(a, x);
      nlohmann::json itm;
      itm["a"] = double(a);
      itm["x"] = double(x);
      itm["gamma.lower.norm.derivative"] = double(d);
      tests.push_back(itm);
    }
  }
  std::cout << tests << std::endl;
}

void main_special_gamma_incomplete() {
  nlohmann::json tests;
  for (Real a = 1e-3; a < 1e3; a *= 2.1) {
    Real lga = boost::math::lgamma(a);
    for (Real x = 1e-10; x < 1.5e3; x *= 2.1) {
      Real gp = boost::math::gamma_p(a, x);
      Real gq = boost::math::gamma_q(a, x);
      nlohmann::json itm;
      itm["a"] = double(a);
      itm["x"] = double(x);
      if (lga < 700) {
        Real tgp = boost::math::tgamma_lower(a, x);
        Real tgq = boost::math::tgamma(a, x);
        itm["gamma.lower"] = double(tgp);
        itm["gamma.upper"] = double(tgq);
      }
      itm["gamma.lower.norm"] = double(gp);
      itm["gamma.upper.norm"] = double(gq);
      tests.push_back(itm);
    }
  }
  std::cout << tests << std::endl;
}

void main_special_gamma_ratio() {
  nlohmann::json tests;
  // Integer cases
  {
    for (Real a = 2; a <= 20; a += 5) {
      for (Real d = 1; d <= 5; d += 2) {
        Real b = a + d;
        Real r = boost::math::tgamma_ratio(a, b);
        Real rr = boost::math::tgamma_ratio(b, a);
        Real dr = boost::math::tgamma_delta_ratio(a, d);
        Real drr = boost::math::tgamma_delta_ratio(b, -d);
        nlohmann::json itm;
        itm["a"] = double(a);
        itm["b"] = double(b);
        itm["d"] = double(d);
        itm["ratio"] = double(r);
        itm["ratio.reciprocal"] = double(rr);
        itm["delta.ratio"] = double(dr);
        itm["delta.ratio.reciprocal"] = double(drr);
        tests.push_back(itm);
      }
    }
  }
  // Big scale
  {
    std::vector<int> A{55, 100, 200, 500};
    std::vector<int> D{-50, -20, -10, -5, -2, -1, 1, 2, 5, 10, 20, 50};
    for (auto itr = A.begin(); itr != A.end(); ++itr) {
      for (auto jtr = D.begin(); jtr != D.end(); ++jtr) {
        Real a = *itr;
        Real d = *jtr;
        Real b = a + d;
        Real r = boost::math::tgamma_ratio(a, b);
        Real dr = boost::math::tgamma_delta_ratio(a, d);
        nlohmann::json itm;
        itm["a"] = double(a);
        itm["b"] = double(b);
        itm["d"] = double(d);
        itm["ratio"] = double(r);
        itm["delta.ratio"] = double(dr);
        tests.push_back(itm);
      }
    }
  }
  // Big delta
  {
    std::vector<double> A{1.125, 5.125, 10.125, 20.125};
    std::vector<int> D{1, 2, 5, 11, 21, 51};
    for (auto itr = A.begin(); itr != A.end(); ++itr) {
      for (auto jtr = D.begin(); jtr != D.end(); ++jtr) {
        Real a = *itr;
        Real d = *jtr;
        Real b = a + d;
        Real r = boost::math::tgamma_ratio(a, b);
        Real dr = boost::math::tgamma_delta_ratio(a, d);
        nlohmann::json itm;
        itm["a"] = double(a);
        itm["b"] = double(b);
        itm["d"] = double(d);
        itm["ratio"] = double(r);
        itm["delta.ratio"] = double(dr);
        tests.push_back(itm);
      }
    }
  }
  // Small values.
  if (false) {
    std::vector<double> A{1e-3,   2e-3,   5e-3,   1e-2,    2e-2,   5e-2,
                          1e-1,   2e-1,   5e-1,   1.125,   2.125,  5.125,
                          10.125, 20.125, 50.125, 100.125, 200.125};
    std::vector<int> S{-1, 1};
    for (auto itr = A.begin(); itr != A.end(); ++itr) {
      for (auto jtr = A.begin(); jtr != A.end(); ++jtr) {
        Real a = *itr;
        Real d0 = *jtr;
        for (auto ktr = S.begin(); ktr != S.end(); ++ktr) {
          int s = *ktr;
          Real d = s * d0;
          Real b = a + d;
          if (b <= 0 || b > 250) {
            continue;
          }
          std::cerr << "a = " << a << ", b = " << b << ", d = " << d
                    << std::endl;
          Real r = boost::math::tgamma_ratio(a, b);
          Real dr = boost::math::tgamma_delta_ratio(a, d);
          nlohmann::json itm;
          itm["a"] = double(a);
          itm["b"] = double(b);
          itm["d"] = double(d);
          itm["ratio"] = double(r);
          if (double(r) != 0) {
            Real rr = boost::math::tgamma_ratio(b, a);
            itm["ratio.reciprocal"] = double(rr);
          }
          itm["delta.ratio"] = double(dr);
          tests.push_back(itm);
        }
      }
    }
  }
  std::cout << tests << std::endl;
}

void main_special_polygamma() {
  nlohmann::json tests;
  for (int n = 0; n <= 10; ++n) {
    for (Real z10 = -150; z10 <= 250; z10 += 2) {
      Real z = z10 / 10;
      if (z <= 0 && floor(z) == z) {
        continue;
      }
      nlohmann::json itm;
      Real r = boost::math::polygamma(n, z);
      itm["n"] = n;
      itm["z"] = double(z);
      itm["polygamma"] = double(r);
      tests.push_back(itm);
    }
  }
  std::cout << tests << std::endl;
}

void main_special_zeta() {
  nlohmann::json tests;
  for (Real s10 = -250; s10 < 150; s10 += 2) {
    Real s = s10 / 10;
    if (s == 1) {
      continue;
    }
    nlohmann::json itm;
    Real z = boost::math::zeta(s);
    itm["s"] = double(s);
    itm["zeta"] = double(z);
    tests.push_back(itm);
  }
  for (Real s10 = 150; s10 <= 350; s10 += 5) {
    Real s = s10 / 10;
    nlohmann::json itm;
    Real z = boost::math::zeta(s);
    itm["s"] = double(s);
    itm["zeta"] = double(z);
    tests.push_back(itm);
  }
  std::cout << tests << std::endl;
}

void main_utils_frexp() {
  const size_t N = 50;
  std::mt19937 rng{uint64_t(19)};
  std::set<int> wanted{-715, 709};
  {
    std::uniform_int_distribution<int> U(-800, 709);
    while (wanted.size() < N) {
      wanted.insert(U(rng));
    }
  }

  nlohmann::json tests;
  std::uniform_real_distribution<double> U(0, 1);
  for (auto itr = wanted.begin(); itr != wanted.end(); ++itr) {
    double u = *itr;
    double v = std::exp(u);
    if (U(rng) < 0.5) {
      v = -v;
    }
    nlohmann::json itm;
    itm["value"] = v;
    int exponent = 0;
    double mantissa = std::frexp(v, &exponent);
    itm["mantissa"] = mantissa;
    itm["exponent"] = exponent;
    tests.push_back(itm);
  }
  std::cout << tests << std::endl;
}

std::map<std::string, std::function<void()>> dists{
    {"binomial", main_binom},
    {"norm", main_norm},
    {"special_beta", main_special_beta},
    {"special_beta_incomplete", main_special_beta_incomplete},
    {"special_erf", main_special_erf},
    {"special_gamma", main_special_gamma},
    {"special_gamma_derivative", main_special_gamma_derivative},
    {"special_gamma_incomplete", main_special_gamma_incomplete},
    {"special_gamma_ratio", main_special_gamma_ratio},
    {"special_polygamma", main_special_polygamma},
    {"special_zeta", main_special_zeta},
    {"utils_frexp", main_utils_frexp},
};

int main(int argc, const char *argv[]) {
  std::map<std::string, docopt::value> opts = docopt::docopt(
      usage, {argv + 1, argv + argc}, true, "moogy-reference 0.1");
  if (false) {
    for (auto itr = opts.begin(); itr != opts.end(); ++itr) {
      std::cout << itr->first << '\t' << itr->second << std::endl;
    }
  }

  const std::string dist = opts["<distribution>"].asString();
  auto itr = dists.find(dist);
  if (itr != dists.end()) {
    itr->second();
    return 0;
  }

  std::cerr << "unrecognised distribution '" << dist << "'." << std::endl;
  return 0;
}