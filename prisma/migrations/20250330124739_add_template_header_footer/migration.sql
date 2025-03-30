-- AlterTable
ALTER TABLE "EmailTemplateBackground" ALTER COLUMN "headerBgColor" SET DEFAULT '#2b8fbe  ';

-- CreateTable
CREATE TABLE "EmailTemplateHeaderFooter" (
    "id" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "emailTemplateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplateHeaderFooter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplateHeaderFooter_emailTemplateId_key" ON "EmailTemplateHeaderFooter"("emailTemplateId");

-- AddForeignKey
ALTER TABLE "EmailTemplateHeaderFooter" ADD CONSTRAINT "EmailTemplateHeaderFooter_emailTemplateId_fkey" FOREIGN KEY ("emailTemplateId") REFERENCES "EmailTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
