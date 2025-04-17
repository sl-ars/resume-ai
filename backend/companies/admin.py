from django.contrib import admin
from .models import Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'website', 'created_at', 'updated_at')
    search_fields = ('name', 'description')
    list_filter = ('created_at',)
    filter_horizontal = ('recruiters',)
    ordering = ('name',)

    readonly_fields = ('created_at', 'updated_at')