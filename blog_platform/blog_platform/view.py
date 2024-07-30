from django.shortcuts import render
from django.http import JsonResponse

# For FrontEnd View
from django.http import HttpResponse
from django.views.generic import View
from django.conf import settings
import os
import logging


def home(request):
    return JsonResponse({'message': 'Testing Page'})


class FrontEndAppView(View):
    def get(self, request):
        try:
            with open(os.path.join(settings.REACT_APP_DIR, 'index.html')) as f:
                return HttpResponse(f.read())
        except FileNotFoundError:
            logging.exception('Production build of app not found')
            return HttpResponse(
                """
                This URL is only used when you have built the production
                version of the app. Visit http://localhost:3000/ instead, or
                run `npm run build` to test the production version.
                """,
                status=501,
            )
