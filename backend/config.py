import os
from dotenv import load_dotenv
from typing import List

# Load environment variables
load_dotenv()

# Telegram configuration
TELEGRAM_API_ID = int(os.getenv("TELEGRAM_API_ID", "0"))
TELEGRAM_API_HASH = os.getenv("TELEGRAM_API_HASH", "")
BOT_TOKENS: List[str] = os.getenv("BOT_TOKENS", "").split(",")
CHANNEL_ID = int(os.getenv("CHANNEL_ID", "0"))

# MongoDB configuration
MONGODB_URI = os.getenv("MONGODB_URI", "")
DB_NAME = "teleflix"

# Site configuration
SITE_PASSWORD = os.getenv("SITE_PASSWORD", "")
BASE_URL = os.getenv("BASE_URL", "http://localhost:3000")

# API configuration
API_PREFIX = "/api"