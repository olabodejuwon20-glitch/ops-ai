
-- Replace overly permissive anon policy with one that requires name
DROP POLICY "Anyone can submit leads" ON public.leads;
CREATE POLICY "Anon can submit leads with name" ON public.leads
  FOR INSERT TO anon
  WITH CHECK (name IS NOT NULL AND length(name) > 0);
