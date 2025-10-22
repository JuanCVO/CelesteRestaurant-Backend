import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productsRouter from "./routes/products";
import salesRouter from "./routes/sales";
import ordersRouter from "./routes/orders";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 


app.use("/api/products", productsRouter);
app.use("/api/sales", salesRouter);
app.use("/api/orders", ordersRouter);

app.get("/", (req, res) => res.send("API Caja Celeste funcionando 🚀"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
