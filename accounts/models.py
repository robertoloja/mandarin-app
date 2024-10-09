from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser): #TODO: Finish
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)