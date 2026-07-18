class VerifyOtpPage {
  constructor(page) {
    this.page = page;

    this.checkInboxHeading = page.getByText(/check your inbox/i);
    this.verifyButton = page.getByRole("button", { name: /verify code/i });
    // Actual backend copy is "Invalid or expired OTP" (no trailing "code").
    // .first() is required, not cosmetic: the app renders this same text
    // both as an inline banner AND as a toast in the notifications region —
    // reproduced live 2026-07-18 as a strict-mode "resolved to 2 elements"
    // failure without it.
    this.errorText = page.getByText(/invalid or expired otp|please enter a complete 6-digit code/i).first();
    this.resendLink = page.getByRole("button", { name: /resend code/i });
  }

  async goto(email) {
    const qs = email ? `?email=${encodeURIComponent(email)}` : "";
    await this.page.goto(`/auth/verify-otp${qs}`, { waitUntil: "domcontentloaded" });
  }

  digitInput(n) {
    return this.page.getByLabel(`Digit ${n} of 6`);
  }

  async enterCode(code) {
    const digits = code.split("");
    for (let i = 0; i < digits.length; i++) {
      await this.digitInput(i + 1).fill(digits[i]);
    }
  }

  async submit(code) {
    await this.enterCode(code);
    await this.verifyButton.click();
  }
}

module.exports = { VerifyOtpPage };
