-- Public editorial presentation metadata.
alter table public.articles
  add column hero_image_url text,
  add column hero_image_alt text,
  add column hero_image_credit text,
  add column reading_time_minutes integer;

alter table public.articles
  add constraint articles_reading_time_positive
  check (reading_time_minutes is null or reading_time_minutes > 0);

grant select (
  hero_image_url,
  hero_image_alt,
  hero_image_credit,
  reading_time_minutes
) on public.articles to anon;
