from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CarritoViewSet, CarritoItemViewSet

router = DefaultRouter()
router.register(r'', CarritoViewSet, basename='carrito')
router.register(r'items', CarritoItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
