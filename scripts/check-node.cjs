const major = Number.parseInt(process.versions.node.split(".")[0], 10);
const required = 18;

if (Number.isNaN(major) || major < required) {
  console.error("");
  console.error("Node.js version is too old for this frontend.");
  console.error(`Detected: ${process.versions.node}`);
  console.error("Required: >= 18.18.0 (recommended: 20.x)");
  console.error("");
  console.error("Fix:");
  console.error("1) Install/use Node 20 (nvm install 20, nvm use 20)");
  console.error("2) Reinstall dependencies in frontend");
  console.error("3) Run npm run dev or npm run build again");
  process.exit(1);
}
