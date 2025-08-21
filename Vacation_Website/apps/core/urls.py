# URL configuration for the core app.
from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('', views.HomeView.as_view(), name='home'),
    # Add your URL patterns here
    # Example:
    # path('', views.home, name='home'),
]