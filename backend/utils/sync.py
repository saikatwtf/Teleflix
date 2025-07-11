import asyncio
import os
import logging
from typing import Dict, Any, List
from pyrogram import Client
from pyrogram.types import Message
from bson.objectid import ObjectId
from datetime import datetime

# Configure logging
logger = logging.getLogger(__name__)

from config import TELEGRAM_API_ID, TELEGRAM_API_HASH, BOT_TOKENS, CHANNEL_ID
from database import media_collection, files_collection
from utils.parser import parse_filename
from utils.imdb import search_imdb
from models.media import MediaType

class TelegramSync:
    def __init__(self):
        self.app = Client(
            "teleflix_bot",
            api_id=TELEGRAM_API_ID,
            api_hash=TELEGRAM_API_HASH,
            workdir="./session"
        )
        self.bots = []
        self.bot_count = len(BOT_TOKENS)
        self.current_bot_index = 0
    
    async def initialize(self):
        """Initialize Telegram client and bots"""
        await self.app.start()
        
        # Initialize bots
        for token in BOT_TOKENS:
            if token and token.strip():
                bot = Client(
                    f"teleflix_download_bot_{len(self.bots)}",
                    api_id=TELEGRAM_API_ID,
                    api_hash=TELEGRAM_API_HASH,
                    bot_token=token,
                    workdir="./session"
                )
                await bot.start()
                self.bots.append(bot)
        
        logger.info(f"Initialized {len(self.bots)} download bots")
    
    async def stop(self):
        """Stop Telegram client and bots"""
        await self.app.stop()
        for bot in self.bots:
            await bot.stop()
    
    def get_next_bot_index(self):
        """Get next bot index for load balancing"""
        index = self.current_bot_index
        self.current_bot_index = (self.current_bot_index + 1) % self.bot_count
        return index
    
    async def process_message(self, message: Message):
        """Process a Telegram message and store media info"""
        if not message.media:
            return
        
        # Extract file information
        if message.document:
            file_id = message.document.file_id
            file_size = message.document.file_size
            filename = message.document.file_name
        elif message.video:
            file_id = message.video.file_id
            file_size = message.video.file_size
            filename = message.video.file_name
        else:
            return  # Unsupported media type
        
        # Check if file already exists
        existing_file = await files_collection.find_one({"file_id": file_id})
        if existing_file:
            logger.debug(f"File already exists: {filename}")
            return
        
        # Parse filename
        parsed = parse_filename(filename)
        
        # Get IMDb metadata
        imdb_data = await search_imdb(
            parsed["title"], 
            parsed["year"], 
            parsed["media_type"]
        )
        
        if not imdb_data:
            logger.warning(f"No IMDb data found for: {filename}")
            # Create basic metadata without IMDb
            media_id = str(ObjectId())
            media_data = {
                "_id": media_id,
                "title": parsed["title"],
                "slug": parsed["title"].lower().replace(" ", "-"),
                "media_type": parsed["media_type"],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "original_filename": filename
            }
        else:
            # Check if media already exists by IMDb ID
            existing_media = await media_collection.find_one({"imdb_id": imdb_data["imdb_id"]})
            
            if existing_media:
                media_id = existing_media["_id"]
                media_data = existing_media
            else:
                # Create new media entry
                media_id = str(ObjectId())
                media_data = {
                    "_id": media_id,
                    "title": imdb_data["title"],
                    "slug": imdb_data["slug"],
                    "media_type": parsed["media_type"],
                    "imdb_id": imdb_data["imdb_id"],
                    "poster": imdb_data["poster"],
                    "plot": imdb_data["plot"],
                    "rating": imdb_data["rating"],
                    "genres": imdb_data["genres"],
                    "release_year": imdb_data["release_year"],
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "original_filename": filename
                }
        
        # Create file info
        file_info = {
            "file_id": file_id,
            "file_size": file_size,
            "quality": parsed["quality"],
            "source": parsed["source"],
            "format": parsed["format"],
            "bot_index": self.get_next_bot_index(),
            "media_id": media_id
        }
        
        # Update media based on type
        if parsed["media_type"] == "movie":
            # For movies, add file directly to media
            if "files" not in media_data:
                media_data["files"] = []
            
            media_data["files"].append(file_info)
            
        elif parsed["media_type"] in ["series", "anime"]:
            # For series/anime, organize by season and episode
            season_num = parsed["season"] or 1
            episode_num = parsed["episode"] or 1
            
            if "seasons" not in media_data:
                media_data["seasons"] = {}
                
            if str(season_num) not in media_data["seasons"]:
                media_data["seasons"][str(season_num)] = {
                    "season_number": season_num,
                    "episodes": {}
                }
                
            if str(episode_num) not in media_data["seasons"][str(season_num)]["episodes"]:
                media_data["seasons"][str(season_num)]["episodes"][str(episode_num)] = {
                    "episode_number": episode_num,
                    "files": []
                }
            
            media_data["seasons"][str(season_num)]["episodes"][str(episode_num)]["files"].append(file_info)
        
        # Update media in database
        await media_collection.update_one(
            {"_id": media_id},
            {"$set": media_data},
            upsert=True
        )
        
        # Store file info
        await files_collection.insert_one(file_info)
        
        logger.info(f"Processed: {filename}")
    
    async def sync_channel(self, limit: int = 100):
        """Sync messages from the channel"""
        try:
            async for message in self.app.get_chat_history(CHANNEL_ID, limit=limit):
                await self.process_message(message)
        except Exception as e:
            logger.error(f"Error syncing channel: {e}")
    
    async def listen(self):
        """Listen for new messages in the channel"""
        @self.app.on_message(filters=lambda _, m: m.chat.id == CHANNEL_ID)
        async def on_message(client, message):
            await self.process_message(message)
        
        # Start the client
        await self.app.idle()

# Create singleton instance
telegram_sync = TelegramSync()

async def initialize_sync():
    await telegram_sync.initialize()

async def sync_channel(limit: int = 100):
    await telegram_sync.sync_channel(limit)

async def start_listening():
    await telegram_sync.listen()

async def stop_sync():
    await telegram_sync.stop()