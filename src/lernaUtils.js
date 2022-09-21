/* eslint-disable global-require */
const path = require('path');

const getAllPackages = () => {
  const {Project} = require('@lerna/project');

  return new Project().getPackages();
};

const getChangedPackages = async () => {
  const shell = require('shelljs');

  const changedFiles = shell.exec('git diff --cached --name-only', {silent: true})
    .stdout
    .split('\n');

  const packages = await getAllPackages();

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
