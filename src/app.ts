import express, { Application, Request, Response } from "express";
import cors from "cors";
import os from 'os';
const app: Application = express();

app.use(express.json());
app.use(cors());

//applications route

// app.use("/api", ProductRoute);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Route to fetch MAC address
app.get('/getMacAddress', (req: Request, res: Response) => {
  try {
    const networkInterfaces = os.networkInterfaces();
    const macAddresses: string[] = [];

    Object.values(networkInterfaces).forEach((iface) => {
      iface?.forEach((config) => {
        if (config.mac !== '00:00:00:00:00:00') {
          macAddresses.push(config.mac);
        }
      });
    });

    res.status(200).json({ macAddress: macAddresses[0] || 'Unavailable' });
  } catch (error) {
    console.error('Error fetching MAC address:', error);
    res.status(500).json({ error: 'Unable to retrieve MAC address' });
  }
});

// Not Found Route Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err: any, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "An unexpected error occurred",
  });
});

console.log(process.cwd());

export default app;