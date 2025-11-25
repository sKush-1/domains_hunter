import { Request, Response, NextFunction } from "express";

// Extend types so you can use custom fields (TypeScript)
declare global {
    namespace Express {
        interface Request {
            userIp?: string;
            deviceId?: string;
        }
    }
}

export function clientInfoMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    // Get IP address, prefer X-Forwarded-For for proxies
    const ip =
        req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.ip;
    req.userIp = ip;

    // Get device fingerprint from custom header, e.g. X-Device-ID
    const deviceId = req.header("X-Device-ID");
    req.deviceId = deviceId || "unknown";

    next();
}
