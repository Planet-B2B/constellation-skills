#!/usr/bin/env node
/**
 * Reports whether a repository pins this skill pack, and whether the pin
 * trails the latest release. Zero dependencies, so a readiness check can run
 * it in any repository.
 *
 *   node check-pin.mjs [--repo <dir>]
 *                      [--source <git url or path> | --latest <semver> | --marketplace <dir>]
 *                      [--installed <plugin dir>] [--json]
 *
 * --source       the publishing repository: the latest release is the highest
 *                `constellation@<semver>` tag it carries, the pinned version
 *                must be one of its tags, and a pinned commit must be that
 *                tag's commit;
 * --latest       the latest released version, as the caller knows it;
 * --marketplace  a checkout of the publishing marketplace at its newest
 *                release, whose plugin.json gives the latest version;
 * --installed    an installed copy of the plugin, whose tree digest is compared
 *                with the pin's treeDigest.
 *
 * Each check prints `pass`, `fail` or `unknown` with its evidence. Without a
 * latest version the currency check is `unknown`, never `pass`. Exit code: 0
 * when every check passes, 1 when any fails, 2 when none fails but one is
 * unknown.
 *
 * Before 0.3.0 the pack was named `working-with-constellation`. A pin that
 * still names it is valid and is verified against that name's tags, but it is
 * always reported stale (`pin-current` fails), with the step to move to the
 * latest `constellation@<semver>` release. Any other pack name is refused.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { DIGEST_RE, treeDigest } from './tree-digest.mjs';

export const PACK_NAME = 'constellation';
/**
 * The pack's earlier names. A pin naming one is read and verified against that
 * name's release tags, and is always stale.
 */
export const LEGACY_PACK_NAMES = Object.freeze(['working-with-constellation']);
export const PIN_PATH = '.constellation/skill-pack.json';

// SemVer 2.0.0 without build metadata. A numeric identifier, prerelease ones
// included, has no leading zero.
const NUMERIC_ID = String.raw`(?:0|[1-9]\d*)`;
const PRERELEASE_ID = String.raw`(?:${NUMERIC_ID}|\d*[A-Za-z-][0-9A-Za-z-]*)`;
export const SEMVER_RE = new RegExp(
  String.raw`^(${NUMERIC_ID})\.(${NUMERIC_ID})\.(${NUMERIC_ID})(?:-(${PRERELEASE_ID}(?:\.${PRERELEASE_ID})*))?$`,
);
const COMMIT_RE = /^[0-9a-f]{40}$/;
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

/** @typedef {{ major: bigint, minor: bigint, patch: bigint, prerelease: string[] }} Semver */
/** @typedef {{ check: string, status: 'pass' | 'fail' | 'unknown', evidence: string }} CheckResult */
/** @typedef {{ pack: string, version: string, commit?: string, treeDigest?: string, teamDefaults?: { spaceSlug: string, page: string } }} Pin */
/** @typedef {{ repo?: string, source?: string, latest?: string, marketplace?: string, installed?: string }} CheckPinOptions */

/** @param {unknown} error */
function messageOf(error) {
  if (error instanceof Error) return error.message;
  return typeof error === 'string' ? error : 'unknown error';
}

/**
 * Parsed `{ major, minor, patch, prerelease }`, or null when not a semver.
 * @param {unknown} value
 * @returns {Semver | null}
 */
export function parseSemver(value) {
  const match = typeof value === 'string' ? SEMVER_RE.exec(value) : null;
  if (!match) return null;
  return {
    major: BigInt(match[1]),
    minor: BigInt(match[2]),
    patch: BigInt(match[3]),
    prerelease: match[4] ? match[4].split('.') : [],
  };
}

const DIGITS_RE = /^\d+$/;

/**
 * SemVer 2.0.0 § 11.4: numeric identifiers compare numerically (as BigInt, so
 * identifiers past 2^53 never compare equal) and sort before alphanumeric ones,
 * which compare in ASCII order.
 * @param {string} left
 * @param {string} right
 * @returns {number}
 */
