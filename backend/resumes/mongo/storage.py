"""
MongoDB storage layer for resumes.
Handles CRUD operations for resume contents and resume analysis.
"""

from core.mongodb import MongoDBClient
from uuid import UUID
from typing import Optional, Dict

# Initialize collections
resume_content_collection = MongoDBClient.get_collection("resume_contents")
resume_analysis_collection = MongoDBClient.get_collection("resume_analysis")


# ========== Resume Content Operations ==========

def insert_resume_content(data: dict) -> UUID:
    """
    Insert parsed resume content into MongoDB.
    Uses resume_id as the _id field to ensure a single document per resume.

    Args:
        data (dict): Resume content data.

    Returns:
        UUID: Inserted document ID (resume_id).
    """
    if "resume_id" not in data:
        raise ValueError("resume_id is required")

    # Ensure resume_id is a string UUID
    resume_id = str(data["resume_id"])
    data["_id"] = resume_id  # MongoDB requires string for _id
    
    # If user_id is present, ensure it's stored as an integer
    if "user_id" in data:
        data["user_id"] = int(data["user_id"])

    resume_content_collection.replace_one(
        {"_id": resume_id},
        data,
        upsert=True
    )

    return UUID(resume_id)


def get_resume_content_by_resume_id(resume_id: str) -> Optional[Dict]:
    """
    Retrieve parsed resume content by associated Resume ID.

    Args:
        resume_id (str): ID of the related resume.

    Returns:
        Optional[dict]: Resume content document, or None if not found.
    """
    return resume_content_collection.find_one({"_id": str(resume_id)})


def update_resume_content(resume_id: str, updates: dict) -> None:
    """
    Update resume content document.

    Args:
        resume_id (str): ID of the related resume.
        updates (dict): Fields to update.
    """
    updates.pop("_id", None)  # Safely remove _id if present
    
    # If user_id is in updates, ensure it's an integer
    if "user_id" in updates:
        updates["user_id"] = int(updates["user_id"])

    resume_content_collection.update_one(
        {"_id": str(resume_id)},
        {"$set": updates}
    )


# ========== Resume Analysis Operations ==========

def insert_resume_analysis(data: dict) -> UUID:
    """
    Insert resume analysis results into MongoDB.
    Uses resume_id as the _id field to ensure a single document per resume.

    Args:
        data (dict): Resume analysis data.

    Returns:
        UUID: Inserted document ID (resume_id).
    """
    if "resume_id" not in data:
        raise ValueError("resume_id is required")

    # Ensure resume_id is a string UUID
    resume_id = str(data["resume_id"])
    data["_id"] = resume_id
    
    # If user_id is present, ensure it's stored as an integer
    if "user_id" in data:
        data["user_id"] = int(data["user_id"])

    resume_analysis_collection.replace_one(
        {"_id": resume_id},
        data,
        upsert=True
    )

    return UUID(resume_id)


def get_resume_analysis_by_resume_id(resume_id: str) -> Optional[Dict]:
    """
    Retrieve resume analysis results by associated Resume ID.

    Args:
        resume_id (str): ID of the related resume.

    Returns:
        Optional[dict]: Resume analysis document, or None if not found.
    """
    return resume_analysis_collection.find_one({"_id": str(resume_id)})


def update_resume_analysis(resume_id: str, updates: dict) -> None:
    """
    Update resume analysis document.

    Args:
        resume_id (str): ID of the related resume.
        updates (dict): Fields to update.
    """
    updates.pop("_id", None)
    
    # If user_id is in updates, ensure it's an integer
    if "user_id" in updates:
        updates["user_id"] = int(updates["user_id"])

    resume_analysis_collection.update_one(
        {"_id": str(resume_id)},
        {"$set": updates}
    )