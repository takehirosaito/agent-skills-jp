#!/usr/bin/env node
// publish 前にリポジトリ root の skills-index.json をパッケージにコピーする。
// npm publish 時に "files" でホワイトリストされた skills-index.json が
// このコピー版になる。
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT_INDEX = path.resolve(__dirname, "..", "..", "..", "skills-index.json");
const DEST = path.resolve(__dirname, "..", "skills-index.json");

if (!fs.existsSync(ROOT_INDEX)) {
  process.stderr.write(
    `ERROR: ${ROOT_INDEX} not found.\n` +
      `Run packages/pipeline/11_publish_index.py first to regenerate it.\n`
  );
  process.exit(1);
}

const stat = fs.statSync(ROOT_INDEX);
fs.copyFileSync(ROOT_INDEX, DEST);
const sizeKb = stat.size / 1024;
process.stdout.write(`copied skills-index.json (${sizeKb.toFixed(0)} KB) → ${DEST}\n`);
