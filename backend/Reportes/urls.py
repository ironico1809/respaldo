from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReporteLogViewSet

router = DefaultRouter()
router.register(r'', ReporteLogViewSet, basename='reporte')

urlpatterns = [
    path('', include(router.urls)),
]
