const { chromium } = require("playwright");
const runTest = async (args) => {
  const [username, password] = args;
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

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
  } finally {
    await browser.close();
  }
};

module.exports = runTest;
