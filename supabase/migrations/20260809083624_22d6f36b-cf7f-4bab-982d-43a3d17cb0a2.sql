-- ROLES
CREATE TYPE public.app_role AS ENUM ('student','university','employer');
CREATE TYPE public.application_status AS ENUM ('applied','shortlisted','selected','rejected','on_hold');
CREATE TYPE public.interview_status AS ENUM ('scheduled','in_progress','completed','cancelled');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.current_role_name()
RETURNS public.app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can claim their own role" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed in users can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- auto-create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email)
  ON CONFLICT (id) DO NOTHING;

  BEGIN
    _role := (NEW.raw_user_meta_data->>'role')::public.app_role;
  EXCEPTION WHEN others THEN _role := NULL;
  END;

  IF _role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- UNIVERSITY PROFILES
CREATE TABLE public.university_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  logo_url text,
  accreditation text,
  contact_person text,
  contact_phone text,
  address text,
  website text,
  programs text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.university_profiles TO authenticated;
GRANT SELECT ON public.university_profiles TO anon;
GRANT ALL ON public.university_profiles TO service_role;
ALTER TABLE public.university_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view universities" ON public.university_profiles FOR SELECT USING (true);
CREATE POLICY "University manages own profile insert" ON public.university_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "University manages own profile update" ON public.university_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_univ_updated BEFORE UPDATE ON public.university_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- EMPLOYER PROFILES
CREATE TABLE public.employer_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL DEFAULT '',
  logo_url text,
  industry text,
  website text,
  description text,
  company_size text,
  location text,
  hr_name text,
  hr_email text,
  hr_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.employer_profiles TO authenticated;
GRANT SELECT ON public.employer_profiles TO anon;
GRANT ALL ON public.employer_profiles TO service_role;
ALTER TABLE public.employer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view employers" ON public.employer_profiles FOR SELECT USING (true);
CREATE POLICY "Employer inserts own profile" ON public.employer_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Employer updates own profile" ON public.employer_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_emp_updated BEFORE UPDATE ON public.employer_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- STUDENT PROFILES
CREATE TABLE public.student_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  date_of_birth date,
  headline text,
  location text,
  university_id uuid REFERENCES public.university_profiles(user_id) ON DELETE SET NULL,
  skills text[] NOT NULL DEFAULT '{}',
  interests text[] NOT NULL DEFAULT '{}',
  certifications text[] NOT NULL DEFAULT '{}',
  resume_url text,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.student_profiles TO authenticated;
GRANT ALL ON public.student_profiles TO service_role;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed in users can view students" ON public.student_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Student inserts own profile" ON public.student_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Student updates own profile" ON public.student_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "University verifies its students" ON public.student_profiles FOR UPDATE TO authenticated USING (university_id = auth.uid()) WITH CHECK (university_id = auth.uid());
CREATE TRIGGER trg_student_updated BEFORE UPDATE ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- EDUCATION
CREATE TABLE public.education_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  degree text NOT NULL,
  institution text NOT NULL,
  year text,
  grade text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.education_entries TO authenticated;
GRANT ALL ON public.education_entries TO service_role;
ALTER TABLE public.education_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed in users can view education" ON public.education_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Student manages own education" ON public.education_entries FOR ALL TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

-- JOBS
CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  location text,
  job_type text NOT NULL DEFAULT 'Full-time',
  ctc text,
  skills text[] NOT NULL DEFAULT '{}',
  deadline date,
  is_open boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT SELECT ON public.jobs TO anon;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Employer manages own jobs" ON public.jobs FOR ALL TO authenticated USING (auth.uid() = employer_id) WITH CHECK (auth.uid() = employer_id);
CREATE TRIGGER trg_jobs_updated BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.owns_job(_job_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.jobs WHERE id = _job_id AND employer_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.student_university(_student_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT university_id FROM public.student_profiles WHERE user_id = _student_id;
$$;

-- APPLICATIONS
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.application_status NOT NULL DEFAULT 'applied',
  cover_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Student views own applications" ON public.applications FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Employer views applications to own jobs" ON public.applications FOR SELECT TO authenticated USING (public.owns_job(job_id, auth.uid()));
CREATE POLICY "University views its students applications" ON public.applications FOR SELECT TO authenticated USING (public.student_university(student_id) = auth.uid());
CREATE POLICY "Student applies" ON public.applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Student withdraws" ON public.applications FOR DELETE TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Employer updates application status" ON public.applications FOR UPDATE TO authenticated USING (public.owns_job(job_id, auth.uid())) WITH CHECK (public.owns_job(job_id, auth.uid()));
CREATE TRIGGER trg_apps_updated BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- INTERVIEWS
CREATE TABLE public.interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES public.applications(id) ON DELETE SET NULL,
  employer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  room_id uuid NOT NULL DEFAULT gen_random_uuid(),
  status public.interview_status NOT NULL DEFAULT 'scheduled',
  notes text,
  feedback text,
  rating integer,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interviews TO authenticated;
GRANT ALL ON public.interviews TO service_role;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view interviews" ON public.interviews FOR SELECT TO authenticated
  USING (auth.uid() = employer_id OR auth.uid() = student_id OR public.student_university(student_id) = auth.uid());
CREATE POLICY "Employer schedules interviews" ON public.interviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = employer_id);
CREATE POLICY "Participants update interviews" ON public.interviews FOR UPDATE TO authenticated
  USING (auth.uid() = employer_id OR auth.uid() = student_id)
  WITH CHECK (auth.uid() = employer_id OR auth.uid() = student_id);
CREATE POLICY "Employer cancels interviews" ON public.interviews FOR DELETE TO authenticated USING (auth.uid() = employer_id);
CREATE TRIGGER trg_interviews_updated BEFORE UPDATE ON public.interviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.is_interview_participant(_interview_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.interviews WHERE id = _interview_id AND (employer_id = _user_id OR student_id = _user_id));
$$;

-- INTERVIEW CHAT
CREATE TABLE public.interview_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.interview_messages TO authenticated;
GRANT ALL ON public.interview_messages TO service_role;
ALTER TABLE public.interview_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read chat" ON public.interview_messages FOR SELECT TO authenticated USING (public.is_interview_participant(interview_id, auth.uid()));
CREATE POLICY "Participants send chat" ON public.interview_messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid() AND public.is_interview_participant(interview_id, auth.uid()));

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Signed in users can notify others" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.interview_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.interviews;

CREATE INDEX idx_applications_job ON public.applications(job_id);
CREATE INDEX idx_applications_student ON public.applications(student_id);
CREATE INDEX idx_jobs_employer ON public.jobs(employer_id);
CREATE INDEX idx_interviews_student ON public.interviews(student_id);
CREATE INDEX idx_interviews_employer ON public.interviews(employer_id);
CREATE INDEX idx_student_university ON public.student_profiles(university_id);