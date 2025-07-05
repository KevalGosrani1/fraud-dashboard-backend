#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const nodeModulesDir = path.resolve(process.cwd(), "node_modules");
const seen = {}; // packageName -> Set of versions

function walkModules(dir) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    if (entry.startsWith(".")) continue; // skip .bin, .cache etc.

    const packagePath = path.join(dir, entry);
    const stat = fs.lstatSync(packagePath);

    if (stat.isSymbolicLink()) continue;

    if (entry.startsWith("@")) {
      // Scoped packages
      walkModules(packagePath);
      continue;
    }

    const pkgJsonPath = path.join(packagePath, "package.json");
    if (fs.existsSync(pkgJsonPath)) {
      try {
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
        const name = pkgJson.name;
        const version = pkgJson.version;

        if (!seen[name]) seen[name] = new Set();
        seen[name].add(version);

        // Recurse into this package's node_modules
        walkModules(path.join(packagePath, "node_modules"));
      } catch (e) {
        console.error(`Error reading ${pkgJsonPath}:`, e);
      }
    }
  }
}

// Start traversal
walkModules(nodeModulesDir);

// Report duplicates
console.log("\nDuplicate dependencies (same package, multiple versions installed):");
let found = false;
for (const [pkg, versions] of Object.entries(seen)) {
  if (versions.size > 1) {
    found = true;
    console.log(`- ${pkg}: ${Array.from(versions).join(", ")}`);
  }
}
if (!found) {
  console.log("None 🎉 All dependencies are deduplicated.");
}
