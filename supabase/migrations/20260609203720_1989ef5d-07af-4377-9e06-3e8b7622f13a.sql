
-- Recria o trigger que cria profile + role automaticamente em novos signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill: cria profiles para usuários auth que não têm
INSERT INTO public.profiles (user_id, name, email, login_identifier, ra, cpf, funcao, contrato, setor)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data ->> 'name', split_part(u.email, '@', 1)),
  u.email,
  lower(trim(COALESCE(u.raw_user_meta_data ->> 'login_identifier', u.email))),
  NULLIF(trim(COALESCE(u.raw_user_meta_data ->> 'ra', '')), ''),
  NULLIF(trim(COALESCE(u.raw_user_meta_data ->> 'cpf', '')), ''),
  COALESCE(u.raw_user_meta_data ->> 'funcao', ''),
  COALESCE((u.raw_user_meta_data ->> 'contrato')::public.contrato_tipo, 'CLT'),
  COALESCE((u.raw_user_meta_data ->> 'setor')::public.setor_tipo, 'COMERCIAL')
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.id IS NULL;

-- Backfill: cria role padrão para usuários sem role
INSERT INTO public.user_roles (user_id, role)
SELECT
  u.id,
  CASE
    WHEN NULLIF(trim(COALESCE(u.raw_user_meta_data ->> 'ra', '')), '') IS NOT NULL
      THEN 'usuario_ra'::public.app_role
    ELSE 'usuario'::public.app_role
  END
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE ur.id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;
