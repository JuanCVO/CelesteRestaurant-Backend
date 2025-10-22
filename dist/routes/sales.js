"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = __importDefault(require("@/prisma/client"));
const router = (0, express_1.Router)();
router.get("/", async (req, res) => {
    try {
        const sales = await client_1.default.sale.findMany({ include: { product: true } });
        res.json(sales);
    }
    catch (error) {
        res.status(500).json({ error: "Error al obtener ventas" });
    }
});
router.post("/", async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const product = await client_1.default.product.findUnique({ where: { id: Number(productId) } });
        if (!product)
            return res.status(404).json({ error: "Producto no encontrado" });
        const qty = Number(quantity);
        if (product.stock < qty)
            return res.status(400).json({ error: "Stock insuficiente" });
        const total = Number(product.price) * qty;
        const sale = await client_1.default.$transaction(async (tx) => {
            const created = await tx.sale.create({
                data: { productId: product.id, quantity: qty, total },
            });
            await tx.product.update({
                where: { id: product.id },
                data: { stock: product.stock - qty },
            });
            return created;
        });
        res.status(201).json(sale);
    }
    catch (error) {
        res.status(500).json({ error: "Error al registrar venta" });
    }
});
exports.default = router;
//# sourceMappingURL=sales.js.map