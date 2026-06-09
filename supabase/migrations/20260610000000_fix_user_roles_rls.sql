-- CORREÇÃO: RLS da tabela user_roles
-- 
-- Problema 1: A política "FOR ALL" incluía SELECT, impedindo usuários comuns de
--             lerem sua própria role → fallback para "usuario" no frontend.
-- Problema 2: A política restrita "user_id = auth.uid()" impedia admins de
--             buscarem todos os usuários na tela de Gestão.

-- 1. Remover políticas antigas relacionadas a SELECT/ALL em user_roles
DROP POLICY IF EXISTS "Authenticated users can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins and Approvers can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins and Approvers can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins and Approvers can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins and Approvers can delete roles" ON public.user_roles;

-- 2. SELECT: usuário lê a própria role; admin e aprovador leem todas
CREATE POLICY "Select own role or admin"
ON public.user_roles FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'aprovador')
);

-- 3. INSERT restrito a admins/aprovadores
CREATE POLICY "Admins and Approvers can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'aprovador')
);

-- 4. UPDATE restrito a admins/aprovadores
CREATE POLICY "Admins and Approvers can update roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'aprovador')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'aprovador')
);

-- 5. DELETE restrito a admins/aprovadores
CREATE POLICY "Admins and Approvers can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'aprovador')
);
