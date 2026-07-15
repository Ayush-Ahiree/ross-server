// Shared constants for the UI E2E suite.
const path = require("path");

module.exports = {
  // Where auth.setup.js stores the signed-in browser state (localStorage JWT).
  STORAGE_STATE: path.join(__dirname, ".auth", "state.json"),

  EMAIL: process.env.E2E_EMAIL || "",
  PASSWORD: process.env.E2E_PASSWORD || "",

  // Backend origin for direct API calls that bypass the UI (e.g. project
  // cleanup — see the dashboard delete-flow bug noted in
  // vulnerability-assessment.spec.js). Defaults to the live deployment,
  // same convention as E2E_BASE_URL above.
  API_BASE_URL: process.env.E2E_API_URL || "https://ross-server-theta.vercel.app",

  // AIMA answer options, exactly as rendered in QuestionView.
  // (value scale, for reference: No = 0, Partially = 1.5, Yes = 3)
  AIMA_ANSWERS: ["No", "Partially", "Yes"],

  // Safety cap on the answer loop (free AIMA = 144 Qs; premium adds a few).
  MAX_QUESTIONS: 200,
};
