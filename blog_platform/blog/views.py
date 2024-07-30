from django.http import JsonResponse
from django.shortcuts import get_object_or_404, get_list_or_404
from django.db.models import Q, Count
from django.utils.text import slugify
from rest_framework.pagination import PageNumberPagination

# For Define API Views
from rest_framework import generics, viewsets, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Like, Post, Category, Tag, Comment, User, AuthorProfile
from .serializers import PostSerializer, CategorySerializer, TagSerializer, CommentSerializer, UserSerializer, PasswordResetSerializer, LikeSerializer, AuthorProfileSerializer, RecentPostCategorySerializer


# For User Authentication
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.authtoken.views import ObtainAuthToken, APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth.hashers import make_password
from django.contrib.auth.forms import UserCreationForm, SetPasswordForm

# For PasswordRest
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.core import mail
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import get_user_model


# Pagination
class CustomPageNumberPagination(PageNumberPagination):
    page_size = 6  # Adjust the number of items per page as needed
    page_size_query_param = 'page_size'
    max_page_size = 100
    page_query_param = 'page'


# List all Post Public
class PostListView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = CustomPageNumberPagination

    def get_queryset(self):
        queryset = Post.objects.all().filter(is_public=True).order_by('-created_at')

        search = self.request.query_params.get('search', '')
        search_type = self.request.query_params.get('type', '')
        author_id = self.request.query_params.get('author', None)
        category_id = self.request.query_params.get('category_id', None)

        type_field_mapping = {
            'title': 'title__icontains',
            'category': 'category__name__icontains',
        }

        if search_type in type_field_mapping:
            filter_condition = Q(**{type_field_mapping[search_type]: search})
            queryset = queryset.filter(
                filter_condition)

        elif author_id is not None:
            queryset = Post.objects.all().filter(
                author=author_id, is_public=True).order_by('-created_at')

        elif category_id is not None:
            queryset = Post.objects.all().filter(
                category=category_id, is_public=True).order_by('-created_at')

        else:
            queryset = Post.objects.all().filter(is_public=True).order_by('-created_at')

        return queryset


# View Post Details Public
class PostDetailView(generics.RetrieveAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'id'

    def get_queryset(self):
        query = Post.objects.filter(id=self.kwargs.get('id'))
        return query


# Get Featured Post Public
class FeaturedPostView(generics.RetrieveAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self):
        queryset = Post.objects.filter(is_public=True).annotate(like_count=Count('like'), comment_count=Count(
            'comment')).order_by('-like_count', '-comment_count', '-created_at').first()

        return queryset


# Get Recent Posts Public
class RecentPostsView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Post.objects.filter(
            is_public=True).order_by('-created_at')[:4]

        return queryset


# Get Popular Category  Public
class PopularCategoriesView(generics.ListAPIView):
    serializer_class = RecentPostCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Category.objects .annotate(num_posts=Count('post', filter=Q(post__is_public=True))).exclude(
            name__iexact='Uncategory').filter(num_posts__gt=0).order_by('-num_posts')[:5]

        return queryset


# List Posts Private
class PostModelViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    pagination_class = CustomPageNumberPagination

    def get_queryset(self):
        queryset = Post.objects.all().filter(
            author=self.request.user).order_by('-created_at')

        search = self.request.query_params.get('search', '')
        search_type = self.request.query_params.get('type', '')

        type_field_mapping = {
            'title': 'title__icontains',
            'category': 'category__name__icontains',
        }

        if search_type in type_field_mapping:
            filter_condition = Q(**{type_field_mapping[search_type]: search})
            queryset = queryset.filter(
                filter_condition)

        if not search:
            queryset = Post.objects.all().filter(
                author=self.request.user).order_by('-created_at')

        return queryset

    def set_slug_and_save(self, serializer):
        title = serializer.validated_data['title']
        slug = slugify(title)
        base_slug = slug
        count = 1

        while Post.objects.filter(slug=slug).exists():
            count += 1
            slug = f"{base_slug}-{count}"

        serializer.validated_data['slug'] = slug
        serializer.save(author=self.request.user)

    def perform_create(self, serializer):
        # If 'category' is provided, set the category ID
        if 'category' in self.request.data:
            category_id = self.request.data['category']
            serializer.validated_data['category'] = Category.objects.get(
                pk=category_id)

        # If 'tags' is provided, set the tag IDs
        if 'tags' in self.request.data:
            tag_ids = self.request.data.getlist('tags')
            tags = Tag.objects.filter(pk__in=tag_ids)

        slug = self.request.data.get('slug')  # Use get to handle None
        if slug is None or slug == '':
            self.set_slug_and_save(serializer)
        else:
            serializer.validated_data['slug'] = slug
            serializer.save(author=self.request.user)

        serializer.save(author=self.request.user)
        serializer.instance.tags.set(tags)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=True)

        if serializer.is_valid():
            # If 'category' is provided, set the category ID
            if 'category' in request.data:
                category_id = request.data['category']
                print('####################### Test ####################')
                print(request.data['category'])
                print('####################### Test ####################')
                serializer.validated_data['category'] = Category.objects.get(
                    pk=category_id)

            # If 'tags' is provided, set the tag IDs
            if 'tags' in request.data:
                tag_ids = request.data.getlist('tags')
                tags = Tag.objects.filter(pk__in=tag_ids)
                serializer.instance.tags.set(tags)

            slug = self.request.data.get('slug')  # Use get to handle None
            if slug is None or slug == '':
                self.set_slug_and_save(serializer)
            else:
                serializer.validated_data['slug'] = slug
                serializer.save(author=self.request.user)

            serializer.save()

            return Response(serializer.data)
        else:
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Category.objects.all().order_by('name')

        search = self.request.query_params.get('search', '')

        if search:
            queryset = queryset.filter(name__icontains=search)
        else:
            queryset = Category.objects.all().order_by('name')

        return queryset


