class InvitePage {
  constructor(page) {
    this.page = page;

    this.invalidHeading = page.getByText(/invalid invitation/i);
    this.projectInvitationHeading = page.getByText(/project invitation/i);
    this.acceptButton = page.getByRole("button", { name: /^accept invitation$/i });
    this.declineButton = page.getByRole("button", { name: /^decline invitation$/i });
    this.signInAndAcceptButton = page.getByRole("button", { name: /sign in & accept/i });
    this.createAccountButton = page.getByRole("button", { name: /create account & accept/i });
  }

  // token=null exercises the "No invitation token provided" path;
  // a bogus/expired token exercises the "Invalid or expired invitation
  // token" path (both render the same invalidHeading card).
  async goto(token) {
    const qs = token ? `?token=${encodeURIComponent(token)}` : "";
    await this.page.goto(`/invite/accept${qs}`, { waitUntil: "domcontentloaded" });
  }
}

module.exports = { InvitePage };
