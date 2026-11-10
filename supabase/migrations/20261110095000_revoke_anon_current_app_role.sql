-- current_app_role() is an authenticated role helper, not a public RPC.
-- It remains executable by authenticated callers because trusted RPCs use it
-- after resolving auth.uid(); anonymous callers do not need this capability.

revoke execute on function public.current_app_role() from anon;
