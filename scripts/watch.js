const execa = require("execa");
const fs = require("fs-extra");
const vite = require("vite");
const { createClientBuildConfig, getPath } = require("./utils");

fs.ensureDir(getPath("out"));

const watch = async () => {
  const vditorWatcher = vite.build(createClientBuildConfig("vditor",{}));
  const milkdownWatcher = vite.build(createClientBuildConfig("milkdown",{}));

  const hostWatcher = execa("npm", ["run", "watch:host"]);
  hostWatcher.stdout.pipe(process.stdout);

  return { vditorWatcher, milkdownWatcher, hostWatcher };
};

watch();