function compareIdentifier(left, right) {
  const leftNumeric = DIGITS_RE.test(left);
  const rightNumeric = DIGITS_RE.test(right);
  if (leftNumeric && rightNumeric) {
    const leftValue = BigInt(left);
    const rightValue = BigInt(right);
    if (leftValue === rightValue) return 0;
    return leftValue < rightValue ? -1 : 1;
  }
  if (leftNumeric !== rightNumeric) return leftNumeric ? -1 : 1;
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

/**
 * A release sorts after any prerelease of it; otherwise identifiers compare in
 * turn and a shorter list sorts first.
 * @param {string[]} left
 * @param {string[]} right
 * @returns {number}
 */
function comparePrerelease(left, right) {
  if (left.length === 0 || right.length === 0) return right.length - left.length;
  const shared = Math.min(left.length, right.length);
  for (let index = 0; index < shared; index += 1) {
    const order = compareIdentifier(left[index], right[index]);
    if (order !== 0) return order;
  }
  return Math.sign(left.length - right.length);
}

/**
 * Semver precedence: negative when `left` is older than `right`.
 * @param {string} left
 * @param {string} right
 * @returns {number}
 */
export function compareSemver(left, right) {
  const older = parseSemver(left);
  const newer = parseSemver(right);
  if (!older || !newer) throw new Error(`not a semver: ${older ? right : left}`);
  for (const part of /** @type {const} */ (['major', 'minor', 'patch'])) {
    if (older[part] !== newer[part]) return older[part] < newer[part] ? -1 : 1;
  }
  return comparePrerelease(older.prerelease, newer.prerelease);
}

/**
 * True for this pack's name or one of its earlier names.
 * @param {unknown} name
 * @returns {boolean}
 */
export function isKnownPackName(name) {
  return name === PACK_NAME || (typeof name === 'string' && LEGACY_PACK_NAMES.includes(name));
}

/**
 * True when a pin names one of the pack's earlier names.
 * @param {{ pack: string }} pin
 * @returns {boolean}
 */
export function isLegacyPin(pin) {
  return pin.pack !== PACK_NAME && LEGACY_PACK_NAMES.includes(pin.pack);
}

/**
 * Problems with a parsed pin object; empty when it is well formed.
 * @param {unknown} value
 * @returns {string[]}
 */
export function validatePin(value) {
  /** @type {string[]} */
  const problems = [];
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return ['the pin is not a JSON object'];
  }
  const pin = /** @type {Record<string, unknown>} */ (value);
  if (!isKnownPackName(pin.pack)) {
    problems.push(`"pack" must be "${PACK_NAME}" (or its earlier name "${LEGACY_PACK_NAMES[0]}")`);
  }
  if (!parseSemver(pin.version)) problems.push('"version" must be a semver such as 1.2.0');
  if (pin.commit !== undefined && !(typeof pin.commit === 'string' && COMMIT_RE.test(pin.commit))) {
    problems.push('"commit" must be a 40-character lowercase hex commit');
  }
  if (
    pin.treeDigest !== undefined &&
    !(typeof pin.treeDigest === 'string' && DIGEST_RE.test(pin.treeDigest))
  ) {
    problems.push('"treeDigest" must be sha256: followed by 64 lowercase hex characters');
  }
  // SPEC-plt-1903 § D7: a consumer pins content, not only a tag that can move.
  if (pin.commit === undefined && pin.treeDigest === undefined) {
    problems.push('the pin must carry "commit" or "treeDigest", not only a version');
  }
  if (pin.teamDefaults !== undefined) {
    const ref = /** @type {Record<string, unknown> | null} */ (pin.teamDefaults);
    const isSlug = (/** @type {unknown} */ slug) => typeof slug === 'string' && SLUG_RE.test(slug);
    if (
      ref === null ||
      typeof ref !== 'object' ||
      Array.isArray(ref) ||
      !isSlug(ref.spaceSlug) ||
      !isSlug(ref.page)
    ) {
      problems.push('"teamDefaults" must be { "spaceSlug": "<slug>", "page": "<slug>" }');
    }
  }
  return problems;
}

