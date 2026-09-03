const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;
let apiProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173'); // Vite default port
  } else {
    mainWindow.loadFile(path.join(__dirname, 'frontend/dist/index.html'));
  }
}

function startApiServer() {
  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
  const scriptPath = isDev 
      ? path.join(__dirname, 'backend', 'src', 'index.ts')
      : path.join(__dirname, 'backend', 'dist', 'index.js');

  const cmd = isDev ? 'npx.cmd' : 'node';
  const args = isDev ? ['ts-node', scriptPath] : [scriptPath];

  apiProcess = spawn(cmd, args, {
    shell: true,
    cwd: path.join(__dirname, 'backend'),
    env: { ...process.env }
  });

  apiProcess.stdout.on('data', (data) => {
    console.log(`[API]: ${data}`);
  });

  apiProcess.stderr.on('data', (data) => {
    console.error(`[API ERROR]: ${data}`);
  });
}

function checkApiReady(retries = 10, delay = 1000) {
  return new Promise((resolve, reject) => {
    const attempt = (currentTry) => {
      const req = http.get('http://localhost:3000/api/health', (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          retry(currentTry);
        }
      });
      req.on('error', () => {
        retry(currentTry);
      });
    };

    const retry = (currentTry) => {
      if (currentTry >= retries) {
        reject(new Error('API failed to start'));
      } else {
        setTimeout(() => attempt(currentTry + 1), delay);
      }
    };

    attempt(0);
  });
}

app.whenReady().then(async () => {
  startApiServer();
  
  try {
    await checkApiReady();
    console.log('API is ready. Loading window...');
    createWindow();
  } catch (error) {
    console.error('Failed to start API:', error);
    createWindow(); 
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (apiProcess) {
    apiProcess.kill();
  }
});
