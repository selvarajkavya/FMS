# Generated by Django 5.1.1 on 2024-12-04 17:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0002_remove_savings_due_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='savings',
            name='due_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]
