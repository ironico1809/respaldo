from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PrediccionVentasViewSet, dashboard_data

router = DefaultRouter()
router.register(r'predicciones', PrediccionVentasViewSet, basename='prediccion')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', dashboard_data, name='dashboard_data'),
]
