import os

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

# Supabase
SUPABASE_URL: str = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY: str = os.environ["SUPABASE_SERVICE_KEY"]
RESOURCES_TABLE: str = os.getenv("SUPABASE_RESOURCES_TABLE", "resources")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
