class ForgotPasswordPage {
  constructor(page) {
    this.page = page;

    this.emailInput = page.locator("#email");
    this.sendButton = page.getByRole("button", { name: /send reset link/i });
    this.checkInboxHeading = page.getByText(/check your inbox/i);
    this.tryDifferentEmailButton = page.getByRole("button", { name: /try a different email/i });
  }

  async goto() {
    await this.page.goto("/auth/forgot-password", { waitUntil: "domcontentloaded" });
    await this.emailInput.waitFor();
  }

  async submit(email) {
    await this.emailInput.fill(email);
    await this.sendButton.click();
  }
}

module.exports = { ForgotPasswordPage };
