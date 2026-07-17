-- Pepply initial PostgreSQL schema
-- Target: Supabase PostgreSQL 15+

create extension if not exists pgcrypto;

create type public.app_role as enum ('user', 'moderator', 'admin');
create type public.safety_level as enum ('none', 'concern', 'urgent');
create type public.message_source as enum ('ai', 'fallback', 'professional', 'community');
create type public.goal_status as enum ('active', 'paused', 'completed', 'archived');
create type public.content_status as enum ('pending', 'approved', 'rejected', 'disabled');
create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'expired');
create type public.ad_status as enum ('draft', 'scheduled', 'active', 'paused', 'ended');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'suspended', 'deleted')),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid primary key references public.users(id) on delete cascade,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  display_name text check (char_length(display_name) between 1 and 60),
  locale text not null default 'sv-SE',
  timezone text not null default 'Europe/Stockholm',
  birth_year smallint check (birth_year between 1900 and extract(year from now())::int),
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_preferences (
  user_id uuid primary key references public.users(id) on delete cascade,
  support_areas text[] not null default array['vardagsmotivation']::text[],
  tone text not null default 'lugn och mjuk',
  message_length text not null default 'kort' check (message_length in ('kort', 'utvecklad')),
  reminder_time time not null default '21:30',
  reminders_enabled boolean not null default false,
  streaks_enabled boolean not null default true,
  personal_history_enabled boolean not null default true,
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  consent_type text not null,
  document_version text not null,
  granted boolean not null,
  ip_country_code char(2),
  user_agent_family text,
  created_at timestamptz not null default now()
);

create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  question text not null check (char_length(question) <= 160),
  mood_label text not null check (char_length(mood_label) <= 40),
  mood_score smallint check (mood_score between 1 and 5),
  note text check (char_length(note) <= 600),
  safety_level public.safety_level not null default 'none',
  created_at timestamptz not null default now()
);
comment on column public.check_ins.note is 'Sensitive free text. Null after 90 days by retention job unless legal hold applies.';

create table public.rituals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  check_in_id uuid references public.check_ins(id) on delete set null,
  status text not null default 'started' check (status in ('started', 'completed', 'abandoned')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, id)
);

create table public.generated_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  ritual_id uuid references public.rituals(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 1200),
  source public.message_source not null,
  provider text,
  model text,
  prompt_version text not null,
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  safety_level public.safety_level not null default 'none',
  disabled_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.message_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  message_id uuid not null references public.generated_messages(id) on delete cascade,
  helpful boolean not null,
  tone_adjustment text check (char_length(tone_adjustment) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, message_id)
);

