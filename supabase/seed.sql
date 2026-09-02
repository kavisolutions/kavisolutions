-- Seed: just the team data (no auth users - those are created via API)
insert into team (name, role, initials, gradient, bio, sort_order) values
  ('Kavitha', 'Founder', 'KV', 'from-violet-500 to-purple-500', 'The visionary behind Kavi Solutions — leading the studio with passion and purpose.', 1),
  ('Ashok Kumar', 'Manager', 'AK', 'from-sky-500 to-cyan-500', 'Keeps every project on track — operations, clients and delivery done right.', 2),
  ('Simma Tejeswararao', 'Technical Supporter', 'ST', 'from-emerald-500 to-teal-500', 'Ensures smooth tech operations and provides reliable infrastructure support.', 3),
  ('Sai', 'Marketing Supporter', 'SM', 'from-fuchsia-500 to-pink-500', 'Drives growth through strategic marketing campaigns and brand support.', 4);
