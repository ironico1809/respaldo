from django.urls import path
from . import views

urlpatterns = [
    # === RUTAS DE PERMISOS ===
    path('listar/', views.listar_permisos, name='listar-permisos'),
    path('usuario/<int:usuario_id>/', views.listar_permisos_por_usuario, name='listar-permisos-usuario'),
    path('<int:pk>/', views.obtener_permiso, name='obtener-permiso'),
    path('crear/', views.crear_permiso, name='crear-permiso'),
    path('<int:pk>/actualizar/', views.actualizar_permiso, name='actualizar-permiso'),
    path('<int:pk>/eliminar/', views.eliminar_permiso, name='eliminar-permiso'),
]
