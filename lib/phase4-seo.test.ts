import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PRODUCTION_APP_URL,
  absoluteUrl,
  publicSiteHost,
  publicSiteOrigin,
  robotsDisallowPaths,
} from "./seo";

describe("Phase 4 SEO helpers", () => {
  it("uses customer.polystorex.com as production canonical origin", () => {
    assert.equal(PRODUCTION_APP_URL, "https://customer.polystorex.com");
    assert.equal(publicSiteOrigin(), "https://customer.polystorex.com");
    assert.equal(publicSiteHost(), "customer.polystorex.com");
    assert.doesNotMatch(publicSiteHost(), /^https?:/);
  });

  it("builds HTTPS absolute URLs without localhost", () => {
    const url = absoluteUrl("/marketplace/grades");
    assert.match(
      url,
      /^https:\/\/customer\.polystorex\.com\/marketplace\/grades$/,
    );
    assert.doesNotMatch(url, /localhost|127\.0\.0\.1|vercel\.app/);
  });

  it("disallows private account surfaces from robots", () => {
    const disallow = robotsDisallowPaths();
    for (const path of ["/dashboard", "/cart", "/kyc", "/orders", "/profile"]) {
      assert.equal(disallow.includes(path), true, `missing ${path}`);
    }
  });
});
