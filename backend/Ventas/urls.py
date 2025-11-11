from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VentaViewSet, VentaDetalleViewSet

router = DefaultRouter()
router.register(r'', VentaViewSet, basename='venta')
router.register(r'detalles', VentaDetalleViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
