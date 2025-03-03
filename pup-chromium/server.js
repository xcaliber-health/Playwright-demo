const { exec, spawn } = require("child_process");
const { chromium } = require("playwright");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { refactorScript } = require("./utils");
const path = require("path");

const app = express();
const PORT = 3000;
const VNC_PORT = 8080;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  })
);

app.use(express.json());

let playwrightProcess = null;
let scriptPath = "";
let browserInstance = null;

function startServices(callback) {
  exec("pgrep Xvfb", (error, stdout) => {
    if (stdout) {
      console.log("Xvfb is already running.");
    } else {
      exec("Xvfb :99 -screen 0 1920x1080x24 & sleep 2", error => {
        if (error) {
          console.error("Error starting Xvfb:", error);
          return callback(error);
        }
        console.log("Xvfb started on :99");
      });
    }

    exec("pgrep x11vnc", (error, stdout) => {
      if (stdout) {
        console.log("x11vnc is already running.");
      } else {
        exec(
          "x11vnc -display :99 -geometry 1920x1080 -forever -nopw -bg -rfbport 5900",
          error => {
            if (error) {
              console.error("Error starting x11vnc:", error);
              return callback(error);
            }
            console.log("x11vnc running on port 5900");
          }
        );
      }

      exec("pgrep novnc_proxy", (error, stdout) => {
        if (stdout) {
          console.log("noVNC is already running.");
          callback(null);
        } else {
          exec(
            `novnc_proxy --vnc localhost:5900 --listen ${VNC_PORT} --quality 9 --enable-webp &`,
            error => {
              if (error) {
                console.error("Error starting noVNC:", error);
                return callback(error);
              }
              console.log(
                `noVNC available at http://localhost:${VNC_PORT}/vnc.html`
              );
              callback(null);
            }
          );
        }
      });
    });
  });
}

function stopServices(callback) {
  exec("killall Xvfb x11vnc novnc_proxy", error => {
    if (error) {
      console.error("Error stopping services:", error);
      return callback(error);
    } else {
      if (browserInstance) {
        browserInstance
          .close()
          .then(() => {
            browserInstance = null;
            callback(null);
          })
          .catch(err => {
            console.error("Error closing browser instance:", err);
            callback(err);
          });
      } else {
        callback(null);
      }
    }
  });
}

exec("Xvfb :99 -screen 0 1920x1080x24 & sleep 2", error => {
  if (error) {
    console.error("Error starting Xvfb:", error);
  } else {
    console.log("Xvfb started on :99");

    // :two: Start x11vnc after Xvfb is confirmed to be running
    exec(
      "x11vnc -display :99 -geometry 1920x1080 -forever -nopw -bg -rfbport 5900",
      error => {
        if (error) console.error("Error starting x11vnc:", error);
        else console.log("x11vnc running on port 5900");
      }
    );

    // :three: Start noVNC after x11vnc is confirmed

    exec(
      `novnc_proxy --vnc localhost:5900 --listen ${VNC_PORT} --quality 9 --enable-webp &`,
      error => {
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
      stdio: "ignore"
    }
  );

  res.json({
    message: "Playwright recording started!",
    file: scriptPath,
    uuid: fileId
  });
});

app.post("/stop", (req, res) => {
  const { uuid } = req.body;
  if (!playwrightProcess) {
    return res.status(400).json({ message: "No recording in progress!" });
  }

  exec(
    "pkill -f 'playwright codegen';pkill chromium; pkill Xvfb; pkill x11vnc",
    async () => {
      playwrightProcess = null;
      exec(
        "lsof -i :5900 | grep 'LISTEN' | awk '{print $2}' | xargs kill -9",
        error => {
          if (error) {
            console.error("Error killing process on port 5900:", error);
          } else {
            console.log("Killed process using port 5900");
          }
        }
      );

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
          file: scriptPath
        });
      } else {
        res.status(500).json({ message: "Failed to save recording!" });
      }
    }
  );
});

app.post("/replay", async (req, res) => {
  const { uuid, parameters } = req.body;

  if (!uuid) {
    return res.status(400).json({ message: "UUID is required!" });
  }

  const runTestPath = `/app/${uuid}.spec.ts`;
  if (!fs.existsSync(runTestPath)) {
    return res.status(404).json({ message: "Script file not found!" });
  }

  const runTest = require(runTestPath);

  try {
    // Start services before running the test
    startServices(async error => {
      if (error) {
        return res.status(500).json({ message: "Error starting services!" });
      }

      const page = await startBrowser();

      // Convert parameters map to an array of arguments
      const args = Object.values(parameters);

      console.log("args", args);

      console.log("Running test with parameters:", args);
      try {
        await runTest(page, args);
        console.log("Test completed successfully!");
        res.json({
          message: "Replay completed successfully!",
          status: "success"
        });
      } catch (testError) {
        console.error("Error during test execution:", testError);
        res.status(500).json({
          message: "Error during test execution!",
          error: testError.message
        });
      }
    });
  } catch (error) {
    console.error("Error during replay:", error);
    res.status(500).json({
      message: "Error during replay execution!",
      error: error.message
    });
  }

  // Stop services after running the test
  // stopServices((error) => {
  //   if (error) {
  //     console.error("Error stopping services:", error);
  //   }
  // });
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
    parameters: parameters
  });
});

