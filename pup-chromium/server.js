const { exec, spawn } = require("child_process");
const { chromium } = require("playwright");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

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

exec("Xvfb :99 -screen 0 1920x1080x24 & sleep 2", (error) => {
  if (error) {
    console.error("Error starting Xvfb:", error);
  } else {
    console.log("Xvfb started on :99");

    exec("x11vnc -display :99 -forever -nopw -bg -rfbport 5900", (error) => {
      if (error) console.error("Error starting x11vnc:", error);
      else console.log("x11vnc running on port 5900");
    });

    exec(`novnc_proxy --vnc localhost:5900 --listen ${VNC_PORT} &`, (error) => {
      if (error) console.error("Error starting noVNC:", error);
      else
        console.log(`noVNC available at http://localhost:${VNC_PORT}/vnc.html`);
    });

    startBrowser();
  }
});

app.post("/start", (req, res) => {
  const { targetUrl } = req.body;
  if (!targetUrl) {
    return res.status(400).json({ message: "No target URL provided!" });
  }

  if (playwrightProcess) {
    return res
      .status(400)
      .json({ message: "Recording is already in progress!" });
  }

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

  res.json({ message: "Playwright recording started!", file: scriptPath });
});

app.post("/stop", (req, res) => {
  if (!playwrightProcess) {
    return res.status(400).json({ message: "No recording in progress!" });
  }

  exec("pkill -f 'playwright codegen'", () => {
    playwrightProcess = null;

    if (fs.existsSync(scriptPath)) {
      console.log("Recording saved to:", scriptPath);
      res.json({
        message: "Recording stopped and saved!",
        file: scriptPath,
      });
    } else {
      res.status(500).json({ message: "Failed to save recording!" });
    }
  });
});

app.get("/file/:uuid", (req, res) => {
  const { uuid } = req.params;
  const filePath = `/app/${uuid}.spec.ts`;

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: " File not found!" });
  }
});

app.post("/save-file/:uuid", (req, res) => {
  const { uuid } = req.params;
  const { code } = req.body;

  if (!uuid || !code) {
    return res.status(400).json({ message: "UUID and code are required!" });
  }

  const filePath = `/app/${uuid}.spec.ts`;

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found!" });
  }

  fs.writeFileSync(filePath, code, "utf8");

  console.log(`Code updated for UUID: ${uuid}`);
  res.json({ message: "Code updated successfully!" });
});

async function startBrowser() {
  console.log("Starting Chromium...");

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

    console.log("Chromium launched!");
  } catch (error) {
    console.error("Error launching Chromium:", error);
  }
}

app.get("/", (req, res) => {
  res.send(
    `<h2>Open the remote browser: <a href="http://localhost:${VNC_PORT}/vnc.html" target="_blank">Click here</a></h2>`
  );
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
