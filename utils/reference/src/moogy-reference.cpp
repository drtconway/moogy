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

void main_erf() {
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

void main_frexp() {
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

void main_polygamma() {
  nlohmann::json tests;
  for (int n = 0; n <= 10; ++n) {
      for (Real z10 = -250; z10 <= 150; z10 += 2) {
          Real z = z10/10;
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

void main_zeta() {
  nlohmann::json tests;
  for (Real s = -250; s <= 150; s += 2) {
      if (s/10 == 1) {
          continue;
      }
    nlohmann::json itm;
    Real z = boost::math::zeta(s/10);
    itm["s"] = double(s/10);
    itm["zeta"] = double(z);
    tests.push_back(itm);
  }
  std::cout << tests << std::endl;
}

std::map<std::string, std::function<void()>> dists{
    {"binomial", main_binom},
    {"erf", main_erf},
    {"frexp", main_frexp},
    {"norm", main_norm},
    {"polygamma", main_polygamma },
    {"zeta", main_zeta}
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