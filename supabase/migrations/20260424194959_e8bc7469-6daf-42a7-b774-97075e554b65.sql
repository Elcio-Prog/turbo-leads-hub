-- =========================================
-- ENUMS
-- =========================================
CREATE TYPE public.app_role AS ENUM ('admin', 'aprovador', 'usuario', 'usuario_ra');
CREATE TYPE public.contrato_tipo AS ENUM ('CLT', 'PJ');
CREATE TYPE public.setor_tipo AS ENUM (
  'GT','BACK OFFICE','COMERCIAL','COMPRAS','FINANCEIRO','IMPLANTAÇÃO',
  'LOGÍSTICA','MANUTENÇÃO','MARKETING','NOC','NT TECH','O&M',
  'PROCESSO E QUALIDADE','PROJETOS','TI'
);
CREATE TYPE public.produto_tipo AS ENUM (
  'Conectividade','Wifi','Firewall','Switch','Backup','VOZ'
);
CREATE TYPE public.status_indicacao AS ENUM (
  'Indicado','Qualificado','Desqualificado','Reunião agendada',
  'Reunião realizada','Proposta em análise','Contrato assinado','Venda perdida'
);

-- =========================================
-- TIMESTAMP TRIGGER FUNCTION
-- =========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================
-- PROFILES
-- =========================================
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  contrato public.contrato_tipo NOT NULL DEFAULT 'CLT',
  setor public.setor_tipo NOT NULL DEFAULT 'COMERCIAL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- USER ROLES (separate table for security)
-- =========================================
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- =========================================
-- INDICACOES
-- =========================================
CREATE TABLE public.indicacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status public.status_indicacao NOT NULL DEFAULT 'Indicado',
  lead_nome TEXT NOT NULL,
  empresa TEXT NOT NULL,
  telefone TEXT NOT NULL DEFAULT '',
  email_lead TEXT NOT NULL DEFAULT '',
  produto public.produto_tipo NOT NULL,
  email_indicador TEXT NOT NULL,
  setor public.setor_tipo NOT NULL,
  funcao TEXT NOT NULL DEFAULT '',
  contrato public.contrato_tipo NOT NULL,
  observacao TEXT NOT NULL DEFAULT '',
  criado_por_id UUID NOT NULL,
  criado_por_nome TEXT NOT NULL,
  modificado_por_nome TEXT NOT NULL,
  recompensa_paga BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.indicacoes ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_indicacoes_updated_at
BEFORE UPDATE ON public.indicacoes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_indicacoes_criado_por ON public.indicacoes(criado_por_id);
CREATE INDEX idx_indicacoes_status ON public.indicacoes(status);

-- =========================================
-- CONTATOS
-- =========================================
CREATE TABLE public.contatos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  cnpj TEXT NOT NULL DEFAULT '',
  razao_social TEXT NOT NULL DEFAULT '',
  nome_fantasia TEXT NOT NULL DEFAULT '',
  telefone_fixo TEXT NOT NULL DEFAULT '',
  celular TEXT NOT NULL DEFAULT '',
  criado_por_id UUID NOT NULL,
  criado_por_nome TEXT NOT NULL,
  modificado_por_nome TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contatos ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_contatos_updated_at
BEFORE UPDATE ON public.contatos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_contatos_criado_por ON public.contatos(criado_por_id);

-- =========================================
-- RLS POLICIES — PROFILES
-- =========================================
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- RLS POLICIES — USER_ROLES
-- =========================================
CREATE POLICY "Authenticated users can view roles"
ON public.user_roles FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- RLS POLICIES — INDICACOES
-- =========================================
CREATE POLICY "Authenticated users can view all indicacoes"
ON public.indicacoes FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Authenticated users can create indicacoes"
ON public.indicacoes FOR INSERT
TO authenticated WITH CHECK (auth.uid() = criado_por_id);

CREATE POLICY "Author, approvers and admins can update indicacoes"
ON public.indicacoes FOR UPDATE
TO authenticated USING (
  auth.uid() = criado_por_id
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'aprovador')
);

CREATE POLICY "Author and admins can delete indicacoes"
ON public.indicacoes FOR DELETE
TO authenticated USING (
  auth.uid() = criado_por_id
  OR public.has_role(auth.uid(), 'admin')
);

-- =========================================
-- RLS POLICIES — CONTATOS
-- =========================================
CREATE POLICY "Authenticated users can view all contatos"
ON public.contatos FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Authenticated users can create contatos"
ON public.contatos FOR INSERT
TO authenticated WITH CHECK (auth.uid() = criado_por_id);

CREATE POLICY "Author, approvers and admins can update contatos"
ON public.contatos FOR UPDATE
TO authenticated USING (
  auth.uid() = criado_por_id
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'aprovador')
);

CREATE POLICY "Author and admins can delete contatos"
ON public.contatos FOR DELETE
TO authenticated USING (
  auth.uid() = criado_por_id
  OR public.has_role(auth.uid(), 'admin')
);

-- =========================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, contrato, setor)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'contrato')::public.contrato_tipo, 'CLT'),
    COALESCE((NEW.raw_user_meta_data ->> 'setor')::public.setor_tipo, 'COMERCIAL')
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'usuario');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();