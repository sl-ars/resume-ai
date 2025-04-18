from django.contrib import admin
from .models import Resume

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    """
    Admin panel configuration for Resume model.
    """
    model = Resume
    list_display = ('title', 'user', 'status', 'visibility', 'created_at', 'updated_at')
    list_filter = ('status', 'visibility', 'created_at')
    search_fields = ('title', 'user__email', 'user__first_name', 'user__last_name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'original_filename')

    fieldsets = (
        (None, {
            'fields': ('user', 'title', 'file', 'file_type', 'original_filename')
        }),
        ('Status & Visibility', {
            'fields': ('status', 'visibility')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )