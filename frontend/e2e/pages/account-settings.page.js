class AccountSettingsPage {
  constructor(page) {
    this.page = page;

    this.heading = page.getByText(/account settings/i).first();

    // Notifications — each Switch's id matches its Label's htmlFor exactly
    // (weekly_digest / critical_alerts / vendor_reassessment), so getByLabel
    // resolves the underlying Radix switch button directly.
    this.weeklyDigestSwitch = page.getByLabel(/weekly digest/i);
    this.criticalAlertsSwitch = page.getByLabel(/critical risk alerts/i);
    this.vendorReassessmentSwitch = page.getByLabel(/vendor reassessment reminders/i);

    this.deletedProjectsHeading = page.getByText(/deleted projects/i).first();
    this.noDeletedProjectsText = page.getByText(/no deleted projects/i);
  }

  async goto() {
    await this.page.goto("/settings", { waitUntil: "domcontentloaded" });
    await this.heading.waitFor({ timeout: 30_000 });
  }

  // The wrapping <div> holds an <h4>{name}</h4> plus a "Restore" button —
  // match on text rather than a heading role to keep this independent of
  // how h4 gets mapped to accessibility roles.
  deletedProjectRestoreButton(name) {
    return this.page
      .locator("div")
      .filter({ hasText: name })
      .filter({ has: this.page.getByRole("button", { name: /restore/i }) })
      .last()
      .getByRole("button", { name: /restore/i });
  }

  async restoreDeletedProject(name) {
    await this.deletedProjectRestoreButton(name).click();
  }
}

module.exports = { AccountSettingsPage };
