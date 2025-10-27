from django.urls import path
from . import views

urlpatterns = [
    # === RUTAS DE USUARIOS ===
    path('login/', views.login, name='login'),
    
    # Listar
    path('usuarios/', views.listar_usuarios, name='listar-usuarios'),
    path('usuarios/todos/', views.listar_todos_usuarios, name='listar-todos-usuarios'),
    
    # Crear
    path('usuarios/crear/', views.crear_usuario, name='crear-usuario'),
    
    # CRUD individual
    path('usuarios/<int:pk>/', views.obtener_usuario, name='obtener-usuario'),
    path('usuarios/<int:pk>/editar/', views.editar_usuario, name='editar-usuario'),
    path('usuarios/<int:pk>/eliminar/', views.eliminar_usuario, name='eliminar-usuario'),
    path('usuarios/<int:pk>/restaurar/', views.restaurar_usuario, name='restaurar-usuario'),
    
]