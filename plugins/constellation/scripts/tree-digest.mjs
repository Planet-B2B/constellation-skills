#!/usr/bin/env node
/**
 * Content digests for the skill pack, with no dependencies beyond Node.
 *
 * A file's digest is `sha256:` plus the lowercase hex SHA-256 of its exact
 * bytes. A tree's digest is the SHA-256 of a canonical listing: one line per
 * regular file, ordered by the UTF-8 bytes of its relative path (`/`
 * separators, no leading `./`), each line `<hex>  <path>\n`. Modes, timestamps
 * and empty directories are not part of identity. A symbolic link or any other
 * non-regular entry is refused, never followed, and so is a path that is not
 * valid UTF-8 or holds a control character.
 *
 * Usage: node tree-digest.mjs <directory> [--exclude <relative path>]...
 */

import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DIGEST_RE = /^sha256:[0-9a-f]{64}$/;

// U+0000 to U+001F and U+007F. Built from code points so no control character
// appears literally in this file.
const CONTROL_CHAR_RE = new RegExp(
  `[${String.fromCodePoint(0)}-${String.fromCodePoint(0x1f)}${String.fromCodePoint(0x7f)}]`,
);

const LONE_SURROGATE_RE = /[\uD800-\uDFFF]/u;
// ignoreBOM keeps a leading U+FEFF in a name: stripping it would make
// `\uFEFFmanifest.json` match the `manifest.json` exclusion.
const STRICT_UTF8 = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });

/** @typedef {{ path: string, bytes: Uint8Array }} TreeFile */

/** @param {Uint8Array} bytes */
function hexSha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

/**
 * `sha256:<hex>` of the exact bytes.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function fileDigest(bytes) {
  return `sha256:${hexSha256(bytes)}`;
}

/**
 * Throws unless `path` is a canonical relative path the listing can carry.
 * @param {unknown} path
 * @returns {asserts path is string}
 */
export function assertCanonicalPath(path) {
  if (typeof path !== 'string' || path.length === 0) {
    throw new Error('tree digest: empty path');
  }
  // With the `u` flag a well-formed surrogate pair is one code point, so only a
  // lone surrogate (which has no UTF-8 encoding) matches.
  if (LONE_SURROGATE_RE.test(path)) {
    throw new Error(`tree digest: path is not valid UTF-8: ${JSON.stringify(path)}`);
  }
  if (CONTROL_CHAR_RE.test(path)) {
    throw new Error(`tree digest: path holds a control character: ${JSON.stringify(path)}`);
  }
  if (path.startsWith('/') || path.startsWith('./') || path.includes('\\')) {
    throw new Error(`tree digest: path is not a relative "/"-separated path: ${path}`);
  }
  for (const segment of path.split('/')) {
    if (segment === '' || segment === '.' || segment === '..') {
      throw new Error(`tree digest: path has an empty, "." or ".." segment: ${path}`);
    }
  }
}

/**
 * @param {string} left
 * @param {string} right
 */
function compareUtf8(left, right) {
  return Buffer.compare(Buffer.from(left, 'utf8'), Buffer.from(right, 'utf8'));
}

/**
 * The canonical listing and digest of `files`, an array of `{ path, bytes }`.
 * The order the files are supplied in does not matter; a duplicate path is
 * refused.
 * @param {readonly TreeFile[]} files
 * @returns {{ listing: string, digest: string }}
 */
export function treeDigestOf(files) {
  const entries = files.map(({ path, bytes }) => {
    assertCanonicalPath(path);
    return { path, hex: hexSha256(bytes) };
  });
  entries.sort((left, right) => compareUtf8(left.path, right.path));
  for (let index = 1; index < entries.length; index += 1) {
    if (entries[index - 1].path === entries[index].path) {
      throw new Error(`tree digest: duplicate path ${entries[index].path}`);
    }
  }
  const listing = entries.map(({ path, hex }) => `${hex}  ${path}\n`).join('');
  return { listing, digest: fileDigest(Buffer.from(listing, 'utf8')) };
}

/**
 * Every regular file under `root` as `{ path, bytes }`, refusing symbolic links
 * and any other non-regular entry. `exclude` lists relative paths left out.
 * @param {string} root
 * @param {readonly string[]} [exclude]
 * @returns {Array<{ path: string, bytes: Buffer }>}
 */
export function readTree(root, exclude = []) {
  const excluded = new Set(exclude);
  /** @type {Array<{ path: string, bytes: Buffer }>} */
  const files = [];
  /**
   * @param {string} absolute
   * @param {string} relative
   */
  const walk = (absolute, relative) => {
    // Names are read as bytes: a string read would replace invalid UTF-8
    // silently, and two different trees could then share one listing.
    for (const rawName of readdirSync(absolute, { encoding: 'buffer' })) {
      let name;
      try {
        name = STRICT_UTF8.decode(rawName);
      } catch {
        throw new Error(`tree digest: a name under ${relative || '.'} is not valid UTF-8`);
      }
      const childAbsolute = join(absolute, name);
      const childRelative = relative === '' ? name : `${relative}/${name}`;
      const stat = lstatSync(childAbsolute);
      if (stat.isSymbolicLink()) {
        throw new Error(`tree digest: refusing symbolic link ${childRelative}`);
      }
      if (stat.isDirectory()) {
        walk(childAbsolute, childRelative);
      } else if (stat.isFile()) {
        if (!excluded.has(childRelative)) {
          files.push({ path: childRelative, bytes: readFileSync(childAbsolute) });
        }
      } else {
        throw new Error(`tree digest: refusing non-regular entry ${childRelative}`);
      }
    }
  };
  walk(resolve(root), '');
  return files;
}

/**
 * The tree digest of the directory `root`.
 * @param {string} root
 * @param {readonly string[]} [exclude]
 * @returns {string}
 */
export function treeDigest(root, exclude = []) {
  return treeDigestOf(readTree(root, exclude)).digest;
}

function isMain() {
  return (
    process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  );
}

if (isMain()) {
  const args = process.argv.slice(2);
  /** @type {string[]} */
  const exclude = [];
  /** @type {string | undefined} */
  let root;
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--exclude') {
      exclude.push(args[index + 1]);
      index += 1;
    } else {
      root = args[index];
    }
  }
  if (!root) {
    console.error('usage: node tree-digest.mjs <directory> [--exclude <relative path>]...');
    process.exit(2);
  }
  try {
    console.log(treeDigest(root, exclude));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
