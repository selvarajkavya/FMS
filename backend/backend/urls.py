from django.contrib import admin
from django.urls import path, include  # Include is required

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('app.urls')),  
]