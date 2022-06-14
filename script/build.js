const path = require("path");
const execa = require("execa");

const { getArgv, targets: AllPackages } = require("./utils");

// 本地调试时候的输出文件夹，默认packages/*/dist
let LOCAL_DIR = "";
// 编译types
let buildTypes = true;
// watch rollup
let rollupWatch = false;

async function run() {
  const argv = getArgv();
  const paramTarget = argv._;
  LOCAL_DIR = argv.local;
  buildTypes = argv.types !== "false";
  rollupWatch = argv.watch === "true";

  // 如果没有指定target，全量打包
  if (paramTarget.length === 0) {
    build(AllPackages);
  } else {
    build(paramTarget);
  }
}

function build(targets) {
  parallelBuild(targets, rollupBuild);
}

function parallelBuild(targets, iteratorFn) {
  const ret = [];
  for (const item of targets) {
    const p = Promise.resolve().then(() => iteratorFn(item));
    ret.push(p);
  }
  return Promise.all(ret);
}

async function rollupBuild(target) {
  const pkgDir = path.resolve(__dirname, `../packages/${target}`);
  const pkg = require(`${pkgDir}/package.json`);
  if (pkg.private) {
    return;
  }

  const args = [
    "-c",
    "--environment",
    [`TARGET:${target}`, `TYPES:${buildTypes}`, `LOCALVAR:${LOCAL_DIR}`]
      .filter(Boolean)
      .join(","),
  ];

  rollupWatch && args.push("--watch");

  await execa("rollup", args, {
    stdio: "inherit",
  });
}

run();
