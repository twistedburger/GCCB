ALTER TABLE "event" ADD COLUMN IF NOT EXISTS "reported" INTEGER DEFAULT 0;
ALTER TABLE "route" ADD COLUMN IF NOT EXISTS "reported" INTEGER DEFAULT 0;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "reported" INTEGER DEFAULT 0;

ALTER TABLE "report" ADD COLUMN IF NOT EXISTS "rejection_reason" VARCHAR(50);
ALTER TABLE "report" ADD COLUMN IF NOT EXISTS "rejection_detail" VARCHAR(100);
ALTER TABLE "report" ADD COLUMN IF NOT EXISTS "report_target" VARCHAR(10);
ALTER TABLE "report" ADD COLUMN IF NOT EXISTS "target_id" INTEGER;

-- Remove junction tables. Move information from junction tables to report table if the junction tables exist.
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'report_user') THEN
    UPDATE report r SET report_target = 'user', target_id = ru.user_id FROM report_user ru WHERE ru.report_id = r.id;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'report_event') THEN
    UPDATE report r SET report_target = 'event', target_id = re.event_id FROM report_event re WHERE re.report_id = r.id;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'report_route') THEN
    UPDATE report r SET report_target = 'route', target_id = rr.route_id FROM report_route rr WHERE rr.report_id = r.id;
  END IF;
END $$;

DROP TABLE IF EXISTS report_event;
DROP TABLE IF EXISTS report_route;
DROP TABLE IF EXISTS report_route;