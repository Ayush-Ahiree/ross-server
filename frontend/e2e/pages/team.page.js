class TeamPage {
  constructor(page) {
    this.page = page;

    this.membersHeading = page.getByText(/project members/i).first();
    this.inviteHeading = page.getByText(/invite new member/i).first();
    this.upgradeGate = page.getByRole("button", { name: /upgrade to invite members/i });

    this.inviteEmailInput = page.locator("#inviteEmail");
    this.roleSelectTrigger = page.getByText(/select role/i).or(page.getByRole("combobox")).first();
    this.sendInviteButton = page.getByRole("button", { name: /send invite/i });

    this.pendingInvitationsHeading = page.getByText(/pending & declined invitations/i);
    this.refreshButton = page.getByRole("button", { name: /refresh/i });
  }

  async goto(projectId) {
    await this.page.goto(`/assess/${projectId}/team`, { waitUntil: "domcontentloaded" });
    await this.inviteHeading.or(this.membersHeading).waitFor({ timeout: 30_000 });
  }

  memberRow(email) {
    return this.page.getByRole("row", { name: email });
  }

  invitationRow(email) {
    return this.page.getByRole("row", { name: email });
  }

  async invite(email, role) {
    await this.inviteEmailInput.fill(email);
    if (role) {
      await this.roleSelectTrigger.click();
      await this.page.getByRole("option", { name: new RegExp(`^${role}$`, "i") }).click();
    }
    await this.sendInviteButton.click();
  }

  // Revokes (or dismisses, for a declined invite) the row matching `email`.
  // Both actions open the same confirmation dialog with a "Revoke"/"Dismiss"
  // submit button.
  async revokeInvitation(email) {
    const row = this.invitationRow(email);
    await row.getByRole("button", { name: /revoke|dismiss/i }).click();
    const dialog = this.page.getByRole("dialog");
    await dialog.getByRole("button", { name: /^(revoke|dismiss)$/i }).click();
    await dialog.waitFor({ state: "hidden" });
  }
}

module.exports = { TeamPage };
