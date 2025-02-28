const { exec, spawn } = require("child_process");
const { chromium } = require("playwright");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid"); // Import UUID package

const app = express();
const PORT = 3000;
const VNC_PORT = 8080;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

let playwrightProcess = null;
let scriptPath = "";

// :one: Start Xvfb and wait for it to fully initialize
exec("Xvfb :99 -screen 0 1920x1080x24 & sleep 2", (error) => {
  if (error) {
    console.error("Error starting Xvfb:", error);
  } else {
    console.log("✅ Xvfb started on :99");

    // :two: Start x11vnc after Xvfb is confirmed to be running
    exec("x11vnc -display :99 -forever -nopw -bg -rfbport 5900", (error) => {
      if (error) console.error("Error starting x11vnc:", error);
      else console.log("✅ x11vnc running on port 5900");
    });

    // :three: Start noVNC after x11vnc is confirmed
    exec(`novnc_proxy --vnc localhost:5900 --listen ${VNC_PORT} &`, (error) => {
      if (error) console.error("Error starting noVNC:", error);
      else
        console.log(
          `✅ noVNC available at http://localhost:${VNC_PORT}/vnc.html`
        );
    });

    // :four: Start Chromium after Xvfb is fully up
    startBrowser();
  }
});

// :five: API to Start Playwright Codegen
app.post("/start", (req, res) => {
  const { targetUrl } = req.body;
  if (!targetUrl) {
    return res.status(400).json({ message: "❌ No target URL provided!" });
  }

  if (playwrightProcess) {
    return res
      .status(400)
      .json({ message: "⏳ Recording is already in progress!" });
  }

  // Generate a unique filename with UUID
  const fileId = uuidv4();
  scriptPath = `/app/${fileId}.spec.ts`;

  console.log(`🎬 Starting Playwright codegen... (Saving to ${scriptPath})`);

  playwrightProcess = spawn(
    "npx",
    ["playwright", "codegen", "--output", scriptPath, targetUrl],
    {
      env: { ...process.env, DISPLAY: ":99" },
      detached: true,
      stdio: "ignore",
    }
  );

  res.json({ message: "✅ Playwright recording started!", file: scriptPath });
});

// :six: API to Stop Recording
app.post("/stop", (req, res) => {
  if (!playwrightProcess) {
    return res.status(400).json({ message: "No recording in progress!" });
  }

  exec("pkill -f 'playwright codegen'", () => {
    playwrightProcess = null;

    if (fs.existsSync(scriptPath)) {
      console.log("📄 Recording saved to:", scriptPath);
      res.json({
        message: "✅ Recording stopped and saved!",
        file: scriptPath,
      });
    } else {
      res.status(500).json({ message: "Failed to save recording!" });
    }
  });
});

// :seven: Launch Chromium with Playwright
async function startBrowser() {
  console.log("⏳ Starting Chromium...");

  try {
    const browser = await chromium.launch({
      headless: false,
      executablePath:
        "/root/.cache/ms-playwright/chromium-1155/chrome-linux/chrome",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--remote-debugging-port=9222",
        "--display=:99",
      ],
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    console.log("✅ Chromium launched!");
  } catch (error) {
    console.error("Error launching Chromium:", error);
  }
}

// :eight: Express Server Home Route
app.get("/", (req, res) => {
  res.send(
    `<h2>Open the remote browser: <a href="http://localhost:${VNC_PORT}/vnc.html" target="_blank">Click here</a></h2>`
  );
});

// :nine: Start Express Server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
