"use strict";

const fs = require("fs");
const path = require("path");

const moduleRoot = process.env.CODEX_BUNDLED_NODE_MODULES;
if (!moduleRoot) throw new Error("CODEX_BUNDLED_NODE_MODULES is required");
const sharp = require(path.join(moduleRoot, "sharp"));

const input = process.argv[2];
const outputDir = process.argv[3];
if (!input || !outputDir) {
  throw new Error("Usage: node build_qwen_material_derivatives.cjs <source.png> <output-dir>");
}

const sourcePath = path.resolve(input);
const destination = path.resolve(outputDir);
fs.mkdirSync(destination, { recursive: true });

const jobs = [
  {
    name: "qwen-tension-material-desktop.webp",
    width: 720,
    height: 900,
    quality: 76,
  },
  {
    name: "qwen-tension-material-mobile.webp",
    width: 360,
    height: 600,
    quality: 70,
  },
];

(async () => {
  const metadata = await sharp(sourcePath).metadata();
  if (!metadata.width || !metadata.height) throw new Error("Source dimensions are unavailable");

  const cropLeft = Math.max(0, Math.round(metadata.width * 0.39));
  const cropWidth = metadata.width - cropLeft;
  const crop = { left: cropLeft, top: 0, width: cropWidth, height: metadata.height };
  const outputs = [];

  for (const job of jobs) {
    const outputPath = path.join(destination, job.name);
    await sharp(sourcePath)
      .extract(crop)
      .resize(job.width, job.height, {
        fit: "cover",
        position: sharp.strategy.attention,
        withoutEnlargement: false,
      })
      .webp({ quality: job.quality, effort: 6, smartSubsample: true })
      .toFile(outputPath);
    const stat = fs.statSync(outputPath);
    outputs.push({ file: outputPath, bytes: stat.size, width: job.width, height: job.height });
  }

  process.stdout.write(JSON.stringify({ source: sourcePath, metadata, crop, outputs }, null, 2));
})().catch((error) => {
  process.stderr.write(String(error && error.stack ? error.stack : error));
  process.exitCode = 1;
});
