import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Phase 3 catalogue loading guards", () => {
  const catalogSrc = readFileSync(
    join(process.cwd(), "services/catalog.ts"),
    "utf8",
  );
  const storeSrc = readFileSync(
    join(process.cwd(), "store/marketplaceStore.ts"),
    "utf8",
  );
  const apiSrc = readFileSync(join(process.cwd(), "lib/apiClient.ts"), "utf8");

  it("caps marketplace page fan-out (no 10×100 storms)", () => {
    assert.match(catalogSrc, /MAX_PAGES\s*=\s*3/);
    assert.match(catalogSrc, /MARKETPLACE_PAGE_LIMIT\s*=\s*48/);
    assert.doesNotMatch(catalogSrc, /page <= 10/);
  });

  it("dedupes in-flight catalogue and offer fetches", () => {
    assert.match(catalogSrc, /catalogInflight/);
    assert.match(catalogSrc, /offersInflight/);
  });

  it("skips duplicate store fetches unless forced", () => {
    assert.match(storeSrc, /opts\?\.force/);
    assert.match(storeSrc, /if \(current\.isLoading\) return/);
  });

  it("does not auto-retry HTTP 429 responses", () => {
    assert.match(apiSrc, /status === 429/);
    assert.match(apiSrc, /Never auto-retry 429/);
  });
});
