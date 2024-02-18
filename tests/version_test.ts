import {
  decreaseVersion,
  getLatestVersionLocal,
  increaseVersion,
} from "../src/version.ts";
import { $, assertEquals, increment, parse } from "./test_deps.ts";

Deno.test("increase version task test", async () => {
  const latestVersion = await $`deno task version:latest`.text();
  const expected = increment(parse(latestVersion), "patch");
  await $`deno task version:increase patch`;
  const newLatestVersion = await $`deno task version:latest`.text();
  assertEquals(parse(newLatestVersion), expected);
  decreaseVersion();
});

Deno.test("increase version unit test", () => {
  const expected = increment(parse(getLatestVersionLocal()), "patch");
  increaseVersion("patch");
  assertEquals(parse(getLatestVersionLocal()), expected);
  decreaseVersion();
});
