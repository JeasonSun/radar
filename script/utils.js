const path = require("path");
const fs = require("fs");

exports.getArgv = () => {
  var argv = require("minimist")(process.argv.slice(2));
  return argv;
};

const packageRoot = path.resolve(__dirname, "../packages");

const targets = (exports.targets = fs.readdirSync(packageRoot).filter((f) => {
  if (!fs.statSync(`${packageRoot}/${f}`).isDirectory) {
    return false;
  }
  try {
    const pkg = require(`${packageRoot}/${f}/package.json`);
    if (pkg.private && !pkg.buildOptions) {
      return false;
    }
  } catch (error) {
    return false;
  }

  return true;
}));
