const { exec, spawn } = require("child_process");
const { chromium } = require("playwright");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { refactorScript } = require("./utils");

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

    // :two: Start x11vnc after Xvfb is confirmed to be running
    exec(
      "x11vnc -display :99 -geometry 1920x1080 -forever -nopw -bg -rfbport 5900",
      (error) => {
        if (error) console.error("Error starting x11vnc:", error);
        else console.log("x11vnc running on port 5900");
      }
    );

    // :three: Start noVNC after x11vnc is confirmed

    exec(
      `novnc_proxy --vnc localhost:5900 --listen ${VNC_PORT} --quality 9 --enable-webp &`,
      (error) => {
        if (error) console.error("Error starting noVNC:", error);
        else
          console.log(
            `noVNC available at http://localhost:${VNC_PORT}/vnc.html`
          );
      }
    );

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

  res.json({
    message: "Playwright recording started!",
    file: scriptPath,
    uuid: fileId,
  });
});

app.post("/stop", (req, res) => {
  const { uuid } = req.body;
  if (!playwrightProcess) {
    return res.status(400).json({ message: "No recording in progress!" });
  }

  exec("pkill -f 'playwright codegen'", async () => {
    playwrightProcess = null;

    if (fs.existsSync(scriptPath)) {
      console.log("Recording saved to:", scriptPath);
      const script = fs.readFileSync(scriptPath, "utf8");
      try {
        const refactoredScript = await refactorScript(script);

        const response = JSON.parse(refactoredScript);
        console.log("refactoredScript", response.script);
        fs.writeFileSync(scriptPath, response.script, "utf8");

        createNewFile(uuid, "json", JSON.stringify(response.parameters));
        console.log("Parameters saved to:", `/app/${uuid}.json`);
      } catch (error) {
        console.error("Error refactoring script:", error);
        res.status(500).json({ message: "Error refactoring script!" });
      }
      res.json({
        message: "Recording stopped and saved!",
        file: scriptPath,
      });
    } else {
      res.status(500).json({ message: "Failed to save recording!" });
    }
  });
});

app.post("/replay", async (req, res) => {
  const { uuid, parameters } = req.body;

  if (!uuid) {
    return res.status(400).json({ message: "UUID is required!" });
  }

  const scriptPath = `/app/${uuid}.spec.ts`;
  if (!fs.existsSync(scriptPath)) {
    return res.status(404).json({ message: "Script file not found!" });
  }

  try {
    const scriptContent = fs.readFileSync(scriptPath, "utf8");

    let paramCode = "";
    if (parameters && typeof parameters === "object") {
      paramCode = Object.entries(parameters)
        .map(([key, value]) => `const ${key} = ${JSON.stringify(value)};`)
        .join("\n");
    }

    const replayScriptPath = `/app/${uuid}-replay.spec.ts`;
    const replayScriptContent = `${paramCode}\n${scriptContent}`;
    fs.writeFileSync(replayScriptPath, replayScriptContent, "utf8");

    const replayProcess = spawn(
      "npx",
      ["playwright", "test", replayScriptPath],
      {
        env: { ...process.env, DISPLAY: ":99" },
        stdio: "pipe",
      }
    );

    let logs = "";

    replayProcess.stdout.on("data", (data) => {
      logs += data.toString();
      console.log(`STDOUT: ${data.toString()}`);
    });

    replayProcess.stderr.on("data", (data) => {
      logs += data.toString();
      console.error(`STDERR: ${data.toString()}`);
    });

    replayProcess.on("error", (error) => {
      console.error("Error running Playwright:", error);
      return res.status(500).json({
        message: "Failed to execute Playwright!",
        error: error.message,
      });
    });

    replayProcess.on("close", (code) => {
      console.log(`Replay process exited with code ${code}`);
      if (code !== 0) {
        return res.status(500).json({ message: "Replay failed!", logs });
      }

      res.json({
        message: "Replay completed successfully!",
        status: "success",
        logs,
      });
    });
  } catch (error) {
    console.error("Error during replay:", error);
    res.status(500).json({
      message: "Error during replay execution!",
      error: error.message,
    });
  }
});

app.get("/file/:uuid", (req, res) => {
  const { uuid } = req.params;
  const scriptPath = `/app/${uuid}.spec.ts`;
  const parametersPath = `/app/${uuid}.json`;

  if (!fs.existsSync(scriptPath)) {
    return res.status(404).json({ message: "Script file not found!" });
  }

  let scriptContent = "";
  let parameters = null;

  try {
    scriptContent = fs.readFileSync(scriptPath, "utf-8");
  } catch (error) {
    console.error("Error reading script file:", error);
    return res.status(500).json({ message: "Error reading script file" });
  }

  if (fs.existsSync(parametersPath)) {
    try {
      const paramContent = fs.readFileSync(parametersPath, "utf-8");
      parameters = JSON.parse(paramContent);
    } catch (error) {
      console.error("Error reading parameters file:", error);
      parameters = null;
    }
  }

  res.json({
    script: scriptContent,
    parameters: parameters,
  });
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
        "--start-fullscreen", // <-- Forces Fullscreen Mode
        "--window-position=0,0", // Ensures it starts at the top-left
      ],
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }, // Ensures full-screen Playwright window
    });

    const page = await context.newPage();

    await page.evaluate(() => {
      window.moveTo(0, 0);
      window.resizeTo(screen.width, screen.height);
    });

    console.log("Chromium launched!");
  } catch (error) {
    console.error("Error launching Chromium:", error);
  }
}

app.post("/refactor", async (req, res) => {
  const { script } = req.body;
  console.log("script", script);

  if (!script) {
    return res.status(400).json({ message: "No script provided!" });
  }

  try {
    const refactoredScript = await refactorScript(script);
    console.log("refactoredScript", refactoredScript);

    const response = JSON.parse(refactoredScript);
    res.json(response);
  } catch (error) {
    console.error("Error refactoring script:", error);
    res.status(500).json({ message: "Error refactoring script!" });
  }
});

function createNewFile(uuid, fileType, content) {
  const filePath = `/app/${uuid}.${fileType}`;
  fs.writeFileSync(filePath, content, "utf8");
  return filePath;
}

app.get("/", (req, res) => {
  res.send(
    `<h2>Open the remote browser: <a href="http://localhost:${VNC_PORT}/vnc.html" target="_blank">Click here</a></h2>`
  );
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