/**
 * @param {string} path
 * @returns {unknown}
 */
function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/**
 * `pin-present` and `pin-valid`, and the pin when both pass.
 * @param {string} repo
 * @returns {{ results: CheckResult[], pin: Pin | null }}
 */
function readPin(repo) {
  const pinFile = join(resolve(repo), PIN_PATH);
  if (!existsSync(pinFile)) {
    return {
      results: [{ check: 'pin-present', status: 'fail', evidence: `${PIN_PATH} not found` }],
      pin: null,
    };
  }
  /** @type {CheckResult[]} */
  const results = [{ check: 'pin-present', status: 'pass', evidence: PIN_PATH }];
  let pin;
  try {
    pin = readJson(pinFile);
  } catch (error) {
    results.push({
      check: 'pin-valid',
      status: 'fail',
      evidence: `not valid JSON: ${messageOf(error)}`,
    });
    return { results, pin: null };
  }
  const problems = validatePin(pin);
  if (problems.length > 0) {
    results.push({ check: 'pin-valid', status: 'fail', evidence: problems.join('; ') });
    return { results, pin: null };
  }
  const valid = /** @type {Pin} */ (pin);
  results.push({ check: 'pin-valid', status: 'pass', evidence: `${valid.pack}@${valid.version}` });
  return { results, pin: valid };
}

/**
 * The release tags of `pack` in `git ls-remote --tags` output, as version →
 * commit: `refs/tags/<pack>@<semver>`, `constellation` by default. A peeled
 * `^{}` line (an annotated tag's commit) wins over the tag object. Prerelease
 * versions are left out: they are not releases.
 * @param {string} lsRemote
 * @param {string} [pack]
 * @returns {Map<string, string>}
 */
export function releaseTagsFrom(lsRemote, pack = PACK_NAME) {
  const prefix = `refs/tags/${pack}@`;
  /** @type {Map<string, string>} */
  const tags = new Map();
  for (const line of lsRemote.split('\n')) {
    const [sha, ref] = line.trim().split('\t');
    if (!sha || !ref?.startsWith(prefix)) continue;
    const peeled = ref.endsWith('^{}');
    const version = ref.slice(prefix.length, peeled ? ref.length - 3 : ref.length);
    const parsed = parseSemver(version);
    if (!parsed || parsed.prerelease.length > 0) continue;
    if (peeled || !tags.has(version)) tags.set(version, sha);
  }
  return tags;
}

/**
 * The highest version among `tags`, or null when there is none.
 * @param {Map<string, string>} tags
 * @returns {string | null}
 */
export function latestOf(tags) {
  let latest = null;
  for (const version of tags.keys()) {
    if (latest === null || compareSemver(latest, version) < 0) latest = version;
  }
  return latest;
}

// git from a fixed system location rather than a PATH lookup.
const GIT_CANDIDATES = ['/usr/bin/git', '/opt/homebrew/bin/git', '/usr/local/bin/git'];

/**
 * The `git ls-remote --tags` output of the publishing repository at `source`.
 * @param {string} source
 * @returns {string}
 */
function listTags(source) {
  const git = GIT_CANDIDATES.find((candidate) => existsSync(candidate));
  if (git === undefined) throw new Error(`git not found at ${GIT_CANDIDATES.join(', ')}`);
  return execFileSync(git, ['ls-remote', '--tags', source], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 30_000,
  });
}

/**
 * The latest `constellation@<semver>` release from the publishing repository,
 * and the release tags of the pin's own pack name, which differ for a pin that
 * names an earlier name.
 * @param {string} source
 * @param {string} pinnedPack
 * @returns {{ latest: { version: string, source: string } | CheckResult, pinnedTags: Map<string, string> } | CheckResult}
 */
