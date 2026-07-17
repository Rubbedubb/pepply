-- Idempotent non-personal seed data for local development.

insert into public.products (key, name, description, price_minor, currency, interval, active)
values (
  'premium-monthly',
  'Pepply Premium',
  'Fördjupad personalisering, fler teman och utökad historik.',
  1900,
  'SEK',
  'month',
  true
)
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description,
  price_minor = excluded.price_minor,
  active = excluded.active;

insert into public.achievements (key, title, description, icon_key)
values
  ('first-evening', 'Första kvällen', 'Du gav dig själv en lugn minut.', 'moon'),
  ('three-returns', 'Tre lugna minuter', 'Du kom tillbaka tre gånger.', 'sparkles'),
  ('week-returned', 'En vecka där du kom tillbaka', 'Inte perfekt. Närvarande.', 'rotate-ccw'),
  ('goal-step', 'Ett mål tog ett steg framåt', 'Ett litet steg räknas.', 'goal')
on conflict (key) do nothing;

insert into public.professional_messages (id, title, content, category, reviewer, published)
values
  ('30000000-0000-4000-8000-000000000001', 'När du dömer dig själv hårt', 'Det är möjligt att du kunde ha gjort mer. Det betyder inte att det du faktiskt gjorde var värdelöst.', 'självkänsla', 'Pepplys redaktion', true),
  ('30000000-0000-4000-8000-000000000002', 'När allt känns olöst', 'Det som hände i dag behöver inte lösas innan du somnar.', 'stress', 'Pepplys redaktion', true),
  ('30000000-0000-4000-8000-000000000003', 'När koncentrationen tog slut', 'En trött hjärna är inte ett bevis på dålig disciplin. Pausen kan vara det som gör nästa försök möjligt.', 'studier', 'Pepplys redaktion', true),
  ('30000000-0000-4000-8000-000000000004', 'När passet inte blev som tänkt', 'Ett svagt pass raderar inte arbetet du redan lagt ned. Kroppen får ha dagar när den inte svarar som du vill.', 'träning', 'Pepplys redaktion', true),
  ('30000000-0000-4000-8000-000000000005', 'Att komma tillbaka', 'Ibland är framsteg bara att komma tillbaka efter att man tappat rytmen.', 'vardagsmotivation', 'Pepplys redaktion', true),
  ('30000000-0000-4000-8000-000000000006', 'När ett samtal stannat kvar', 'Du behöver inte skriva om hela samtalet i huvudet i kväll. Det får vara ofärdigt tills du har mer kraft.', 'relationer', 'Pepplys redaktion', true)
on conflict (id) do update set
  title = excluded.title,
  content = excluded.content,
  category = excluded.category,
  published = excluded.published;

insert into public.prompt_versions (key, version, system_prompt, style_guide, active, activated_at)
values (
  'ritual-sv',
  '1.1.0',
  'Se versionshanterad prompt i src/lib/ai/prompts.ts. Synkronisera den granskade texten vid driftsättning.',
  'Varm, jordnära, ingen toxisk positivitet, inga diagnoser eller relationsersättande formuleringar.',
  true,
  now()
)
on conflict (key, version) do nothing;

insert into public.feature_flags (key, enabled, description)
values
  ('ai_chat', true, 'Sekundär, begränsad reflektionschatt.'),
  ('community', true, 'Förhandsmoderade användarbidrag.'),
  ('advertising', false, 'Diskreta, icke-beteenderiktade annonser.'),
  ('premium_checkout', false, 'Aktiveras efter betalnings- och juridisk granskning.')
on conflict (key) do update set enabled = excluded.enabled, description = excluded.description;

insert into public.advertisers (id, name, status)
values ('40000000-0000-4000-8000-000000000001', 'Bokhörnan', 'active')
on conflict (id) do nothing;

insert into public.advertisements (
  id, advertiser_id, name, body, destination_url, starts_at, ends_at, status
)
values (
  '20000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000001',
  'Sensommarkvällar',
  'Lugn läsning för sensommarkvällar',
  'https://example.com',
  now(),
  now() + interval '30 days',
  'draft'
)
on conflict (id) do nothing;
