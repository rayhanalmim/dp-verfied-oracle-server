import express, { Application, Request, Response } from "express";
import cors from "cors";
import os from 'os';
import depositRoutes from './modules/deposit/deposit.route';
import transactionRoutes from './modules/transaction/transaction.route';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './services/loggerService';

const app: Application = express();

app.use(express.json());
app.use(cors());

// API Routes
app.use("/api/deposit", depositRoutes);
app.use("/api/transaction", transactionRoutes);

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

// Error Handler
app.use(errorHandler);

console.log(process.cwd());

export default app;