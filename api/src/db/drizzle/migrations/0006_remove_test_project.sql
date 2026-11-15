-- Remove the placeholder project created while the admin project form was
-- being tested. It predates the portfolio seed and would otherwise appear
-- first on the public /projects page.
DELETE FROM "projects"
WHERE "id" = '964e464b-d461-49ea-8f92-95c584780301'
  AND "name" = 'Project one';
