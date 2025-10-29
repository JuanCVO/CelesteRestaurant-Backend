import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, adminOnly } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

/**
 * 🧾 Obtener todos los pagos (solo ADMIN)
 */
router.get("/", authMiddleware, adminOnly, async (_req: Request, res: Response) => {
  try {
    const pagos = await prisma.pagoEmpleado.findMany({
      include: { empleado: true },
      orderBy: { fechaPago: "desc" },
    });
    res.json(pagos);
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    res.status(500).json({ error: "Error al obtener pagos de empleados" });
  }
});

/**
 * 💰 Registrar un pago (solo ADMIN)
 */
router.post("/", authMiddleware, adminOnly, async (req: Request, res: Response) => {
  const { empleadoId, monto, descripcion } = req.body;

  if (!empleadoId || !monto)
    return res.status(400).json({ error: "empleadoId y monto son obligatorios" });

  try {
    const empleado = await prisma.user.findUnique({ where: { id: Number(empleadoId) } });
    if (!empleado) return res.status(404).json({ error: "Empleado no encontrado" });

    const pago = await prisma.pagoEmpleado.create({
      data: {
        empleadoId: Number(empleadoId),
        monto: Number(monto),
        descripcion,
      },
    });

    res.status(201).json(pago);
  } catch (error) {
    console.error("Error al registrar pago:", error);
    res.status(500).json({ error: "Error al registrar pago" });
  }
});

/**
 * 🧍‍♂️ Pagos de un empleado específico (ADMIN o el mismo empleado)
 */
router.get("/:empleadoId", authMiddleware, async (req: Request, res: Response) => {
  const { empleadoId } = req.params;
  const user = (req as any).user;

  // Permitir si es ADMIN o si el empleado consulta su propio historial
  if (user.role !== "ADMIN" && user.id !== Number(empleadoId))
    return res.status(403).json({ error: "No autorizado para ver estos pagos" });

  try {
    const pagos = await prisma.pagoEmpleado.findMany({
      where: { empleadoId: Number(empleadoId) },
      include: { empleado: true },
      orderBy: { fechaPago: "desc" },
    });
    res.json(pagos);
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    res.status(500).json({ error: "Error al obtener pagos del empleado" });
  }
});

/**
 * 🗑️ Eliminar un pago (solo ADMIN)
 */
router.delete("/:id", authMiddleware, adminOnly, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.pagoEmpleado.delete({ where: { id: Number(id) } });
    res.json({ message: "Pago eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar pago:", error);
    res.status(500).json({ error: "Error al eliminar pago" });
  }
});

export default router;
