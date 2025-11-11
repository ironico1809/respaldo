from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PrediccionVentasViewSet

router = DefaultRouter()
router.register(r'', PrediccionVentasViewSet, basename='prediccion')

urlpatterns = [
    path('', include(router.urls)),
]
