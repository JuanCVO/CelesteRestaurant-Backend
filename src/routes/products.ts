import { Router } from "express";
import prisma from "../prisma/client";
import { adminOnly } from "../middleware/auth";

const router = Router();


router.get("/", async (_req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch {
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

router.post("/", adminOnly, async (req, res) => {
  try {
    const { name, category, price, stock } = req.body;
    const product = await prisma.product.create({
      data: { name, category, price: Number(price), stock: Number(stock) },
    });
    res.status(201).json(product);
  } catch {
    res.status(500).json({ error: "Error al crear producto" });
  }
});


router.get("/public", async (_req, res) => {
  console.log("🟢 [GET] /api/products/public llamado");
  console.log("Headers:", _req.headers);
  try {
    const products = await prisma.product.findMany({
      where: { stock: { gt: 0 } },
    });
    res.json(products);
  } catch {
    res.status(500).json({ error: "Error al obtener productos" });
  }
});


router.put("/:id", adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock } = req.body;
    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: { name, category, price: Number(price), stock: Number(stock) },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

router.delete("/:id", adminOnly, async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "Producto eliminado" });
  } catch {
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

export default router;
