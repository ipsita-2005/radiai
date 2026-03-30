"""
MongoDB Database Configuration and Connection
Using Motor for async MongoDB operations
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi

# MongoDB Atlas connection string
# Store this in environment variable MONGODB_URI
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
DB_NAME = "ashwini_radiology"

class Database:
    client: AsyncIOMotorClient = None
    database = None

db = Database()

async def connect_to_database():
    """Initialize MongoDB connection"""
    try:
        # Create client with server API configuration
        db.client = AsyncIOMotorClient(
            MONGODB_URI,
            server_api=ServerApi('1')
        )
        
        # Ping the server to verify connection
        await db.client.admin.command('ping')
        print("Successfully connected to MongoDB Atlas")
        
        # Get database instance
        db.database = db.client[DB_NAME]
        return db.database
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise

async def get_database():
    """Get database instance"""
    if db.database is None:
        await connect_to_database()
    return db.database

async def close_database_connection():
    """Close MongoDB connection"""
    if db.client:
        db.client.close()
        print("MongoDB connection closed")

def get_collection(collection_name: str):
    """Get a specific collection from the database"""
    if db.database is None:
        raise RuntimeError("Database not connected. Call connect_to_database() first.")
    return db.database[collection_name]
