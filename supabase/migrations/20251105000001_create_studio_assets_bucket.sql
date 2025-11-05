-- Create studio-assets bucket (private for security)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'studio-assets',
  'studio-assets',
  false, -- Private bucket, use signed URLs
  104857600, -- 100MB limit
  array['image/*', 'video/*', 'audio/*']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 104857600,
  allowed_mime_types = array['image/*', 'video/*', 'audio/*'];

-- Drop existing policies if any
drop policy if exists "Authenticated users can upload studio assets" on storage.objects;
drop policy if exists "Users can read own studio assets" on storage.objects;
drop policy if exists "Users can update own studio assets" on storage.objects;
drop policy if exists "Users can delete own studio assets" on storage.objects;

-- Policy 1: Authenticated users can upload to their own folder
create policy "Authenticated users can upload studio assets"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'studio-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can read their own files
create policy "Users can read own studio assets"
on storage.objects for select
to authenticated
using (
  bucket_id = 'studio-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Users can update their own files
create policy "Users can update own studio assets"
on storage.objects for update
to authenticated
using (
  bucket_id = 'studio-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'studio-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Users can delete their own files
create policy "Users can delete own studio assets"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'studio-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);
