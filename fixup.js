/* eslint-env node */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs");

fs.mkdirSync("dist/cjs", { recursive: true });
fs.mkdirSync("dist/mjs", { recursive: true });
fs.writeFileSync(
	"dist/cjs/package.json",
	JSON.stringify({
		type: "common",
	})
);

fs.writeFileSync(
	"dist/mjs/package.json",
	JSON.stringify({
		type: "module",
	})
);
