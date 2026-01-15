import type { ReleaseType } from "@std/semver";
import { increaseVersion } from "../version.ts";

increaseVersion(Deno.args[0] as ReleaseType);
