"use strict"
const npmDependenciesDatation = require('./npm-dependencies-datation');
const process = require('process');

const projectDir = process.argv[2];

npmDependenciesDatation.getAll(projectDir)
    .then((deps) => {
        deps.forEach((dep) => {
            let line = dep.package.name + '\t' + dep.package.version;
            if (dep.latestFullfilled) {
                line += '\t' + dep.latestFullfilled.version + '\t' + dep.latestFullfilled.ago;// +'\t'+dep.latestFullfilled.time
            }
            if (dep.latest) {
                line += '\t' + dep.latest.version + '\t' + dep.latest.ago;// +'\t'+dep.latest.time
            }
            if (dep.latestFullfilled && dep.latest) {
                line += '\t' + Math.round(((dep.latest.time.getTime() - dep.latestFullfilled.time.getTime()) / (24 * 3600 * 1000)));
            }

            console.log(line);
        })
    })
    .catch((err) => console.error(err));
