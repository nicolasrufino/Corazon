import os

from dotenv import load_dotenv
from pymongo import MongoClient
from supabase import create_client, Client

load_dotenv()

# Supabase
SUPABASE_URL: str = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY: str = os.environ["SUPABASE_SERVICE_KEY"]
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# MongoDB
MONGODB_URI: str = os.environ["MONGODB_URI"]
mongo_client: MongoClient = MongoClient(MONGODB_URI)
db = mongo_client.get_default_database()
