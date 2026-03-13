const { app, BrowserWindow } = require("electron");
const { spawn, exec } = require("child_process");
const path = require("path");
const fs = require("fs");

let backendProcess;

function startBackend() {

    let backendPath;

    if (app.isPackaged) {
        backendPath = path.join(
            process.resourcesPath,
            "backend",
            "main",
            "main.exe"
        );
    } else {
        backendPath = path.join(
            __dirname,
            "../../backend/dist/main/main.exe"
        );
    }

    // ★ AppDataにDB保存フォルダを作る
    const dbDir = path.join(app.getPath("userData"), "db");

    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    // ★ DBパス
    const dbPath = path.join(dbDir, "kakeibo.db");

    console.log("DB PATH:", dbPath);

    console.log("isPackaged:", app.isPackaged);
    console.log("resourcesPath:", process.resourcesPath);
    console.log("backendPath:", backendPath);

    // ★ FastAPIにDBパスを渡す
    backendProcess = spawn(backendPath, [], {
        env: {
            ...process.env,
            DB_PATH: dbPath
        }
    });

    backendProcess.stdout.on("data", data => {
        console.log(`FastAPI: ${data}`);
    });

    backendProcess.stderr.on("data", data => {
        console.error(`FastAPI error: ${data}`);
    });

    backendProcess.on("close", (code) => {
        console.log("Backend closed:", code);
    });
}

function createWindow() {

    const win = new BrowserWindow({
        width: 1200,
        height: 800
    });

    win.loadFile(
        path.join(__dirname, "../dist/index.html")
    );

    // win.webContents.openDevTools();

}

app.whenReady().then(async () => {
    startBackend();
    await new Promise(resolve => setTimeout(resolve, 3000));
    createWindow();
});

function stopBackend() {

    if (!backendProcess) return;

    try {
        exec(`taskkill /pid ${backendProcess.pid} /f /t`);
    } catch (e) {
        console.error(e);
    }
}

app.on("before-quit", stopBackend);
app.on("will-quit", stopBackend);
app.on("window-all-closed", () => {
    stopBackend();
    app.quit();
});