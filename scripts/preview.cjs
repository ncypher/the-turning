const fs = require("node:fs"),
  path = require("node:path"),
  http = require("node:http");
const root = path.resolve(__dirname, "..");
const modules = [
  "engine.js",
  "story_arcs.js",
  "premise.js",
  "continuity.js",
  "scene.js",
  "detail.js",
  "tuning.js",
  "polish.js",
  "motion_fix.js",
  "refuge_visual.js",
  "art.js",
  "controls.js",
];
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
function render() {
  const imports = {
    imports: {
      three:
        "data:text/javascript;base64," +
        Buffer.from(read("vendor/three.module.js")).toString("base64"),
      "three/addons/controls/OrbitControls.js":
        "data:text/javascript;base64," +
        Buffer.from(read("vendor/OrbitControls.js")).toString("base64"),
    },
  };
  return read("world.html")
    .replace("__STYLE__", () => read("style.css"))
    .replace("__IMPORTS__", () => JSON.stringify(imports))
    .replace("__MODULE__", () => modules.map(read).join("\n"));
}
if (require.main === module) {
  const port = Number(process.env.PORT || 8766);
  http
    .createServer((req, res) => {
      if (req.url === "/favicon.ico") {
        res.writeHead(204);
        res.end();
        return;
      }
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end(render());
    })
    .listen(port, "127.0.0.1", () =>
      console.log(`The Turning: http://127.0.0.1:${port}`),
    );
}
module.exports = render;
