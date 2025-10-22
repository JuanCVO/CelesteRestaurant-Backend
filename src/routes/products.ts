import { Router } from "express";
import prisma from "../prisma/client";

const router = Router();


router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, category, price, stock } = req.body;
    const product = await prisma.product.create({
      data: { name, category, price: Number(price), stock: Number(stock) },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: "Error al crear producto" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock } = req.body;

    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: { name, category, price: Number(price), stock: Number(stock) },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

export default router;
