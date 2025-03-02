const { chromium } = require("playwright");
const runTest = async (page , args) => {
  const [username, password] = args;

  try {
    await page.goto("https://github.com/");
    await page.getByRole("link", { name: "Sign in" }).click();
    await page
      .getByRole("textbox", { name: "Username or email address" })
      .fill(username);
    await page.getByRole("textbox", { name: "Password" }).fill(password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
  } catch (error) {
    console.error("Error during Playwright test:", error);
  }
};

module.exports = runTest;
