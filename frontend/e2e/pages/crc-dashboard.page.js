class CrcDashboardPage {
  constructor(page) {
    this.page = page;

    this.noAssessmentData = page.getByText(/no assessment data yet/i);
    this.quickWinsHeading = page.getByText(/quick wins/i).first();
    // "Ready" / "Partially Ready" / "Not Ready" tier badge next to the big
    // circular readiness %.
    this.tierBadge = page
      .getByText(/^(ready|partially ready|not ready|insufficient data)$/i)
      .first();
    this.overallReadinessLabel = page.getByText(/overall readiness/i).first();
    this.exportFullButton = page.getByRole("button", { name: /download full pdf/i }).first();
    this.exportSummaryButton = page.getByRole("button", { name: /download summary/i }).first();
  }

  async goto(projectId) {
    await this.page.goto(`/assess/${projectId}/crc/dashboard`, { waitUntil: "domcontentloaded" });
    // Wait for whichever stable state the 4-call load waterfall settles into
    // — a scored tier badge, or the empty state on a zero-answer project —
    // instead of a fixed sleep.
    // No .catch() here on purpose: if neither state ever appears, the
    // waitFor() should reject and surface a real timeout error at the call
    // site, rather than Promise.race silently resolving once both swallowed
    // timeouts settle (which would let the caller proceed against a page
    // that never actually loaded).
    await Promise.race([
      this.tierBadge.waitFor({ timeout: 30_000 }),
      this.noAssessmentData.waitFor({ timeout: 30_000 }),
    ]);
  }
}

module.exports = { CrcDashboardPage };
