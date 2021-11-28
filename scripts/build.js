const execa = require("execa");
const fs = require("fs-extra");
const vite = require("vite");
const { createClientBuildConfig, getPath } = require("./utils");

fs.ensureDir(getPath("out"));
const build = async () => {

  vite.build(createClientBuildConfig("sidebar"));

  const hostBuilder = execa("npm", ["run", "build:host"]);
  hostBuilder.stdout.pipe(process.stdout);

  return { hostBuilder };
};

build();
