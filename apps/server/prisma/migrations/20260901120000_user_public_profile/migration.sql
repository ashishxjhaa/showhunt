-- AlterTable
ALTER TABLE "User" ADD COLUMN "username" TEXT,
ADD COLUMN "bio" TEXT,
ADD COLUMN "twitterUrl" TEXT,
ADD COLUMN "githubUrl" TEXT,
ADD COLUMN "portfolioUrl" TEXT,
ADD COLUMN "linkedinUrl" TEXT,
ADD COLUMN "state" TEXT,
ADD COLUMN "techStack" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
