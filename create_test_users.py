#!/usr/bin/env python
"""
Helper script to create test users for frontend localization testing.
Usage:
    python manage.py shell < create_test_users.py
Or:
    python create_test_users.py (from Django shell)
"""

from accounts.models import MandoBotUser
from django.contrib.auth import get_user_model

User = get_user_model()

def create_test_user(email, username, language, password="testpass123"):
    """Create or update a test user with specified language."""
    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            'username': username,
            'user_language': language,
            'pronunciation_preference': 'pinyin_acc',
            'theme_preference': 'light'
        }
    )
    
    if created:
        user.set_password(password)
        user.save()
        status = "✅ Created"
    else:
        # Update existing user to ensure correct language
        user.user_language = language
        user.save()
        status = "✅ Updated"
    
    return user, status

# Create English test user
en_user, en_status = create_test_user(
    email='english_test@example.com',
    username='english_test',
    language='en'
)
print(f"{en_status} English user:")
print(f"  Email: english_test@example.com")
print(f"  Password: testpass123")
print(f"  Language: {en_user.user_language}")
print()

# Create German test user
de_user, de_status = create_test_user(
    email='german_test@example.com',
    username='german_test',
    language='de'
)
print(f"{de_status} German user:")
print(f"  Email: german_test@example.com")
print(f"  Password: testpass123")
print(f"  Language: {de_user.user_language}")
print()

# Verify both users exist
en_count = User.objects.filter(user_language='en').count()
de_count = User.objects.filter(user_language='de').count()
print(f"Total users by language:")
print(f"  English (en): {en_count}")
print(f"  German (de): {de_count}")
