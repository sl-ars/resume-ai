# Generated by Django 5.2 on 2025-04-17 18:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('jobs', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='application',
            name='is_approved',
            field=models.BooleanField(default=False),
        ),
    ]
