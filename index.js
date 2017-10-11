const fs = require('graceful-fs');
const spawn = require('child_process');
const _ = require('lodash');
const semver = require('semver');
const ago = require('s-ago');
const os = require('os');

const CACHE_DIR = os.tmpdir()+'/npm-dependencies-datation-cache';
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR);
}


const PACKAGE_FILES = ['package.json', 'bower.json'];


function getPackageInfo(packageName) {
    const localFile = CACHE_DIR + '/' + packageName + '.info';

    return new Promise((resolve, reject) => {
        if (fs.existsSync(localFile)) {
            resolve(JSON.parse(fs.readFileSync(localFile)));
            return;
        }
        const cmd = 'npm info ' + packageName + ' --json';
        spawn.exec(cmd, (error, stdout) => {
            if (error) {
                console.error('ERROR', packageName);
                resolve(undefined);
                return;
            }
            fs.writeFileSync(localFile, stdout);
            resolve(JSON.parse(stdout));
        })
    })
}

function getVersion(pkg) {
    console.log('checking out', pkg);

    return getPackageInfo(pkg.name)
        .then((res) => {
            if (res === undefined) {
                return {
                    package: pkg
                }
            }

            const okVersion = _.chain(res.time)
                .keys()
                .sortBy()
                .filter((t) => {
                    if (!t.match('^[0-9].*')) {
                        return false;
                    }
                    try {
                        return semver.satisfies(t, pkg.version);
                    } catch (err) {
                        console.error('cannot check semver range with', t);
                        return false;
                    }
                })
                .last()
                .value();

            const dateOkVersion = new Date(res.time[okVersion]);
            const dateLatestVersion = new Date(res.time[_.last(res.versions)]);
            return {
                package: pkg,
                latestFullfilled: {
                    version: okVersion,
                    time: dateOkVersion,
                    ago: ago(dateOkVersion)
                },
                latest: {
                    version: _.last(res.versions),
                    time: dateLatestVersion,
                    ago: ago(dateLatestVersion)
                }
            };
        })

}

function getAllVersions(allpackages) {
    const ret = [];
    return new Promise((resolve)=>{
        function handler(xs) {
            if (xs.length === 0) {
                resolve(ret);
                return;
            }
            const x = xs.shift();
            getVersion(x).then((v) => {
                ret.push(v);
                return handler(xs);
            });

        }
        handler(allpackages);
    })
}


function getAllDependenciesDatation(projectDir){
    const depPackages = [];
    PACKAGE_FILES.forEach(function (packageFile) {
        const packagePath = projectDir + '/' + packageFile;
        if (!fs.existsSync(packagePath)) {
            return;
        }
        const content = fs.readFileSync(packagePath);
        const json = JSON.parse(content);

        const name = json.name;
        const version = json.version;
        const depFields = ['dependencies', 'devDependencies'];
        depFields.forEach(function (field) {
            for (const depName in json[field]) {
                const depVersion = json[field][depName];
                //console.log('(' + name + ':' + version + ')-[dependsOn]->(' + depName + ':' + depVersion + ')');
                depPackages.push({name: depName, version: depVersion});
            }
        })
    });
    return getAllVersions(depPackages)
}

exports.getAll = getAllDependenciesDatation;