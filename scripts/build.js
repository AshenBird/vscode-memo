const execa = require("execa");
const fs = require("fs-extra");
const vite = require("vite");
const { createClientBuildConfig, getPath } = require("./utils");

fs.ensureDir(getPath("out"));
const build = async () => {

  const vditorWatcher = vite.build(createClientBuildConfig("vditor"));
  const milkdownWatcher = vite.build(createClientBuildConfig("milkdown"));

  const hostBuilder = execa("npm", ["run", "build:host"]);
  hostBuilder.stdout.pipe(process.stdout);

  return { vditorBuilder, milkdownBuilder, hostBuilder };
};

build();
