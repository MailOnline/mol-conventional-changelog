/* eslint-disable global-require */
const path = require('path');
const fs = require('fs');
const glob = require('glob');

const getAllPackages = () => {
  const packagePaths = JSON.parse(fs.readFileSync('package.json')).workspaces;

  const packages = packagePaths.flatMap((packagePath) =>
    glob.sync(packagePath).map((pkgPath) => ({
      location: pkgPath,
      name: JSON.parse(fs.readFileSync(path.join(pkgPath, 'package.json'))).name,
    }))
  );

  return packages;
};

const getChangedPackages = () => {
  const shell = require('shelljs');

  const changedFiles = shell.exec('git diff --cached --name-only', {silent: true})
    .stdout
    .split('\n');

  const packages = getAllPackages();

  return packages
    .filter((pkg) => {
      const packagePrefix = path.relative('.', pkg.location) + path.sep;

      for (const changedFile of changedFiles) {
        if (changedFile.indexOf(packagePrefix) === 0) {
          return true;
        }
      }

      return false;
    })
    .map((pkg) => pkg.name);
};

module.exports = {
  getAllPackages,
  getChangedPackages
};
