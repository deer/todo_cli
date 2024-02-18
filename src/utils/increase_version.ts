import { ReleaseType } from "../deps.ts";
import { increaseVersion } from "../version.ts";

increaseVersion(Deno.args[0] as ReleaseType);
