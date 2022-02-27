# Generating test data

## Coverage Data

To generate coverage data, uncomment the calls to `codePaths.capture`, and the `const memento = ...` lines. These enable some monitoring of which code paths are in use for which arguments.
Then the following script invocation can be used to sample from the parameter space, and capture arguments to trigger code paths.

```
npx ts-node ./utils/reference/scripts/special.beta.instrumented.ts
```

We can then use an R script compute model answers for the different parameters:

```
docker run -it -v ${PWD}:/source drtomc/essential-r Rscript /source/utils/reference/scripts/eval-cases.R beta -d /source ./utils/reference/data/beta.json ./tests/data/special.beta-coverage.json
```