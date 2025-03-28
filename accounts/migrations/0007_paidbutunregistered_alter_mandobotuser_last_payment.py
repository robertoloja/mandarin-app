# Generated by Django 5.1.4 on 2025-01-19 11:07

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0006_mandobotuser_last_payment_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="PaidButUnregistered",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("registration_id", models.CharField(max_length=20)),
                ("user_email", models.TextField()),
            ],
        ),
        migrations.AlterField(
            model_name="mandobotuser",
            name="last_payment",
            field=models.DateField(default=django.utils.timezone.now),
        ),
    ]
