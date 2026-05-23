CREATE TYPE "ThirdPartyType" AS ENUM ('CLIENTE', 'PROVEEDOR', 'CLIENTE_PROVEEDOR');

CREATE TABLE "ThirdParty" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "type" "ThirdPartyType" NOT NULL,
  "legalName" TEXT NOT NULL,
  "tradeName" TEXT,
  "documentType" TEXT NOT NULL DEFAULT 'CUIT',
  "document" TEXT NOT NULL,
  "taxCondition" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ThirdParty_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ThirdParty_companyId_document_key" ON "ThirdParty"("companyId", "document");
CREATE INDEX "ThirdParty_companyId_type_idx" ON "ThirdParty"("companyId", "type");
CREATE INDEX "ThirdParty_companyId_active_idx" ON "ThirdParty"("companyId", "active");

ALTER TABLE "ThirdParty"
ADD CONSTRAINT "ThirdParty_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
