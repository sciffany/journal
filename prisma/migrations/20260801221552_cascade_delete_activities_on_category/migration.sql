-- AlterForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_category_id_fkey";

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "activity_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
