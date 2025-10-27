import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productsRouter from "./routes/products";
import salesRouter from "./routes/sales";
import ordersRouter from "./routes/orders";
import authRouter from "./routes/auth";
import { authMiddleware, adminOnly } from "./middleware/auth";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas públicas
app.use("/api/auth", authRouter);

// Rutas protegidas
app.use("/api/products", authMiddleware, adminOnly, productsRouter); // solo admin
app.use("/api/orders", authMiddleware, ordersRouter); // admin o mesero
app.use("/api/sales", authMiddleware, salesRouter);

app.get("/", (_req, res) => res.send("API Caja Celeste funcionando 🚀"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
