class VerifyEmailPage {
  constructor(page) {
    this.page = page;

    this.loadingText = page.getByText(/verifying your email address/i);
    // Bug found live 2026-07-18 (see goto() below): this page always hits
    // "Email and OTP are required", never "Invalid or expired verification
    // token" — the frontend's own fallback string for a *rejected* token is
    // effectively dead code today.
    this.errorText = page.getByText(/email and otp are required|invalid or expired verification token/i);
    this.successText = page.getByText(/your email has been successfully verified/i);
  }

  // token=null never calls the backend (the page's useEffect is a no-op
  // without a token) and stays on the loading skeleton indefinitely.
  //
  // **Product bug, not an e2e issue** (verified live 2026-07-18): a token
  // (bogus or real) calls `POST /auth/verify-email` with `{ token }` only,
  // but the backend route (`backend/src/routes/auth.ts` `/verify-email`)
  // only implements the OTP flow — it destructures `{ email, otp }` and
  // immediately 400s with "Email and OTP are required" whenever either is
  // missing, with no branch for a bare `token`. So this link-based
  // verification page cannot ever succeed, for ANY token value, real or
  // fake — the email a new signup receives with a verify-email link is
  // presumably unusable as-is. Not fixed here per repo scope (e2e-only);
  // flagging in case this needs a backend-side look.
  async goto(token) {
    const qs = token ? `?token=${encodeURIComponent(token)}` : "";
    await this.page.goto(`/auth/verify-email${qs}`, { waitUntil: "domcontentloaded" });
  }
}

module.exports = { VerifyEmailPage };
