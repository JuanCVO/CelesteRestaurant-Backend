-- CreateTable
CREATE TABLE "CierreDiario" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalVentas" DECIMAL(10,2) NOT NULL,
    "totalPropinas" DECIMAL(10,2) NOT NULL,
    "pedidosCerrados" INTEGER NOT NULL,

    CONSTRAINT "CierreDiario_pkey" PRIMARY KEY ("id")
);
