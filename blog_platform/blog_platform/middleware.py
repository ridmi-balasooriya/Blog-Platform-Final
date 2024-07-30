class CorrectJsonContentTypeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if 'manifest.json' in request.path:
            response['Content-Type'] = 'application/json'
        return response
