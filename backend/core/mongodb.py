"""
MongoDB connection utility for direct access to MongoDB using pymongo.
"""

import os
from pymongo import MongoClient
from django.conf import settings


def get_mongodb_client():
    """
    Get MongoDB client instance.
    
    Returns:
        pymongo.MongoClient: MongoDB client instance.
    """
    # Get settings from Django or environment variables
    uri = getattr(settings, 'MONGODB_URI', os.environ.get('MONGODB_HOST', 'mongodb://localhost:27017/'))
    ssl = getattr(settings, 'MONGODB_SSL', False)
    
    # Create MongoDB client with options
    return MongoClient(uri, ssl=ssl)


def get_mongodb_database():
    """
    Get MongoDB database instance.
    
    Returns:
        pymongo.database.Database: MongoDB database instance.
    """
    client = get_mongodb_client()
    db_name = getattr(settings, 'MONGODB_DB', os.environ.get('MONGODB_DB', 'resume_ai_mongodb'))
    return client[db_name]


def get_mongodb_collection(collection_name):
    """
    Get MongoDB collection by name.
    
    Args:
        collection_name (str): Name of the collection.
        
    Returns:
        pymongo.collection.Collection: MongoDB collection.
    """
    db = get_mongodb_database()
    return db[collection_name] 