app.get("/scripts", (req, res) => {
  const files = fs.readdirSync("/app");
  const scriptDetails = files
    .filter(file => file.endsWith(".spec.ts")) 
    .map(scriptFile => {
      const uuid = scriptFile.replace(".spec.ts", ""); // Extract UUID
      const scriptPath = path.join(directoryPath, scriptFile);
      const parametersPath = path.join(directoryPath, `${uuid}.json`);

      let scriptContent = "";
      let parameters = "";

      try {
        scriptContent = fs.readFileSync(scriptPath, "utf-8");
      } catch (error) {
        console.error(`Error reading script file ${scriptFile}:`, error);
      }

      if (fs.existsSync(parametersPath)) {
        try {
          parameters = fs.readFileSync(parametersPath, "utf-8");
        } catch (error) {
          console.error(
            `Error reading parameters file ${parametersPath}:`,
            error
          );
        }
      }

      return {
        uuid: uuid,
        tag:"script",
        script: scriptContent,
        parameters: parameters
      };
    });


    const agentSessionPath = path.join(__dirname, "app", "agent");

  if (!fs.existsSync(agentSessionPath)) {
    return res
      .status(404)
      .json({ message: "Agent sessions directory not found!" });
  }

  const agentSessions = fs.readdirSync(agentSessionPath);

  const agentSessionDetails = agentSessions
    .map(session => {
      const agentSessionId = session.replace("-agent.json", "");
      console.log("agentSessionId:", agentSessionId);

      const filePath = path.join(agentSessionPath, session);

      if (fs.existsSync(filePath)) {
        const agentSessionContent = fs.readFileSync(filePath, "utf-8");
        const detail = JSON.parse(agentSessionContent);
        detail.tag = "agent";
        return detail;
      } else {
        return null; 
      }
    })
    .filter(detail => detail !== null);

  scriptDetails.push(...agentSessionDetails);
  res.json({ scriptDeatilList: scriptDetails });
});

app.post("/agent/operations", (req, res) => {
  const prompt = req.body.prompt;
  const title = req.body.title;
  const id = uuidv4();
  const agentSessionPath = path.join(
    __dirname,
    "app",
    "agent",
    `${id}-agent.json`
  );

  const dirPath = path.dirname(agentSessionPath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  fs.writeFileSync(
    agentSessionPath,
    JSON.stringify({
      id: id,
      title: title,
      prompt: prompt
    }),
    { encoding: "utf8" }
  );

  res.json({ id: id, title: title, prompt: prompt });
});

app.patch("/agent/operations/:id", (req, res) => {
  const { id } = req.params;
  const prompt = req.body.prompt;
  const title = req.body.title;

  console.log("id", id);
  console.log("prompt", prompt);
  console.log("title", title);

  const agentSessionPath = path.join(
    __dirname,
    "app",
    "agent",
    `${id}-agent.json`
  );
  if (!fs.existsSync(agentSessionPath)) {
    return res.status(404).json({ message: "Agent session not found!" });
  }

  fs.writeFileSync(
    agentSessionPath,
    JSON.stringify({ id: id, title: title, prompt: prompt }),
    { encoding: "utf8" }
  );
  res.json({
    message: "Agent session updated successfully!",
    id: id,
    title: title,
    prompt: prompt
  });
});

app.get("/agent/operations/:id", (req, res) => {
  const { id } = req.params;
  console.log("id", id);
  const agentSessionPath = path.join(
    __dirname,
    "app",
    "agent",
    `${id}-agent.json`
  );
  console.log("agentSessionPath", agentSessionPath);
  if (!fs.existsSync(agentSessionPath)) {
    return res.status(404).json({ message: "Agent session not found!" });
  }

  const agentSessionContent = fs.readFileSync(agentSessionPath, "utf-8");
  const agentSession = JSON.parse(agentSessionContent);
  console.log("agentSession", agentSession);

  res.json(agentSession);
});

app.get("/agent/operations", (req, res) => {
  const agentSessionPath = path.join(__dirname, "app", "agent");

  if (!fs.existsSync(agentSessionPath)) {
    return res
      .status(404)
      .json({ message: "Agent sessions directory not found!" });
  }

  const agentSessions = fs.readdirSync(agentSessionPath);

  const agentSessionDetails = agentSessions
    .map(session => {
      const agentSessionId = session.replace("-agent.json", "");
      console.log("agentSessionId:", agentSessionId);

      const filePath = path.join(agentSessionPath, session);

      if (fs.existsSync(filePath)) {
        const agentSessionContent = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(agentSessionContent);
      } else {
        return null; 
      }
    })
    .filter(detail => detail !== null); 
  res.json(agentSessionDetails);
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
  if (browserInstance) {
    console.log("Using existing Chromium instance...");
    const context = await browserInstance.newContext({
      viewport: { width: 1920, height: 1080 } // Ensures full-screen Playwright window
    });

    const page = await context.newPage();

    await page.evaluate(() => {
      window.moveTo(0, 0);
      window.resizeTo(screen.width, screen.height);
    });

    console.log("Chromium instance reused!");
    return page;
  }

  console.log("Starting new Chromium...");
  try {
    browserInstance = await chromium.launch({
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
        "--window-position=0,0" // Ensures it starts at the top-left
      ]
    });

    const context = await browserInstance.newContext({
      viewport: { width: 1920, height: 1080 } // Ensures full-screen Playwright window
    });

    const page = await context.newPage();

    await page.evaluate(() => {
      window.moveTo(0, 0);
      window.resizeTo(screen.width, screen.height);
    });

    console.log("Chromium launched!");
    return page;
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
