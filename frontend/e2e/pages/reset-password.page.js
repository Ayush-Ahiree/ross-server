class ResetPasswordPage {
  constructor(page) {
    this.page = page;

    this.invalidLinkHeading = page.getByText(/invalid reset link/i);
    this.passwordInput = page.locator("#password");
    this.confirmPasswordInput = page.locator("#confirmPassword");
    this.submitButton = page.getByRole("button", { name: /^reset password$/i });
    this.successHeading = page.getByText(/password updated!/i);
    // The page renders `err.message || "Failed to reset password..."` — the
    // backend actually returns a specific message ("Invalid or expired reset
    // token"), so that's what shows in practice, not the generic fallback.
    // Verified live 2026-07-18.
    this.errorBanner = page.getByText(/invalid or expired reset token|failed to reset password|passwords do not match/i);
  }

  // token=null exercises the "Invalid Reset Link" no-token state; a
  // bogus/expired token reaches the real form but fails server-side on
  // submit with the backend's "Invalid or expired reset token" message.
  async goto(token) {
    const qs = token ? `?token=${encodeURIComponent(token)}` : "";
    await this.page.goto(`/auth/reset-password${qs}`, { waitUntil: "domcontentloaded" });
  }

  async submit(password, confirmPassword = password) {
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.submitButton.click();
  }
}

module.exports = { ResetPasswordPage };
