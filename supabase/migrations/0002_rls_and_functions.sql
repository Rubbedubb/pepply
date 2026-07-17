-- Row-level security, authorization helpers, rate limiting and retention.

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select role from public.user_roles where user_id = auth.uid()),
    'user'::public.app_role
  );
$$;

revoke all on function public.current_app_role() from public;
grant execute on function public.current_app_role() to authenticated;

alter table public.users enable row level security;
alter table public.user_roles enable row level security;
alter table public.user_profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.consent_records enable row level security;
alter table public.check_ins enable row level security;
alter table public.rituals enable row level security;
alter table public.generated_messages enable row level security;
alter table public.message_feedback enable row level security;
alter table public.saved_messages enable row level security;
alter table public.goals enable row level security;
alter table public.goal_steps enable row level security;
alter table public.goal_progress enable row level security;
alter table public.streaks enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.community_submissions enable row level security;
alter table public.community_messages enable row level security;
alter table public.professional_messages enable row level security;
alter table public.reports enable row level security;
alter table public.moderation_cases enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_conversation_messages enable row level security;
alter table public.products enable row level security;
alter table public.subscriptions enable row level security;
alter table public.advertisers enable row level security;
alter table public.advertisements enable row level security;
alter table public.advertisement_impressions enable row level security;
alter table public.advertisement_clicks enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.prompt_versions enable row level security;
alter table public.safety_events enable row level security;
alter table public.rate_limits enable row level security;
alter table public.feature_flags enable row level security;

-- Own-data helpers. Every mutation remains scoped to auth.uid().
create policy users_select_own on public.users for select to authenticated using (id = auth.uid());
create policy profiles_own on public.user_profiles for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy preferences_own on public.user_preferences for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy consent_own on public.consent_records for select to authenticated using (user_id = auth.uid());
create policy consent_insert_own on public.consent_records for insert to authenticated with check (user_id = auth.uid());
create policy roles_select_own on public.user_roles for select to authenticated using (user_id = auth.uid());

create policy check_ins_own on public.check_ins for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy rituals_own on public.rituals for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy generated_messages_own on public.generated_messages for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy feedback_own on public.message_feedback for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy saved_messages_own on public.saved_messages for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy goals_own on public.goals for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy goal_steps_own on public.goal_steps for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy goal_progress_own on public.goal_progress for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy streaks_own on public.streaks for select to authenticated using (user_id = auth.uid());
create policy user_achievements_own on public.user_achievements for select to authenticated using (user_id = auth.uid());
create policy achievements_read on public.achievements for select to authenticated using (active = true);

create policy submissions_read_own on public.community_submissions for select to authenticated using (user_id = auth.uid());
create policy submissions_insert_own on public.community_submissions for insert to authenticated with check (user_id = auth.uid() and status = 'pending');
create policy submissions_delete_pending_own on public.community_submissions for delete to authenticated using (user_id = auth.uid() and status = 'pending');
create policy community_messages_read on public.community_messages for select to authenticated using (published and disabled_at is null);
create policy professional_messages_read on public.professional_messages for select to authenticated using (published and disabled_at is null);
create policy reports_read_own on public.reports for select to authenticated using (reporter_user_id = auth.uid());
create policy reports_insert_own on public.reports for insert to authenticated with check (reporter_user_id = auth.uid());

create policy ai_conversations_own on public.ai_conversations for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy ai_messages_own on public.ai_conversation_messages for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy subscriptions_own on public.subscriptions for select to authenticated using (user_id = auth.uid());
create policy products_active_read on public.products for select to authenticated using (active = true);
create policy notifications_own on public.notifications for select to authenticated using (user_id = auth.uid());
create policy notifications_update_own on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy safety_events_read_own on public.safety_events for select to authenticated using (user_id = auth.uid());
create policy safety_events_insert_own on public.safety_events for insert to authenticated with check (user_id = auth.uid());

-- Active ads are public to authenticated users; event rows carry no personal identifiers.
create policy advertisements_active_read on public.advertisements for select to authenticated using (
  status = 'active' and starts_at <= now() and ends_at > now() and approved_at is not null
);
create policy ad_impressions_insert on public.advertisement_impressions for insert to authenticated with check (true);
create policy ad_clicks_insert on public.advertisement_clicks for insert to authenticated with check (true);

-- Moderator/admin access. Raw safety text is not stored in safety_events.
create policy roles_admin_manage on public.user_roles for all to authenticated
  using (public.current_app_role() = 'admin')
  with check (public.current_app_role() = 'admin');
