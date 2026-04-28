from django.core.management.base import BaseCommand
from accounts.models import MandoBotUser
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create test users for frontend German localization testing'

    def handle(self, *args, **options):
        # English test user
        en_user, en_created = User.objects.get_or_create(
            email='english_test@example.com',
            defaults={
                'username': 'english_test',
                'user_language': 'en',
                'pronunciation_preference': 'pinyin_acc',
                'theme_preference': 1  # 1 = light
            }
        )
        if en_created:
            en_user.set_password('testpass123')
            en_user.save()
            self.stdout.write(self.style.SUCCESS('✅ Created English test user'))
        else:
            en_user.user_language = 'en'
            en_user.save()
            self.stdout.write(self.style.SUCCESS('✅ Updated English test user'))
        
        self.stdout.write(f'   Email: english_test@example.com')
        self.stdout.write(f'   Password: testpass123')
        self.stdout.write('')

        # German test user
        de_user, de_created = User.objects.get_or_create(
            email='german_test@example.com',
            defaults={
                'username': 'german_test',
                'user_language': 'de',
                'pronunciation_preference': 'pinyin_acc',
                'theme_preference': 1  # 1 = light
            }
        )
        if de_created:
            de_user.set_password('testpass123')
            de_user.save()
            self.stdout.write(self.style.SUCCESS('✅ Created German test user'))
        else:
            de_user.user_language = 'de'
            de_user.save()
            self.stdout.write(self.style.SUCCESS('✅ Updated German test user'))
        
        self.stdout.write(f'   Email: german_test@example.com')
        self.stdout.write(f'   Password: testpass123')
        self.stdout.write('')

        # Summary
        self.stdout.write(self.style.SUCCESS('🎉 Test users ready for frontend testing!'))
        self.stdout.write('')
        self.stdout.write('Frontend Integration Testing:')
        self.stdout.write('1. Start backend: python manage.py runserver')
        self.stdout.write('2. Start frontend: cd frontend && npm run dev')
        self.stdout.write('3. Open http://localhost:3000')
        self.stdout.write('4. Login with test user credentials above')
        self.stdout.write('5. Verify language preference and definitions in UI')
