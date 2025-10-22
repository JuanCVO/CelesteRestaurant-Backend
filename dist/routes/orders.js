"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = __importDefault(require("@/prisma/client"));
const router = (0, express_1.Router)();
// Crear pedido con varios productos
router.post("/", async (req, res) => {
    try {
        const { table, items } = req.body; // items = [{ productId, quantity }]
        // Obtener productos involucrados
        const products = await client_1.default.product.findMany({
            where: { id: { in: items.map((i) => i.productId) } },
        });
        // Calcular total del pedido (convertimos Decimal -> number)
        const total = items.reduce((sum, i) => {
            const product = products.find((p) => p.id === i.productId);
            const price = product?.price ? Number(product.price) : 0;
            return sum + price * i.quantity;
        }, 0);
        // Crear pedido con items
        const order = await client_1.default.order.create({
            data: {
                table,
                total,
                items: {
                    create: items.map((i) => {
                        const product = products.find((p) => p.id === i.productId);
                        const price = product?.price ? Number(product.price) : 0;
                        return {
                            productId: i.productId,
                            quantity: i.quantity,
                            subtotal: price * i.quantity,
                        };
                    }),
                },
            },
            include: { items: { include: { product: true } } },
        });
        res.json(order);
    }
    catch (error) {
        console.error("❌ Error al crear pedido:", error);
        res.status(500).json({ error: "Error al crear pedido" });
    }
});
// Listar pedidos del día
router.get("/", async (_req, res) => {
    try {
        const orders = await client_1.default.order.findMany({
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: "desc" },
        });
        res.json(orders);
    }
    catch (error) {
        console.error("❌ Error al obtener pedidos:", error);
        res.status(500).json({ error: "Error al obtener pedidos" });
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map