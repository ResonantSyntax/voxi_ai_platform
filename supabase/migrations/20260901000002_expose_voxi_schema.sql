-- PostgREST exposes only `public` and `graphql_public` by default, so every
-- query against voxi.* 404s until this runs. Without it the clients look
-- broken for reasons nothing in the code explains.
alter role authenticator set pgrst.db_schemas = 'public, graphql_public, voxi';
notify pgrst, 'reload config';
