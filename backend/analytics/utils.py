import uuid
import logging
from analytics.models import LogEntry

logger = logging.getLogger(__name__)


def log_action(
        user=None,
        object_type: str = "",
        object_id: uuid.UUID = None,
        action: str = "",
        message: str = ""
):
    """
    Create a log entry for an action performed by a user on an object.

    Args:
        user: Django User instance (optional).
        object_type (str): Type of the object involved (e.g., 'resume', 'job', 'user').
        object_id (UUID, optional): UUID of the object.
        action (str): Action type (use LogEntry.ActionType).
        message (str): Human-readable description.
    """
    try:
        user_id = None
        if user:
            if hasattr(user, 'id'):
                user_id = user.id
            else:
                logger.warning(f"User object passed to log_action without id: {user}")

        LogEntry.objects.create(
            user_id=user_id,
            object_type=object_type,
            object_id=object_id,
            action=action,
            message=message,
        )
        logger.info(f"Action logged: {action} for {object_type} {object_id} by user {user_id}")

    except Exception as e:
        logger.error(f"Failed to log action: {str(e)}")