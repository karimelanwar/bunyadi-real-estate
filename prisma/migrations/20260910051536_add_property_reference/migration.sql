-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "reference" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Property_reference_key" ON "Property"("reference");

-- Start the sequence at 1001 so the first property reads "BRE-1001" rather
-- than the less official-looking "BRE-1". Existing rows (if any) are
-- renumbered in order of creation so references stay unique and increasing.
DO $$
DECLARE
  seq_name text;
BEGIN
  SELECT pg_get_serial_sequence('"Property"', 'reference') INTO seq_name;

  WITH ordered AS (
    SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt") AS rn
    FROM "Property"
  )
  UPDATE "Property" p
  SET "reference" = 1000 + ordered.rn
  FROM ordered
  WHERE p."id" = ordered."id";

  EXECUTE format('ALTER SEQUENCE %s RESTART WITH %s', seq_name, (SELECT COALESCE(MAX("reference"), 1000) + 1 FROM "Property"));
END $$;
