from rest_framework import serializers
from .models import Post, Category, Tag, User, Comment, Like, AuthorProfile


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email',
                  'password', 'first_name', 'last_name')
        extra_kwargs = {'password': {'write_only': True}}

    # validation for exisiting usernames and email addresses.
    def validate(self, data):
        username = data.get('username')
        email = data.get('email')

        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError(
                {'username': 'Username already exists'})
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError(
                {'email': 'Email Address already exists'})

        return data


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
       # Check if the email exists in your database
        try:
            user = User.objects.get(email=value)
            print(user)

        except User.DoesNotExist:
            raise serializers.ValidationError(
                "Email address not found in our database.")

        return value


class AuthorProfileSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = AuthorProfile
        fields = '__all__'


class PostSerializer(serializers.ModelSerializer):

    author = UserSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)

    # Getting author profile data of each posts.
    author_profile = AuthorProfileSerializer(
        source='author.authorprofile', read_only=True)

    class Meta:
        model = Post
        fields = '__all__'


class CommentSerializer(serializers.ModelSerializer):
    post = PostSerializer(read_only=True)
    author = UserSerializer(read_only=True)

    # Getting author profile data of each comment.
    author_profile = AuthorProfileSerializer(
        source='author.authorprofile', read_only=True)

    class Meta:
        model = Comment
        fields = '__all__'


class LikeSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Like
        fields = '__all__'


# Get Recent Posts
class RecentPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'


# Get Recent Post of the Category
class RecentPostCategorySerializer(serializers.ModelSerializer):

    recent_post = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'recent_post']

    def get_recent_post(self, obj):
        recent_post = Post.objects.filter(
            category=obj, is_public=True).order_by('-created_at').first()
        return RecentPostSerializer(recent_post).data if recent_post else None
