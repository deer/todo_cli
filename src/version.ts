import { format, increment, parse, ReleaseType } from "./deps.ts";
import VERSIONS from "./versions.json" with { type: "json" };

type Versions = {
  versions: string[];
};

export function getVersions() {
  const versions = VERSIONS as Versions;
  return versions.versions;
}

// this is safe to run remotely because it relies on imports
export function getLatestVersion() {
  return getVersions()[0];
}

export function increaseVersion(release: ReleaseType) {
  const versions = getVersionsLocal();
  const newVersion = increment(parse(versions[0]), release);
  versions.unshift(format(newVersion));
  writeVersions(versions);
}

export function decreaseVersion() {
  let versions = getVersionsLocal();
  versions = versions.slice(1);
  writeVersions(versions);
}

export function getLatestVersionLocal() {
  return getVersionsLocal()[0];
}

function getVersionsLocal() {
  const content = Deno.readTextFileSync("./src/versions.json");
  const versions = JSON.parse(content) as Versions;
  return versions.versions;
}

function writeVersions(versions: string[]) {
  Deno.writeTextFileSync(
    "./src/versions.json",
    JSON.stringify({ versions }, null, 2) + "\n",
  );
}
