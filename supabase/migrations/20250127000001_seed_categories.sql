-- Seed Categories for Mezzo Aid LMS
-- Categories aligned with the 9 Quests entrepreneurship journey
-- From Ideation to Investment Readiness

INSERT INTO categories (name) VALUES
  ('Ideation & Planning'),           -- Quest I: Planting the Seed
  ('Market Research & Validation'),  -- Quest II: Understanding Your Market
  ('Business Model Development'),    -- Quest III: Building Your Model
  ('Financial Planning'),            -- Quest IV: Money Matters
  ('Legal & Compliance'),            -- Quest V: Legal Foundations
  ('Product/Service Development'),   -- Quest VI: Building Your Offering
  ('Marketing & Sales'),             -- Quest VII: Go-to-Market
  ('Operations & Management'),       -- Quest VIII: Running the Business
  ('Investment Readiness')           -- Quest IX: Securing Funding
ON CONFLICT DO NOTHING;