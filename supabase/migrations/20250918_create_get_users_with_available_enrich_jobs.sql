-- Migration: Create get_users_with_available_enrich_jobs function
create or replace function get_users_with_available_enrich_jobs()
returns table(user_id uuid)
language sql as $$
  select user_id
  from leads
  where status = 'scraped'
  group by user_id;
$$;
