-- Keep the authenticated application workflow while removing inherited
-- PUBLIC/anon EXECUTE access to the SECURITY DEFINER token-consumption RPC.
-- The function validates auth.uid() internally and is called by the authenticated
-- consume-repertorization-token Edge Function with the user's JWT.
REVOKE ALL ON FUNCTION public.consume_repertorization_token(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_repertorization_token(uuid) TO authenticated;
