const execa = require("execa");
const fs = require("fs-extra");
const vite = require("vite");
const { createClientBuildConfig, getPath } = require("./utils");

fs.ensureDir(getPath("out"));

const watch = async () => {
  const memoConfig = createClientBuildConfig("memo",{});
  vite.build(memoConfig);
  const hostWatcher = execa("npm", ["run", "watch:host"]);
  hostWatcher.stdout.pipe(process.stdout);
};

watch();
