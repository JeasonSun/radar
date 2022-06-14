import path from "path";
import resolvePlugin from "@rollup/plugin-node-resolve";
import size from "rollup-plugin-sizes";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import cleanup from "rollup-plugin-cleanup";
import typescript from "rollup-plugin-typescript2";

const packagesDir = path.resolve(__dirname, "packages");
const packageDir = path.resolve(packagesDir, process.env.TARGET);
const resolve = (p) => path.resolve(packageDir, p);
const pkg = require(resolve("package.json"));
const packageOptions = pkg.buildOptions || {};
const name = packageOptions.filename || path.basename(packageDir);

const outputConfig = {
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: "cjs",
    exports: "auto",
  },
  global: {
    file: resolve(`dist/${name}.global.js`),
    format: "iife",
  },
  esm: {
    file: resolve(`dist/${name}.esm.js`),
    format: "es",
  },
};

const defaultFormats = ["esm", "cjs", "global"];
const packageFormats = packageOptions.formats || defaultFormats;

const packageConfigs = packageFormats.map((format) =>
  createConfig(format, outputConfig[format])
);

function createConfig(format, output) {
  if (!output) {
    console.log(`invalid format: ${format}`);
    process.exit(1);
  }

  const isGlobalBuild = /global/.test(format);
  if (isGlobalBuild) {
    output.name = packageOptions.name;
  }

  // 可以通过设置output 注入默认的前缀和后缀
  // output: {
  //   banner,
  //   footer,
  //   globals:{}
  // }
  output.banner = `/**
  * ${pkg.name}
  * ${pkg.version}
  */`;
  
  output.footer = `/**
  * follow me on Github! 
  * Github: mojie
  */`;

  return {
    input: resolve(`src/index.ts`),
    output,
    plugins: [
      resolvePlugin(),
      size(),
      commonjs(),
      json(),
      cleanup({ comments: "none" }),
      typescript({
        tsconfig: path.resolve(__dirname, "tsconfig.json"),
      }),
    ],
  };
}

export default packageConfigs;
