import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "data.json");

interface AppData {
  vehicles: any[];
  drivers: any[];
  missions: any[];
  scriptUrl: string;
}

const defaultData: AppData = {
  vehicles: [
    { id: '1', plate: 'PC 123 AA', model: 'Land Rover Defender', type: 'Antincendio', insuranceExpiry: '2024-12-31', revisionExpiry: '2024-06-15', stampExpiry: '2025-01-20', maintenanceStatus: 'OK', lastKm: 12500 },
    { id: '2', plate: 'PC 456 BB', model: 'Fiat Ducato', type: 'Ambulanza', insuranceExpiry: '2023-11-30', revisionExpiry: '2025-02-10', stampExpiry: '2024-05-15', maintenanceStatus: 'Richiesta', lastKm: 45000 },
  ],
  drivers: [
    { id: '1', name: 'Mario Rossi', license: 'B, C', isAdmin: true, pin: '1234' },
    { id: '2', name: 'Luigi Bianchi', license: 'B', isAdmin: false, pin: '0000' },
  ],
  missions: [],
  scriptUrl: "",
};

function readData(): AppData {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    const content = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    return defaultData;
  }
}

function writeData(data: AppData) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/data", (req, res) => {
    res.json(readData());
  });

  app.post("/api/vehicles", (req, res) => {
    const data = readData();
    data.vehicles = req.body;
    writeData(data);
    res.json({ success: true });
  });

  app.post("/api/drivers", (req, res) => {
    const data = readData();
    data.drivers = req.body;
    writeData(data);
    res.json({ success: true });
  });

  app.post("/api/missions", (req, res) => {
    const data = readData();
    data.missions = req.body;
    writeData(data);
    res.json({ success: true });
  });

  app.post("/api/script-url", (req, res) => {
    const data = readData();
    data.scriptUrl = req.body.url;
    writeData(data);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
