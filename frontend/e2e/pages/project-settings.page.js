class ProjectSettingsPage {
  constructor(page) {
    this.page = page;

    this.nameInput = page.locator("#project-name");
    this.descriptionInput = page.locator("#project-description");
    this.updateButton = page.getByRole("button", { name: /update project/i });
    this.savedToast = page.getByText(/project updated successfully/i);
  }

  async goto(projectId) {
    await this.page.goto(`/assess/${projectId}/settings`, { waitUntil: "domcontentloaded" });
    await this.nameInput.waitFor({ timeout: 30_000 });
  }

  async updateDetails({ name, description }) {
    if (name !== undefined) {
      await this.nameInput.fill(name);
    }
    if (description !== undefined) {
      await this.descriptionInput.fill(description);
    }
    await this.updateButton.click();
    await this.savedToast.waitFor({ timeout: 15_000 });
  }
}

module.exports = { ProjectSettingsPage };