class TagListCrateView(generics.ListCreateAPIView):
    queryset = Tag.objects.all().order_by('name')
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all().order_by('name')
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Tag.objects.all().order_by('name')

        search = self.request.query_params.get('search', '')

        if search:
            queryset = queryset.filter(name__icontains=search)
        else:
            queryset = Tag.objects.all().order_by('name')

        return queryset


class CommentListCreateView(generics.ListCreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    def get_permissions(self):
        if self.action == 'list':
            return [IsAuthenticatedOrReadOnly()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Comment.objects.all()
        postId = self.request.query_params.get('postId')
        if postId is not None:
            queryset = queryset.filter(post_id=postId)
        return queryset

    def perform_create(self, serializer):
        author = self.request.user
        post_id = self.request.data.get('post')
        # Retrieve the Post instance based on the provided ID
        post = get_object_or_404(Post, id=post_id)

        serializer.validated_data['author'] = author
        serializer.validated_data['post'] = post

        serializer.save()


class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer

    def get_permissions(self):
        if self.action == 'list':
            return [IsAuthenticatedOrReadOnly()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Like.objects.all()
        postId = self.request.query_params.get('postId')

        if postId is not None:
            queryset = queryset.filter(post_id=postId)
        return queryset

    def perform_create(self, serializer):
        author = self.request.user
        serializer.validated_data['author'] = author
        serializer.save()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = User.objects.all()
        user_name = self.request.query_params.get('username')

        if user_name is not None:
            queryset = queryset.filter(username=user_name)
        return queryset


class TopAuthorViewSet(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        top_authors = User.objects.annotate(
            num_posts=Count('post', filter=Q(post__is_public=True))).order_by('-num_posts')[:3]

        return top_authors


def home(request):
    return JsonResponse({'message': 'Testing App'})


class AuthorProfileModelViewSet(viewsets.ModelViewSet):
    queryset = AuthorProfile.objects.all()
    serializer_class = AuthorProfileSerializer

    def get_permissions(self):

        if self.action == 'list':
            return [IsAuthenticatedOrReadOnly()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        author = self.request.user
        serializer.validated_data['author'] = author
        serializer.save()

    def get_queryset(self):
        author_id = self.request.query_params.get('author', None)
        top_authors = self.request.query_params.get('author_ids', None)

        if top_authors:
            top_authors = top_authors.split(',')
            author_profiles = AuthorProfile.objects.filter(
                author__id__in=top_authors)
            return author_profiles

        elif author_id:
            return AuthorProfile.objects.filter(author=author_id)

        return AuthorProfile.objects.all()


# For User Authentication
class CustomUserCreateForm(UserCreationForm):
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name']


class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)

        return Response({'token': token.key, 'user_id': user.id, 'user_name': user.username})


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        hashed_password = make_password(serializer.validated_data['password'])
        serializer.validated_data['password'] = hashed_password
        user = serializer.save()
        Token.objects.create(user=user)


class LogOutView(APIView):
    permission_class = [IsAuthenticated]

    def post(self, request):
        user = request.user
        token = request.auth

        if user is not None and token is not None:
            # Logout the user by deleting their token.
            token.delete()
            return Response({'detail': 'Logout successful'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset(request):
    serializer = PasswordResetSerializer(data=request.data)

    if serializer.is_valid():
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': 'No user with this email address.'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate a password reset token and send an email with a link to reset the password.
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.id))
        frontend_url = "http://env-blog.eba-rqbv9mhp.eu-west-1.elasticbeanstalk.com"
        context = {
            'user': user,
            'domain': frontend_url,
            'uid': urlsafe_base64_encode(force_bytes(user.id)),
            'token': token,
        }

        subject = 'Password Reset'
        message = render_to_string(
            'email_templates/password_reset_email.html', context)
        from_email = 'noreply@example.com'
        recipient_list = [email]
        mail.send_mail(subject, message, from_email, recipient_list)

        return Response({'detail': 'Password reset email sent.'}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request, uidb64, token):
    User = get_user_model()
    try:
        # Decode the uidb64 to get the user's ID
        user_id = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(id=user_id)

        # Check if the token is valid
        if default_token_generator.check_token(user, token):
            if request.method == 'POST':
                new_password = request.data.get('new_password1')
                form = SetPasswordForm(user, request.data)
                if form.is_valid():
                    # Set the new password
                    user.set_password(new_password)
                    user.save()
                    return JsonResponse({'detail': 'Password reset successful'}, status=status.HTTP_200_OK)
                else:
                    print(form.errors)
                    return JsonResponse({'errors': form.errors}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return JsonResponse({'detail': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return JsonResponse({'detail': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)
