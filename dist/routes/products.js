"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = __importDefault(require("../prisma/client"));
const router = (0, express_1.Router)();
router.get("/", async (req, res) => {
    try {
        const products = await client_1.default.product.findMany();
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: "Error al obtener productos" });
    }
});
router.post("/", async (req, res) => {
    try {
        const { name, category, price, stock } = req.body;
        const product = await client_1.default.product.create({
            data: { name, category, price: Number(price), stock: Number(stock) },
        });
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({ error: "Error al crear producto" });
    }
});
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, price, stock } = req.body;
        const updated = await client_1.default.product.update({
            where: { id: Number(id) },
            data: { name, category, price: Number(price), stock: Number(stock) },
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Error al actualizar producto" });
    }
});
exports.default = router;
//# sourceMappingURL=products.js.map