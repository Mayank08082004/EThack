import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

sql = """
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.news (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title        text NOT NULL,
    description  text,
    content      text,
    image        text,
    link         text NOT NULL UNIQUE,
    source       text NOT NULL,
    genres       text[] NOT NULL DEFAULT '{}',
    embedding    vector(1536),
    published_at timestamptz NOT NULL DEFAULT now(),
    created_at   timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS for security
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Policy: logged in users can read news
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'news' AND policyname = 'Users can read all news'
    ) THEN
        CREATE POLICY "Users can read all news" ON public.news
        FOR SELECT TO authenticated USING (true);
    END IF;
END $$;
"""

if DATABASE_URL:
    engine = create_engine(DATABASE_URL)
    with engine.begin() as conn:
        conn.execute(text(sql))
    print("News table created successfully.")
else:
    print("DATABASE_URL is missing!")
