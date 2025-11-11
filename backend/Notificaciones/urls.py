from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificacionViewSet, DispositivoUsuarioViewSet

router = DefaultRouter()
router.register(r'', NotificacionViewSet, basename='notificacion')
router.register(r'dispositivos', DispositivoUsuarioViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
