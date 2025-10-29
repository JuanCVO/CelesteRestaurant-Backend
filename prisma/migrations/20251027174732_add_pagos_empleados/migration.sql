-- CreateTable
CREATE TABLE "pagos_empleados" (
    "id" SERIAL NOT NULL,
    "empleadoId" INTEGER NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "fechaPago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descripcion" TEXT,

    CONSTRAINT "pagos_empleados_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pagos_empleados" ADD CONSTRAINT "pagos_empleados_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
