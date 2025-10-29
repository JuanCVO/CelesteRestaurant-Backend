import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import productsRouter from "./routes/products";
import salesRouter from "./routes/sales";
import ordersRouter from "./routes/orders";
import authRouter from "./routes/auth";
import { authMiddleware, adminOnly, adminOrMesero } from "./middleware/auth";
import pagosRoutes from "./routes/pagos.routes";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/auth", authRouter);
app.use("/api/products/public", productsRouter); 


app.use("/api/products", authMiddleware, adminOnly, productsRouter); 
app.use("/api/orders", authMiddleware, ordersRouter); 
app.use("/api/sales", authMiddleware, adminOnly, salesRouter);
app.use("/api/pagos", pagosRoutes);


app.get("/", (_req, res) => res.send("API Celeste funcionando correctamente."));


setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("🟢 Neon keep-alive OK");
  } catch (err) {
    console.error("🔴 Error al mantener Neon activo:", err);
  }
}, 600000);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
