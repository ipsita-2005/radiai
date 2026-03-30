# Database package initialization
from .connection import (
    connect_to_database,
    get_database,
    close_database_connection,
    get_collection
)

__all__ = [
    "connect_to_database",
    "get_database",
    "close_database_connection",
    "get_collection"
]
