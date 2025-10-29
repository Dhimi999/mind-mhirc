-- Enable RLS on hibrida_enrollments and add policies for participant/admin access

-- Enable Row Level Security
ALTER TABLE public.hibrida_enrollments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own enrollment record
CREATE POLICY "Users can read their own hibrida enrollment" 
ON public.hibrida_enrollments
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow admins and professionals to read all enrollments
CREATE POLICY "Admins and professionals can read all hibrida enrollments" 
ON public.hibrida_enrollments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND (p.is_admin = true OR p.account_type = 'professional')
  )
);

-- Allow users to request enrollment (update their own row to pending and set timestamp)
CREATE POLICY "Users can request hibrida enrollment (update pending)" 
ON public.hibrida_enrollments
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid() AND enrollment_status = 'pending'
);

-- Allow users to insert their own pending enrollment row (for legacy accounts without auto row)
CREATE POLICY "Users can insert their own pending hibrida enrollment" 
ON public.hibrida_enrollments
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND enrollment_status = 'pending'
);

-- Allow admins and professionals to manage enrollments (approve/reject, assign role/group)
CREATE POLICY "Admins and professionals manage hibrida enrollments" 
ON public.hibrida_enrollments
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND (p.is_admin = true OR p.account_type = 'professional')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND (p.is_admin = true OR p.account_type = 'professional')
  )
);
