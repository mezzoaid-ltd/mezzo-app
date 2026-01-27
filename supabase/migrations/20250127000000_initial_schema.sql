-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE member_role AS ENUM ('ADMIN', 'TEACHER', 'STUDENT');

-- =============================================
-- PROFILES TABLE (replaces Prisma Profile)
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT,
  email TEXT NOT NULL,
  role member_role DEFAULT 'STUDENT' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage categories"
  ON categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'ADMIN'
    )
  );

-- =============================================
-- COURSES TABLE
-- =============================================
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(10, 2),
  is_published BOOLEAN DEFAULT FALSE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for full-text search
CREATE INDEX courses_title_idx ON courses USING GIN (to_tsvector('english', title));
CREATE INDEX courses_category_idx ON courses(category_id);
CREATE INDEX courses_user_idx ON courses(user_id);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT
  USING (is_published = true OR user_id = auth.uid());

CREATE POLICY "Teachers can manage their own courses"
  ON courses FOR ALL
  USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('TEACHER', 'ADMIN')
    )
  );

-- =============================================
-- ATTACHMENTS TABLE
-- =============================================
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX attachments_course_idx ON attachments(course_id);

ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view attachments for published courses"
  ON attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = attachments.course_id 
      AND (courses.is_published = true OR courses.user_id = auth.uid())
    )
  );

CREATE POLICY "Teachers can manage attachments for their courses"
  ON attachments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = attachments.course_id 
      AND courses.user_id = auth.uid()
    )
  );

-- =============================================
-- CHAPTERS TABLE
-- =============================================
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  position INT NOT NULL,
  is_published BOOLEAN DEFAULT FALSE NOT NULL,
  is_free BOOLEAN DEFAULT FALSE NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX chapters_course_idx ON chapters(course_id);
CREATE INDEX chapters_position_idx ON chapters(course_id, position);

ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published chapters"
  ON chapters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = chapters.course_id 
      AND (courses.is_published = true OR courses.user_id = auth.uid())
    )
  );

CREATE POLICY "Teachers can manage chapters for their courses"
  ON chapters FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = chapters.course_id 
      AND courses.user_id = auth.uid()
    )
  );

-- =============================================
-- MUX DATA TABLE (Video Processing)
-- =============================================
CREATE TABLE mux_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id TEXT NOT NULL,
  playback_id TEXT,
  chapter_id UUID UNIQUE NOT NULL REFERENCES chapters(id) ON DELETE CASCADE
);

ALTER TABLE mux_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view mux data for accessible chapters"
  ON mux_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chapters
      JOIN courses ON courses.id = chapters.course_id
      WHERE chapters.id = mux_data.chapter_id 
      AND (courses.is_published = true OR courses.user_id = auth.uid())
    )
  );

CREATE POLICY "Teachers can manage mux data for their courses"
  ON mux_data FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM chapters
      JOIN courses ON courses.id = chapters.course_id
      WHERE chapters.id = mux_data.chapter_id 
      AND courses.user_id = auth.uid()
    )
  );

-- =============================================
-- USER PROGRESS TABLE
-- =============================================
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, chapter_id)
);

CREATE INDEX user_progress_chapter_idx ON user_progress(chapter_id);
CREATE INDEX user_progress_user_idx ON user_progress(user_id);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own progress"
  ON user_progress FOR ALL
  USING (user_id = auth.uid());

-- =============================================
-- PURCHASES TABLE
-- =============================================
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, course_id)
);

CREATE INDEX purchases_course_idx ON purchases(course_id);
CREATE INDEX purchases_user_idx ON purchases(user_id);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchases"
  ON purchases FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can create purchases"
  ON purchases FOR INSERT
  WITH CHECK (true);

-- =============================================
-- STRIPE CUSTOMERS TABLE (will be replaced with Paystack)
-- =============================================
CREATE TABLE stripe_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stripe data"
  ON stripe_customers FOR SELECT
  USING (user_id = auth.uid());

-- =============================================
-- LOGGING TABLE
-- =============================================
CREATE TABLE logging (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  method TEXT NOT NULL,
  body TEXT,
  response TEXT,
  status_code INT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE logging ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view logs"
  ON logging FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'ADMIN'
    )
  );

-- =============================================
-- FUNCTIONS: Auto-update updated_at timestamp
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attachments_updated_at BEFORE UPDATE ON attachments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_customers_updated_at BEFORE UPDATE ON stripe_customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTION: Auto-create profile on user signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, image_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();