function resolveFromSource(source, pinnedPack) {
  let output;
  try {
    output = listTags(source);
  } catch (error) {
    return {
      check: 'pin-current',
      status: 'unknown',
      evidence: `cannot list tags of ${source}: ${messageOf(error)}`,
    };
  }
  const version = latestOf(releaseTagsFrom(output, PACK_NAME));
  /** @type {{ version: string, source: string } | CheckResult} */
  const latest =
    version === null
      ? {
          check: 'pin-current',
          status: 'unknown',
          evidence: `${source} carries no ${PACK_NAME}@<semver> release tag`,
        }
      : { version, source };
  return { latest, pinnedTags: releaseTagsFrom(output, pinnedPack) };
}

/**
 * The latest released version and where it came from, or an `unknown` result.
 * @param {string | undefined} latest
 * @param {string | undefined} marketplace
 * @returns {{ version: string, source: string } | CheckResult}
 */
function resolveLatest(latest, marketplace) {
  if (latest) return { version: latest, source: '--latest' };
  if (!marketplace) {
    return {
      check: 'pin-current',
      status: 'unknown',
      evidence: 'no latest release given: pass --source, --latest or --marketplace',
    };
  }
  const pluginJson = join(
    resolve(marketplace),
    'plugins',
    PACK_NAME,
    '.claude-plugin',
    'plugin.json',
  );
  try {
    const manifest = /** @type {Record<string, unknown> | null} */ (readJson(pluginJson));
    const version = manifest?.version;
    if (typeof version !== 'string') {
      return {
        check: 'pin-current',
        status: 'unknown',
        evidence: `${pluginJson} has no string "version"`,
      };
    }
    return { version, source: pluginJson };
  } catch (error) {
    return {
      check: 'pin-current',
      status: 'unknown',
      evidence: `cannot read ${pluginJson}: ${messageOf(error)}`,
    };
  }
}

/**
 * `pin-current` for a pin that names one of the pack's earlier names: always
 * stale, with the release to move to when it is known.
 * @param {Pin} pin
 * @param {{ version: string, source: string } | CheckResult} resolved
 * @returns {CheckResult}
 */
function legacyCurrencyCheck(pin, resolved) {
  const target =
    'check' in resolved || !parseSemver(resolved.version)
      ? `the latest ${PACK_NAME}@<version> release`
      : `${PACK_NAME}@${resolved.version} (${resolved.source})`;
  return {
    check: 'pin-current',
    status: 'fail',
    evidence:
      `pins ${pin.pack}@${pin.version}, the pack's earlier name: upgrade to ${target} ` +
      `and set "pack" to "${PACK_NAME}" (README § Upgrading from ${pin.pack})`,
  };
}

/**
 * `pin-current`: a pin older than the latest release fails, and so does a pin
 * that names one of the pack's earlier names.
 * @param {Pin} pin
 * @param {{ version: string, source: string } | CheckResult} resolved
 * @returns {CheckResult}
 */
function currencyCheck(pin, resolved) {
  if (isLegacyPin(pin)) return legacyCurrencyCheck(pin, resolved);
  const pinned = pin.version;
  if ('check' in resolved) return resolved;
  const { version, source } = resolved;
  if (!parseSemver(version)) {
    return {
      check: 'pin-current',
      status: 'unknown',
      evidence: `latest version "${version}" from ${source} is not a semver`,
    };
  }
  if (compareSemver(pinned, version) < 0) {
    return {
      check: 'pin-current',
      status: 'fail',
      evidence: `pinned ${pinned} trails the latest release ${version} (${source})`,
    };
  }
  return {
    check: 'pin-current',
    status: 'pass',
    evidence: `pinned ${pinned}, latest ${version} (${source})`,
  };
}

/**
 * `pin-release-tagged`: the pinned version must be a release the source
 * carries under the pin's own pack name, and a pinned commit must be that
 * release's tag.
 * @param {Pin} pin
 * @param {Map<string, string>} tags the release tags of `pin.pack`
 * @param {string} source
 * @returns {CheckResult}
 */
