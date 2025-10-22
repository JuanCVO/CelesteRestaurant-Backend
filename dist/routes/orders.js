"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = __importDefault(require("../prisma/client"));
const router = (0, express_1.Router)();
// 🧾 Crear nuevo pedido (queda abierto)
router.post("/", async (req, res) => {
    try {
        const { table, items } = req.body;
        if (!table || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Datos inválidos para crear pedido" });
        }
        // Obtener productos
        const products = await client_1.default.product.findMany({
            where: { id: { in: items.map((i) => i.productId) } },
        });
        // Validar stock disponible
        for (const i of items) {
            const product = products.find((p) => p.id === i.productId);
            if (!product) {
                return res.status(400).json({ error: `Producto ${i.productId} no encontrado` });
            }
            if (product.stock < i.quantity) {
                return res
                    .status(400)
                    .json({ error: `Stock insuficiente para ${product.name}. Solo quedan ${product.stock}` });
            }
        }
        // Calcular total
        const total = items.reduce((sum, i) => {
            const product = products.find((p) => p.id === i.productId);
            const price = product?.price ? Number(product.price) : 0;
            return sum + price * i.quantity;
        }, 0);
        // Crear pedido
        const pedido = await client_1.default.pedido.create({
            data: {
                table,
                total,
                isClosed: false,
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
        // Restar stock
        for (const i of items) {
            const product = products.find((p) => p.id === i.productId);
            if (product) {
                const newStock = Math.max(0, product.stock - i.quantity);
                await client_1.default.product.update({
                    where: { id: product.id },
                    data: { stock: newStock },
                });
            }
        }
        res.json(pedido);
    }
    catch (error) {
        console.error("❌ Error al crear pedido:", error);
        res.status(500).json({ error: "Error al crear pedido" });
    }
});
// 📋 Listar pedidos
router.get("/", async (_req, res) => {
    try {
        const pedidos = await client_1.default.pedido.findMany({
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: "desc" },
        });
        res.json(pedidos);
    }
    catch (error) {
        console.error("❌ Error al obtener pedidos:", error);
        res.status(500).json({ error: "Error al obtener pedidos" });
    }
});
// ➕ Agregar productos a un pedido abierto
router.patch("/:id/add-item", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { items } = req.body;
        const pedido = await client_1.default.pedido.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!pedido || pedido.isClosed) {
            return res.status(400).json({ error: "Pedido no encontrado o ya cerrado" });
        }
        const products = await client_1.default.product.findMany({
            where: { id: { in: items.map((i) => i.productId) } },
        });
        let totalExtra = 0;
        for (const i of items) {
            const product = products.find((p) => p.id === i.productId);
            if (!product)
                continue;
            if (product.stock < i.quantity) {
                return res
                    .status(400)
                    .json({ error: `Stock insuficiente para ${product.name}. Solo quedan ${product.stock}` });
            }
            const price = product.price ? Number(product.price) : 0;
            totalExtra += price * i.quantity;
            await client_1.default.orderItem.create({
                data: {
                    orderId: id,
                    productId: i.productId,
                    quantity: i.quantity,
                    subtotal: price * i.quantity,
                },
            });
            await client_1.default.product.update({
                where: { id: product.id },
                data: { stock: Math.max(0, product.stock - i.quantity) },
            });
        }
        // Actualizar total
        const updated = await client_1.default.pedido.update({
            where: { id },
            data: { total: pedido.total.toNumber() + totalExtra },
            include: { items: { include: { product: true } } },
        });
        res.json(updated);
    }
    catch (error) {
        console.error("❌ Error al agregar productos al pedido:", error);
        res.status(500).json({ error: "Error al agregar productos al pedido" });
    }
});
// 💰 Cerrar pedido con propina
router.patch("/:id/close", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { tip } = req.body;
        const pedido = await client_1.default.pedido.findUnique({ where: { id } });
        if (!pedido)
            return res.status(404).json({ error: "Pedido no encontrado" });
        if (pedido.isClosed)
            return res.status(400).json({ error: "Pedido ya cerrado" });
        const tipValue = tip ? Number(tip) : 0;
        const updated = await client_1.default.pedido.update({
            where: { id },
            data: {
                isClosed: true,
                tip: tipValue,
                total: pedido.total.toNumber() + tipValue,
            },
            include: { items: { include: { product: true } } },
        });
        res.json(updated);
    }
    catch (error) {
        console.error("❌ Error al cerrar pedido:", error);
        res.status(500).json({ error: "Error al cerrar pedido" });
    }
});
// 🗑️ Eliminar pedido (y restaurar stock)
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const pedido = await client_1.default.pedido.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!pedido)
            return res.status(404).json({ error: "Pedido no encontrado" });
        for (const item of pedido.items) {
            const product = await client_1.default.product.findUnique({ where: { id: item.productId } });
            if (product) {
                await client_1.default.product.update({
                    where: { id: product.id },
                    data: { stock: Number(product.stock) + item.quantity },
                });
            }
        }
        await client_1.default.orderItem.deleteMany({ where: { orderId: id } });
        await client_1.default.pedido.delete({ where: { id } });
        res.json({ message: `Pedido #${id} eliminado y stock restaurado ✅` });
    }
    catch (error) {
        console.error("❌ Error al eliminar pedido:", error);
        res.status(500).json({ error: "Error al eliminar pedido" });
    }
});
router.post("/cierre-dia", async (_req, res) => {
    try {
        // Fecha actual (inicio y fin del día)
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        // Obtener pedidos cerrados del día
        const pedidosCerrados = await client_1.default.pedido.findMany({
            where: {
                isClosed: true,
                createdAt: {
                    gte: start,
                    lte: end,
                },
            },
        });
        if (pedidosCerrados.length === 0) {
            return res.status(400).json({ error: "No hay pedidos cerrados hoy." });
        }
        // Calcular totales
        const totalVentas = pedidosCerrados.reduce((sum, p) => sum + Number(p.total), 0);
        const totalPropinas = pedidosCerrados.reduce((sum, p) => sum + (p.tip ? Number(p.tip) : 0), 0);
        // Guardar en la base de datos
        const cierre = await client_1.default.cierreDiario.create({
            data: {
                totalVentas,
                totalPropinas,
                pedidosCerrados: pedidosCerrados.length,
            },
        });
        res.json(cierre);
    }
    catch (error) {
        console.error("❌ Error al generar cierre diario:", error);
        res.status(500).json({ error: "Error al generar cierre diario" });
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map