create table public.saved_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  generated_message_id uuid references public.generated_messages(id) on delete cascade,
  community_message_id uuid,
  professional_message_id uuid,
  created_at timestamptz not null default now(),
  check (num_nonnulls(generated_message_id, community_message_id, professional_message_id) = 1)
);
create unique index saved_generated_unique on public.saved_messages (user_id, generated_message_id) where generated_message_id is not null;
create unique index saved_community_unique on public.saved_messages (user_id, community_message_id) where community_message_id is not null;
create unique index saved_professional_unique on public.saved_messages (user_id, professional_message_id) where professional_message_id is not null;

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 120),
  description text check (char_length(description) <= 500),
  category text not null,
  start_date date not null default current_date,
  end_date date,
  frequency text check (char_length(frequency) <= 80),
  status public.goal_status not null default 'active',
  private_notes text check (char_length(private_notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

create table public.goal_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  position smallint not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.goal_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,
  value numeric(8,2) not null default 1,
  note text check (char_length(note) <= 500),
  recorded_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.streaks (
  user_id uuid primary key references public.users(id) on delete cascade,
  current_count integer not null default 0 check (current_count >= 0),
  longest_count integer not null default 0 check (longest_count >= 0),
  last_completed_on date,
  grace_days_used integer not null default 0 check (grace_days_used >= 0),
  updated_at timestamptz not null default now()
);

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  description text not null,
  icon_key text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);

create table public.community_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  content text not null check (char_length(content) between 20 and 500),
  category text not null,
  attribution text not null default 'anonymous' check (attribution in ('anonymous', 'display_name')),
  rights_confirmed boolean not null check (rights_confirmed = true),
  status public.content_status not null default 'pending',
  moderated_by uuid references public.users(id) on delete set null,
  moderated_at timestamptz,
  moderation_reason text check (char_length(moderation_reason) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.community_messages (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid unique references public.community_submissions(id) on delete set null,
  author_user_id uuid references public.users(id) on delete set null,
  content text not null check (char_length(content) between 20 and 500),
  category text not null,
  attribution text not null default 'anonymous' check (attribution in ('anonymous', 'display_name')),
  published boolean not null default false,
  disabled_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.professional_messages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null check (char_length(content) between 20 and 1000),
  category text not null,
  locale text not null default 'sv-SE',
  reviewer text,
  published boolean not null default false,
  disabled_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.saved_messages
  add constraint saved_messages_community_fk foreign key (community_message_id) references public.community_messages(id) on delete cascade,
  add constraint saved_messages_professional_fk foreign key (professional_message_id) references public.professional_messages(id) on delete cascade;

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references public.users(id) on delete cascade,
  target_type text not null check (target_type in ('generated_message', 'community_message', 'advertisement')),
  target_id uuid not null,
  reason text not null check (char_length(reason) between 3 and 500),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.moderation_cases (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references public.community_submissions(id) on delete cascade,
  report_id uuid references public.reports(id) on delete cascade,
  assigned_to uuid references public.users(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved')),
  automated_flags text[] not null default '{}',
  decision text,
  notes text check (char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(submission_id, report_id) >= 1)
);

create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null default 'Reflektion' check (char_length(title) <= 120),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null check (char_length(content) between 1 and 3000),
  safety_level public.safety_level not null default 'none',
  created_at timestamptz not null default now()
);
comment on table public.ai_conversation_messages is 'Sensitive free text. Default retention 30 days unless explicitly preserved by a future save feature.';

create table public.products (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  price_minor integer not null check (price_minor >= 0),
  currency char(3) not null default 'SEK',
  interval text not null default 'month' check (interval in ('month', 'year', 'one_time')),
  active boolean not null default true,
  provider_price_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id),
  status public.subscription_status not null,
  provider text not null,
  provider_customer_id text,
  provider_subscription_id text unique,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.advertisers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization_number text,
  contact_email text,
  status text not null default 'active' check (status in ('active', 'paused', 'blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.advertisements (
  id uuid primary key default gen_random_uuid(),
  advertiser_id uuid not null references public.advertisers(id) on delete cascade,
  name text not null,
  label text not null default 'Annons',
  image_url text,
  body text not null check (char_length(body) <= 160),
  destination_url text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.ad_status not null default 'draft',
  approved_by uuid references public.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.advertisement_impressions (
  id bigint generated always as identity primary key,
  advertisement_id uuid not null references public.advertisements(id) on delete cascade,
  occurred_on date not null default current_date,
  created_at timestamptz not null default now()
);
comment on table public.advertisement_impressions is 'No mood, free text, category, user id, IP, or psychological targeting fields are permitted.';

create table public.advertisement_clicks (
  id bigint generated always as identity primary key,
  advertisement_id uuid not null references public.advertisements(id) on delete cascade,
  occurred_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  kind text not null,
  title text not null check (char_length(title) <= 120),
  body text not null check (char_length(body) <= 300),
  scheduled_for timestamptz,
  sent_at timestamptz,
  read_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references public.users(id) on delete set null,
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
comment on table public.audit_logs is 'Never write raw ritual or chat content. Administrative security log; default retention 24 months.';

create table public.prompt_versions (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  version text not null,
  locale text not null default 'sv-SE',
  system_prompt text not null,
  style_guide text,
  active boolean not null default false,
  created_by uuid references public.users(id) on delete set null,
  approved_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  unique (key, version)
);

create table public.safety_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  check_in_id uuid references public.check_ins(id) on delete set null,
  conversation_message_id uuid references public.ai_conversation_messages(id) on delete set null,
  level public.safety_level not null check (level <> 'none'),
  reason_codes text[] not null default '{}',
  resource_set text not null,
  reviewer_status text not null default 'not_required' check (reviewer_status in ('not_required', 'queued', 'reviewed')),
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
comment on table public.safety_events is 'Highly sensitive. Store reason codes, not full user text. Strict role access and 12-month default retention.';

create table public.rate_limits (
  key text not null,
  action text not null,
  window_started_at timestamptz not null,
  count integer not null default 0 check (count >= 0),
  primary key (key, action, window_started_at)
);

create table public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text,
  updated_by uuid references public.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- Query indexes
create index check_ins_user_created_idx on public.check_ins (user_id, created_at desc);
create index rituals_user_created_idx on public.rituals (user_id, created_at desc);
create index rituals_user_completed_idx on public.rituals (user_id, completed_at desc) where status = 'completed';
create index generated_messages_user_created_idx on public.generated_messages (user_id, created_at desc);
create index generated_messages_ritual_idx on public.generated_messages (ritual_id);
create index goals_user_status_idx on public.goals (user_id, status, created_at desc);
create index goal_steps_goal_position_idx on public.goal_steps (goal_id, position);
create index goal_progress_goal_date_idx on public.goal_progress (goal_id, recorded_on desc);
create index community_submissions_status_created_idx on public.community_submissions (status, created_at);
create index community_messages_category_idx on public.community_messages (category, created_at desc) where published and disabled_at is null;
create index reports_status_created_idx on public.reports (status, created_at);
create index moderation_cases_status_created_idx on public.moderation_cases (status, created_at);
create index ai_conversations_user_created_idx on public.ai_conversations (user_id, created_at desc);
create index ai_messages_conversation_created_idx on public.ai_conversation_messages (conversation_id, created_at);
create index subscriptions_user_status_idx on public.subscriptions (user_id, status);
create index advertisements_active_window_idx on public.advertisements (status, starts_at, ends_at);
create index ad_impressions_ad_date_idx on public.advertisement_impressions (advertisement_id, occurred_on);
create index ad_clicks_ad_date_idx on public.advertisement_clicks (advertisement_id, occurred_on);
create index notifications_user_scheduled_idx on public.notifications (user_id, scheduled_for) where sent_at is null and canceled_at is null;
create index audit_logs_actor_created_idx on public.audit_logs (actor_user_id, created_at desc);
create index audit_logs_target_idx on public.audit_logs (target_type, target_id, created_at desc);
create index safety_events_level_created_idx on public.safety_events (level, created_at desc);
create index safety_events_user_created_idx on public.safety_events (user_id, created_at desc);
create index consent_user_type_idx on public.consent_records (user_id, consent_type, created_at desc);

-- Generic updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'users','user_roles','user_profiles','user_preferences','message_feedback',
    'goals','goal_steps','community_submissions','professional_messages',
    'moderation_cases','ai_conversations','products','subscriptions','advertisers',
    'advertisements'
  ]
  loop
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name, table_name
    );
  end loop;
end;
$$;

-- Provision minimal public user rows when Supabase Auth creates a user.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id) values (new.id);
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  insert into public.user_profiles (user_id, display_name)
    values (new.id, nullif(left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 60), ''));
  insert into public.user_preferences (user_id) values (new.id);
  insert into public.streaks (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
