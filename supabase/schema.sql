-- Cafe Pin 스키마. Supabase SQL Editor 에 그대로 붙여 실행한다.
-- 다인용 전제: 모든 행에 user_id 가 붙고, RLS 가 "자기 것만"을 강제한다.

create table public.cafes (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  address text not null default '',
  district text not null default '',
  latitude double precision not null,
  longitude double precision not null,
  photo_url text not null default '',
  -- Storage 오브젝트 경로. 삭제·교체 때 이걸로 파일을 지운다
  photo_path text not null default '',
  atmosphere text[] not null default '{}',
  memo text not null default '',
  visited_at date not null,
  created_at timestamptz not null default now()
);

alter table public.cafes enable row level security;

create policy "own_rows" on public.cafes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create index cafes_user_idx on public.cafes (user_id, visited_at desc);

-- 사진 버킷. public: 읽기는 URL 로 공개(경로가 UUID 라 추측 불가),
-- 쓰기·삭제는 자기 폴더({user_id}/...)에만 허용한다.
insert into storage.buckets (id, name, public)
values ('cafe-photos', 'cafe-photos', true)
on conflict (id) do nothing;

create policy "photos_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'cafe-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "photos_update_own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'cafe-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "photos_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'cafe-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
