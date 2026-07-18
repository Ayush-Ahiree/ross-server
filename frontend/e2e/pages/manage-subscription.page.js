// Read-only coverage only, intentionally. Every action on this page (Upgrade
// to BLOOM/BLOOM PLUS, Cancel Subscription) redirects to real Stripe billing
// against whatever plan the shared test account currently holds — none of
// that is safe to automate against a real account, so this page object never
// clicks a billing action, only asserts the page renders.
class ManageSubscriptionPage {
  constructor(page) {
    this.page = page;

    this.heading = page.getByRole("heading", { name: /manage your subscription|subscription/i }).first();
    this.faqHeading = page.getByText(/frequently asked questions/i);
  }

  async goto() {
    await this.page.goto("/manage-subscription", { waitUntil: "domcontentloaded" });
    await this.heading.waitFor({ timeout: 30_000 });
  }
}

module.exports = { ManageSubscriptionPage };
