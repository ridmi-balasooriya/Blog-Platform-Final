from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Tag, Category


@receiver(pre_delete, sender=User)
def update_tags_and_categories(sender, instance, **kwargs):
    # Update tags
    Tag.objects.filter(author=instance).update(
        author=User.objects.get(username='ridmi1234'))

    # Update categories (you need to define the relationship between User and Category for this to work)
    Category.objects.filter(author=instance).update(
        author=User.objects.get(username='ridmi1234'))
