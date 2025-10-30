import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import productsRouter from "./routes/products";
import salesRouter from "./routes/sales";
import ordersRouter from "./routes/orders";
import authRouter from "./routes/auth";
import pagosRoutes from "./routes/pagos.routes";
import { authMiddleware, adminOnly } from "./middleware/auth";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

// ✅ Configuración CORS segura (Vercel + Render + local)
const allowedOrigins = [
  "http://localhost:3000", // desarrollo local
  "https://celeste-restaurant-frontend.vercel.app", // frontend en Vercel
];

app.use(
  cors({
    origin: (origin, callback) => {
      // permitir peticiones sin origin (Postman, SSR, etc.)
      if (!origin) return callback(null, true);

      // permitir solo los dominios autorizados
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("🚫 CORS bloqueado para origen:", origin);
      return callback(new Error("CORS no permitido"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Rutas protegidas y públicas
app.use("/api/auth", authRouter);
app.use("/api/products/public", productsRouter); // pública
app.use("/api/products", authMiddleware, adminOnly, productsRouter); // solo admin
app.use("/api/orders", authMiddleware, ordersRouter);
app.use("/api/sales", authMiddleware, adminOnly, salesRouter);
app.use("/api/pagos", authMiddleware, adminOnly, pagosRoutes); // solo admin

// ✅ Ruta base
app.get("/", (_req, res) => res.send("✅ API Celeste funcionando correctamente."));

// 🟢 Mantener conexión activa con Neon
setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("🟢 Neon keep-alive OK");
  } catch (err) {
    console.error("🔴 Error al mantener Neon activo:", err);
  }
}, 600000);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
);
