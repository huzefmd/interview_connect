REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.current_role_name() FROM anon;
REVOKE EXECUTE ON FUNCTION public.owns_job(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.student_university(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_interview_participant(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;