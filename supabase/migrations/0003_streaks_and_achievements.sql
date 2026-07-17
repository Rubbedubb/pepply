-- Server-owned streak and milestone updates. Clients only receive SELECT access
-- to these tables, so ritual writes cannot forge a streak value directly.

create or replace function public.record_completed_ritual()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  user_timezone text := 'Europe/Stockholm';
  ritual_day date;
  previous_day date;
  previous_count integer := 0;
  next_count integer := 1;
begin
  select coalesce(timezone, 'Europe/Stockholm')
    into user_timezone
  from public.user_profiles
  where user_id = new.user_id;

  ritual_day := (
    coalesce(new.completed_at, new.created_at, now()) at time zone user_timezone
  )::date;

  insert into public.streaks (user_id)
  values (new.user_id)
  on conflict (user_id) do nothing;

  select last_completed_on, current_count
    into previous_day, previous_count
  from public.streaks
  where user_id = new.user_id
  for update;

  -- Several completed rituals on the same local date count as one return.
  if previous_day = ritual_day then
    return new;
  end if;

  if previous_day = ritual_day - 1 then
    next_count := previous_count + 1;
  end if;

  update public.streaks
  set
    current_count = next_count,
    longest_count = greatest(longest_count, next_count),
    last_completed_on = ritual_day
  where user_id = new.user_id;

  insert into public.user_achievements (user_id, achievement_id)
  select new.user_id, achievement.id
  from public.achievements as achievement
  where
    achievement.active
    and (
      achievement.key = 'first-evening'
      or (achievement.key = 'three-returns' and next_count >= 3)
      or (achievement.key = 'week-returned' and next_count >= 7)
    )
  on conflict (user_id, achievement_id) do nothing;

  return new;
end;
$$;

drop trigger if exists ritual_streak_after_insert on public.rituals;
create trigger ritual_streak_after_insert
  after insert on public.rituals
  for each row
  when (new.status = 'completed')
  execute function public.record_completed_ritual();

drop trigger if exists ritual_streak_after_update on public.rituals;
create trigger ritual_streak_after_update
  after update of status, completed_at on public.rituals
  for each row
  when (
    new.status = 'completed'
    and (
      old.status is distinct from new.status
      or old.completed_at is distinct from new.completed_at
    )
  )
  execute function public.record_completed_ritual();

create or replace function public.award_goal_step_achievement()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.user_achievements (user_id, achievement_id)
  select new.user_id, achievement.id
  from public.achievements as achievement
  where achievement.key = 'goal-step' and achievement.active
  on conflict (user_id, achievement_id) do nothing;

  return new;
end;
$$;

drop trigger if exists goal_step_achievement_after_update on public.goal_steps;
create trigger goal_step_achievement_after_update
  after update of completed_at on public.goal_steps
  for each row
  when (old.completed_at is null and new.completed_at is not null)
  execute function public.award_goal_step_achievement();

revoke all on function public.record_completed_ritual() from public;
revoke all on function public.award_goal_step_achievement() from public;
