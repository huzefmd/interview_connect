-- Add verification columns to employer_profiles
ALTER TABLE public.employer_profiles ADD COLUMN id_proof_url text;
ALTER TABLE public.employer_profiles ADD COLUMN verified boolean NOT NULL DEFAULT false;