function releaseCheck(pin, tags, source) {
  const check = 'pin-release-tagged';
  const tag = `${pin.pack}@${pin.version}`;
  const tagged = tags.get(pin.version);
  if (tagged === undefined) {
    return { check, status: 'fail', evidence: `${source} has no tag ${tag}` };
  }
  if (pin.commit !== undefined && pin.commit !== tagged) {
    return { check, status: 'fail', evidence: `pinned ${pin.commit}, but ${tag} is ${tagged}` };
  }
  return { check, status: 'pass', evidence: `${tag} is ${tagged}` };
}

/**
 * `install-matches-pin`: the installed copy's tree digest against the pin's.
 * @param {string | undefined} pinnedDigest
 * @param {string} installed
 * @returns {CheckResult}
 */
function installCheck(pinnedDigest, installed) {
  if (!pinnedDigest) {
    return {
      check: 'install-matches-pin',
      status: 'unknown',
      evidence: 'the pin records no treeDigest',
    };
  }
  try {
    const actual = treeDigest(installed, ['manifest.json']);
    return actual === pinnedDigest
      ? { check: 'install-matches-pin', status: 'pass', evidence: actual }
      : {
          check: 'install-matches-pin',
          status: 'fail',
          evidence: `installed ${actual}, pinned ${pinnedDigest}`,
        };
  } catch (error) {
    return { check: 'install-matches-pin', status: 'unknown', evidence: messageOf(error) };
  }
}

/**
 * The checks, as `{ check, status, evidence }`.
 * @param {CheckPinOptions} options
 * @returns {CheckResult[]}
 */
export function checkPin({ repo = '.', source, latest, marketplace, installed }) {
  const { results, pin } = readPin(repo);
  if (pin === null) return results;
  if (source) {
    const remote = resolveFromSource(source, pin.pack);
    if ('check' in remote) {
      results.push(currencyCheck(pin, remote));
    } else {
      results.push(currencyCheck(pin, remote.latest), releaseCheck(pin, remote.pinnedTags, source));
    }
  } else {
    results.push(currencyCheck(pin, resolveLatest(latest, marketplace)));
  }
  if (installed) results.push(installCheck(pin.treeDigest, installed));
  return results;
}

/**
 * 0 all pass, 1 any fail, 2 otherwise.
 * @param {readonly CheckResult[]} results
 * @returns {number}
 */
export function exitCodeFor(results) {
  if (results.some((result) => result.status === 'fail')) return 1;
  if (results.some((result) => result.status === 'unknown')) return 2;
  return 0;
}

const VALUE_FLAGS = /** @type {const} */ (['repo', 'source', 'latest', 'marketplace', 'installed']);

/**
 * @param {readonly string[]} argv
 * @returns {CheckPinOptions & { json: boolean }}
 */
export function parseArgs(argv) {
  /** @type {CheckPinOptions & { json: boolean }} */
  const options = { repo: '.', json: false };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    const key = VALUE_FLAGS.find((name) => flag === `--${name}`);
    if (flag === '--json') options.json = true;
    else if (key) {
      // A missing, empty or flag-shaped value is refused: dropping it would
      // silently skip the check the caller asked for.
      const value = argv[index + 1];
      if (value === undefined || value === '' || value.startsWith('--')) {
        throw new Error(`${flag} needs a value`);
      }
      options[key] = value;
      index += 1;
    } else {
      throw new Error(`unknown argument ${flag}`);
    }
  }
  return options;
}

function isMain() {
  return (
    process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  );
}

if (isMain()) {
  /** @type {CheckPinOptions & { json: boolean }} */
  let options = { json: false };
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(messageOf(error));
    process.exit(2);
  }
  const results = checkPin(options);
  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    for (const { check, status, evidence } of results)
      console.log(`${status.padEnd(7)} ${check} — ${evidence}`);
  }
  process.exit(exitCodeFor(results));
}
