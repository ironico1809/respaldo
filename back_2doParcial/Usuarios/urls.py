from django.urls import path
from . import views
from . import views_empleados

urlpatterns = [
    # === RUTAS DE USUARIOS ===
    path('login/', views.login, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # Listar
    path('', views.listar_usuarios, name='listar-usuarios'),
    path('todos/', views.listar_todos_usuarios, name='listar-todos-usuarios'),
    
    # Crear
    path('crear/', views.crear_usuario, name='crear-usuario'),
    
    # CRUD individual
    path('<int:pk>/', views.obtener_usuario, name='obtener-usuario'),
    path('<int:pk>/editar/', views.editar_usuario, name='editar-usuario'),
    path('<int:pk>/eliminar/', views.eliminar_usuario, name='eliminar-usuario'),
    path('<int:pk>/restaurar/', views.restaurar_usuario, name='restaurar-usuario'),
    
    # === RUTAS DE EMPLEADOS ===
    # Listar
    path('empleados/', views_empleados.listar_empleados, name='listar-empleados'),
    path('empleados/todos/', views_empleados.listar_todos_empleados, name='listar-todos-empleados'),
    
    # Crear
    path('empleados/crear/', views_empleados.crear_empleado, name='crear-empleado'),
    path('empleados/crear-simple/', views_empleados.crear_empleado_simple, name='crear-empleado-simple'),
    
    # Buscar
    path('empleados/buscar/', views_empleados.buscar_empleado_por_ci, name='buscar-empleado-ci'),
    path('empleados/rol/<str:rol>/', views_empleados.listar_empleados_por_rol, name='listar-empleados-rol'),
    
    # CRUD individual
    path('empleados/<int:pk>/', views_empleados.obtener_empleado, name='obtener-empleado'),
    path('empleados/<int:pk>/actualizar/', views_empleados.actualizar_empleado, name='actualizar-empleado'),
    path('empleados/<int:pk>/eliminar/', views_empleados.eliminar_empleado, name='eliminar-empleado'),
    path('empleados/<int:pk>/restaurar/', views_empleados.restaurar_empleado, name='restaurar-empleado'),
]