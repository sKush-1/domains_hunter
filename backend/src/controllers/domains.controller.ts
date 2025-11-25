import { Request, Response } from "express";
import pool from "../config/database/db.config";

export async function generateSuggestions(req: Request, res: Response) {
    const ip = req.userIp;
    const deviceId = req.deviceId;
  
    console.log("Request from IP:", ip, "Device ID:", deviceId);
  
    try {
        const client = await pool.connect();
        // Simple query to test database connection
        const result = await client.query('SELECT NOW() as now');
        client.release();
        
        res.json({ 
            result: "Domain suggestions here!",
            dbTest: result.rows[0].now
        });
    } catch (error) {
        console.error("Database connection error:", error);
        res.status(500).json({ 
            error: "Failed to connect to database",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
}