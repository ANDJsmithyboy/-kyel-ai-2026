import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
url = os.getenv('DATABASE_URL')
if not url:
    print('DATABASE_URL not found')
    exit(1)

# fix URL for sync engine if it uses asyncpg
url = url.replace('+asyncpg', '')

try:
    engine = create_engine(url, connect_args={'sslmode': 'require'})
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """))
        tables = [row[0] for row in result.fetchall()]
        print('ACTUAL TABLE COUNT FROM MIGRATIONS:', len(tables))
        print('TABLES:')
        for t in tables:
            print(f' - {t}')
except Exception as e:
    print("Error:", e)
