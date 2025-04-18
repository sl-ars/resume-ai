from django.contrib import admin
from .models import LogEntry

@admin.register(LogEntry)
class LogEntryAdmin(admin.ModelAdmin):
    """
    Admin panel configuration for LogEntry model.
    """
    model = LogEntry
    list_display = ('timestamp', 'user_id', 'object_type', 'object_id', 'action', 'message')
    list_filter = ('action', 'object_type', 'timestamp')
    search_fields = ('user_id', 'object_type', 'object_id', 'message')
    ordering = ('-timestamp',)
    readonly_fields = ('id', 'timestamp')