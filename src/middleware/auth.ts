import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET as string;

// ✅ Verifica token y agrega el rol al req
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  console.log("🧩 authMiddleware - Authorization:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado o inválido" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
    (req as any).user = decoded;
    next();
  } catch (err) {
    console.error("❌ Token inválido:", err);
    return res.status(403).json({ error: "Token inválido o expirado" });
  }
}

// 🔒 Solo ADMIN
export function adminOnly(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== "ADMIN") {
    return res.status(403).json({ error: "Acceso denegado. Solo administradores." });
  }
  next();
}

// 🔒 ADMIN o MESERO
export function adminOrMesero(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || !["ADMIN", "MESERO"].includes(user.role)) {
    return res.status(403).json({ error: "Acceso restringido" });
  }
  next();
}
