class InventoryPage {
  constructor(page) {
    this.page = page;

    this.addComponentButton = page.getByRole("button", { name: /add (component|your first component)/i });
    this.emptyState = page.getByText(/component inventory is empty/i);

    this.formDialog = page.getByRole("dialog").filter({ hasText: /add new ai component|edit ai component/i });
    this.roleInput = this.formDialog.getByPlaceholder(/explain exactly what this component does/i);
    this.noDataProcessingButton = this.formDialog.getByRole("button", { name: /set to 'no data processing'/i });
    this.createButton = this.formDialog.getByRole("button", { name: /create component|save changes/i });

    this.savedToast = page.getByText(/component (added to inventory|updated successfully)/i);

    // The detail Sheet and the Delete-confirm Dialog are both Radix
    // Dialog.Content under the hood (role="dialog"); only one is open at a
    // time (openAddForm/openEditForm force the detail Sheet closed while the
    // form Dialog is open), so a plain role query is unambiguous per step.
    this.detailPanel = page.getByRole("dialog");
    this.deleteDialog = page.getByRole("dialog").filter({ hasText: /remove ai component/i });
    this.deleteConfirmButton = this.deleteDialog.getByRole("button", { name: /^delete component$/i });
    this.deletedToast = page.getByText(/component removed/i);
  }

  async goto(projectId) {
    await this.page.goto(`/assess/${projectId}/inventory`, { waitUntil: "domcontentloaded" });
    await this.addComponentButton.or(this.emptyState).waitFor({ timeout: 30_000 });
  }

  row(componentName) {
    return this.page.getByRole("row", { name: componentName });
  }

  // Icon-only ghost buttons (IconEdit/IconTrash from @tabler/icons-react)
  // with no accessible name — tabler-icons-react stamps a stable
  // `tabler-icon-<name>` class on every icon's <svg>, so that's the only
  // reliable hook.
  deleteTriggerButton() {
    return this.detailPanel.locator("button:has(svg.tabler-icon-trash)");
  }

  // openAddForm() (frontend/src/app/assess/[projectId]/inventory/page.tsx)
  // pre-fills Type=Closed Foundation Model, Provider=OpenAI, Name from the
  // vendor catalog's first OpenAI model, and Status=Active — so the only
  // required fields actually missing are Role in AI System (free text) and
  // Data Categories (the "No Data Processing" shortcut satisfies it in one
  // click without opening the vendor-risk-assessment flow a real category
  // would trigger).
  async addDefaultComponent(role) {
    await this.addComponentButton.click();
    await this.formDialog.waitFor();
    await this.roleInput.fill(role);
    await this.noDataProcessingButton.click();
    await this.createButton.click();
    await this.formDialog.waitFor({ state: "hidden" });
  }

  async openDetail(componentName) {
    await this.row(componentName).click();
    await this.detailPanel.waitFor();
  }

  async deleteComponent(componentName) {
    await this.openDetail(componentName);
    await this.deleteTriggerButton().click();
    await this.deleteDialog.waitFor();
    await this.deleteConfirmButton.click();
    await this.deleteDialog.waitFor({ state: "hidden" });
  }
}

module.exports = { InventoryPage };
