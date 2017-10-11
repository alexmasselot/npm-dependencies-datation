#index.js

A npm package I have downloaded (or working on) has dependencies. Cool, but how old are they?

This package offer the possibility to pull out package.json & bower.jsn from a directory and return the date of the dependencies (the latest one fulfilling the semver tag), as well as the most recent package dates and version.

##how does it work?

It scans `package.json` and `bower.json` from a given directory and extracts the `dependencies` and `devDependencies` map.

Then, for each package, makes a call to `npm info` to get the list of available versions and the commit dates.

Those dates are compared with the stated dependency semver, and the most recent one is store.

Finally, a promise returns a lit of all packages, there dependencies, the latest one fulfilling the semver and the ltest one available on npmjs.org.


## How to use it?

An example with a tabular output is available as example.js. But here is the idea:

    const npmDependenciesDatation = require('npm-dependencies-datation');
    
    npmDependenciesDatation.getAll(projectDir)
        .then((deps) => {
            deps.forEach((dep) => {
                console.log(deps);
            })
        })
        .catch((err)=>console.error(err))