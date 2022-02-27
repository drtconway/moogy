"Usage: eval-cases.R [options] <distribution> <input> <output>

Options:
    -d DIR              set the working directory
" -> doc
library(data.table)
library(docopt)
library(jsonlite)

opts <- docopt(doc)
print(opts)

if (!is.null(opts$d)) {
    setwd(opts$d);
}

x <- as.data.table(fromJSON(opts$input))

if (opts$distribution == "beta") {
    # Urk! R doesn't allow for lower.tail to be a vector
    # so, we have to use mapply:
    f <- function(a, b, x, inv) pbeta(x, a, b, lower.tail=!inv);
    x[, p := mapply(f, a, b, x, inv)];
    x[norm==FALSE, p := p * beta(a, b)];
    x[, q := dbeta(x, a, b)];
} else {
    stop("unknwon distribution")
}

cat(toJSON(x, digits=22), file=opts$output);