"""
MongoDB connection utility for centralized and efficient access using pymongo.
Production-ready version.
"""

from pymongo import MongoClient
from bson.codec_options import UuidRepresentation
from django.conf import settings
import os


class MongoDBClient:
    """
    Singleton class for managing MongoDB client and database connections.
    """

    _client = None
    _db = None

    @classmethod
    def get_client(cls) -> MongoClient:
        """
        Get or create a MongoClient instance.

        Returns:
            MongoClient: Active MongoDB client.
        """
        if cls._client is None:
            uri = getattr(settings, 'MONGODB_URI', os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/'))
            ssl = getattr(settings, 'MONGODB_SSL', False)

            cls._client = MongoClient(
                uri,
                ssl=ssl,
                uuidRepresentation='standard',
                serverSelectionTimeoutMS=5000  # Fail fast if server not reachable
            )
        return cls._client

    @classmethod
    def get_db(cls):
        """
        Get or create the MongoDB database instance.

        Returns:
            Database: MongoDB database object.
        """
        if cls._db is None:
            db_name = getattr(settings, 'MONGODB_DB', os.environ.get('MONGODB_DB', 'resume_ai_mongodb'))
            cls._db = cls.get_client()[db_name]
        return cls._db

    @classmethod
    def get_collection(cls, collection_name: str):
        """
        Get a specific collection from the database.

        Args:
            collection_name (str): Name of the MongoDB collection.

        Returns:
            Collection: MongoDB collection object.
        """
        db = cls.get_db()
        return db[collection_name]