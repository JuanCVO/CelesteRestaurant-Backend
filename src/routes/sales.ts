import { Router } from "express";
import prisma from "../prisma/client";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({ include: { product: true } });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener ventas" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    const qty = Number(quantity);
    if (product.stock < qty) return res.status(400).json({ error: "Stock insuficiente" });

    const total = Number(product.price) * qty;

    const sale = await prisma.$transaction(async (tx) => {
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
  } catch (error) {
    res.status(500).json({ error: "Error al registrar venta" });
  }
});

export default router;
