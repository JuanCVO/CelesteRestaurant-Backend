"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const products_1 = __importDefault(require("./routes/products"));
const sales_1 = __importDefault(require("./routes/sales"));
const orders_1 = __importDefault(require("./routes/orders"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/products", products_1.default);
app.use("/api/sales", sales_1.default);
app.use("/api/orders", orders_1.default);
app.get("/", (req, res) => res.send("API Caja Celeste funcionando 🚀"));
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
//# sourceMappingURL=server.js.map