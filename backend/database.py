from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGODB_URI, DB_NAME

# MongoDB client
client = AsyncIOMotorClient(MONGODB_URI)
db = client[DB_NAME]

# Collections
media_collection = db["media"]
files_collection = db["files"]

# Indexes
async def create_indexes():
    # Create text index for search
    await media_collection.create_index([
        ("title", "text"),
        ("plot", "text"),
        ("genres", "text"),
        ("original_filename", "text")
    ])
    
    # Create index for slug (unique)
    await media_collection.create_index("slug", unique=True)
    
    # Create index for file_id (unique)
    await files_collection.create_index("file_id", unique=True)
    
    # Create index for media_id (for faster lookups)
    await files_collection.create_index("media_id")