create policy submissions_moderator on public.community_submissions for all to authenticated
  using (public.current_app_role() in ('moderator', 'admin'))
  with check (public.current_app_role() in ('moderator', 'admin'));
create policy community_messages_moderator on public.community_messages for all to authenticated
  using (public.current_app_role() in ('moderator', 'admin'))
  with check (public.current_app_role() in ('moderator', 'admin'));
create policy reports_moderator on public.reports for all to authenticated
  using (public.current_app_role() in ('moderator', 'admin'))
  with check (public.current_app_role() in ('moderator', 'admin'));
create policy moderation_cases_moderator on public.moderation_cases for all to authenticated
  using (public.current_app_role() in ('moderator', 'admin'))
  with check (public.current_app_role() in ('moderator', 'admin'));
create policy professional_messages_admin on public.professional_messages for all to authenticated
  using (public.current_app_role() = 'admin')
  with check (public.current_app_role() = 'admin');
create policy safety_events_moderator on public.safety_events for select to authenticated
  using (public.current_app_role() in ('moderator', 'admin'));
create policy safety_events_moderator_update on public.safety_events for update to authenticated
  using (public.current_app_role() in ('moderator', 'admin'))
  with check (public.current_app_role() in ('moderator', 'admin'));

create policy advertisers_admin on public.advertisers for all to authenticated using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');
create policy advertisements_admin on public.advertisements for all to authenticated using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');
create policy ad_impressions_admin_read on public.advertisement_impressions for select to authenticated using (public.current_app_role() = 'admin');
create policy ad_clicks_admin_read on public.advertisement_clicks for select to authenticated using (public.current_app_role() = 'admin');
create policy products_admin on public.products for all to authenticated using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');
create policy subscriptions_admin_read on public.subscriptions for select to authenticated using (public.current_app_role() = 'admin');
create policy audit_admin_read on public.audit_logs for select to authenticated using (public.current_app_role() = 'admin');
create policy audit_moderator_insert on public.audit_logs for insert to authenticated with check (
  actor_user_id = auth.uid() and public.current_app_role() in ('moderator', 'admin')
);
create policy prompts_admin on public.prompt_versions for all to authenticated using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');
create policy flags_admin on public.feature_flags for all to authenticated using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');

-- Atomic, database-backed rate limiting for authenticated calls.
create or replace function public.consume_rate_limit(
  p_key text,
  p_action text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz;
  v_count integer;
begin
  if auth.uid() is null then return false; end if;
  if p_key not like auth.uid()::text || ':%' then return false; end if;
  if p_limit < 1 or p_window_seconds < 1 then return false; end if;

  v_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.rate_limits (key, action, window_started_at, count)
  values (p_key, left(p_action, 80), v_window, 1)
  on conflict (key, action, window_started_at)
  do update set count = public.rate_limits.count + 1
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.consume_rate_limit(text, text, integer, integer) from public;
grant execute on function public.consume_rate_limit(text, text, integer, integer) to authenticated;

-- Retention routine. Run daily via Supabase Cron/pg_cron after legal approval.
create or replace function public.run_retention_jobs()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  chat_deleted integer;
  notes_redacted integer;
  safety_deleted integer;
  audit_deleted integer;
begin
  delete from public.ai_conversation_messages where created_at < now() - interval '30 days';
  get diagnostics chat_deleted = row_count;

  update public.check_ins set note = null
  where note is not null and created_at < now() - interval '90 days';
  get diagnostics notes_redacted = row_count;

  delete from public.safety_events where created_at < now() - interval '12 months';
  get diagnostics safety_deleted = row_count;

  delete from public.audit_logs where created_at < now() - interval '24 months';
  get diagnostics audit_deleted = row_count;

  delete from public.advertisement_impressions where created_at < now() - interval '25 months';
  delete from public.advertisement_clicks where created_at < now() - interval '25 months';
  delete from public.rate_limits where window_started_at < now() - interval '7 days';
  delete from public.notifications where created_at < now() - interval '12 months';

  return jsonb_build_object(
    'chat_messages_deleted', chat_deleted,
    'check_in_notes_redacted', notes_redacted,
    'safety_events_deleted', safety_deleted,
    'audit_logs_deleted', audit_deleted
  );
end;
$$;

revoke all on function public.run_retention_jobs() from public, anon, authenticated;
grant execute on function public.run_retention_jobs() to service_role;
