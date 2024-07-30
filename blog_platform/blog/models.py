from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from signal import *


# Give Defalut value for author in Category and Tag Models if neccessry.
def get_default_author():
    try:
        return User.objects.get(username=3)
    except User.DoesNotExist:
        return None  # Handle the case where the superuser doesn't exist


class Category(models.Model):
    name = models.CharField(max_length=100)
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, null=True, default=get_default_author)

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=100)
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, null=True, default=get_default_author)

    def __str__(self):
        return self.name


def get_default_category():
    # Assuming there is a Category instance with the name 'Uncategory'
    uncategory, created = Category.objects.get_or_create(name='Uncategory')
    return uncategory


class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    image = models.ImageField(
        upload_to='blog_images/', null=True, blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(
        Category, on_delete=models.SET(get_default_category))
    tags = models.ManyToManyField(Tag)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # Meta Data
    slug = models.CharField(max_length=250, null=True, blank=True)
    meta_description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.title


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Commnet by {self.author.username} on {self.post.title}"


class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        unique_together = ['author', 'post']

    def __str__(self):
        return f"Liked by {self.author.username} on {self.post.title}"


class AuthorProfile(models.Model):
    author = models.OneToOneField(
        User, on_delete=models.CASCADE, primary_key=True)
    first_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100, null=True, blank=True)
    profile_pic = models.ImageField(
        upload_to='profile_pic/', null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
