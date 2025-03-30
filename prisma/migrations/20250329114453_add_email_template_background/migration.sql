-- CreateTable
CREATE TABLE "EmailTemplateBackground" (
    "id" TEXT NOT NULL,
    "bodyBgColor" TEXT NOT NULL DEFAULT '#D9D9D9',
    "containerBgColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "headerBgColor" TEXT NOT NULL DEFAULT '#2b8fbe',
    "contentBgColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "footerBgColor" TEXT NOT NULL DEFAULT '#2b8fbe',
    "maxWidth" TEXT NOT NULL DEFAULT '650px',
    "emailTemplateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplateBackground_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplateBackground_emailTemplateId_key" ON "EmailTemplateBackground"("emailTemplateId");

-- AddForeignKey
ALTER TABLE "EmailTemplateBackground" ADD CONSTRAINT "EmailTemplateBackground_emailTemplateId_fkey" FOREIGN KEY ("emailTemplateId") REFERENCES "EmailTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
