-- Fix infinite recursion in profiles RLS policy by checking user_roles instead of profiles for manager status
-- or using a separate approach that avoids querying profiles inside the profiles policy.

drop policy if exists "Users can view own profile or managers can view all" on public.profiles;

create policy "Users can view own profile or managers can view all"
on public.profiles for select
using (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'manager'
  )
);
