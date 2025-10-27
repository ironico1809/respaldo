from django.urls import path
from . import views

urlpatterns = [
    # === RUTAS DE EMPLEADOS ===
    # Listar
    path('empleados/', views.listar_empleados, name='listar-empleados'),
    path('empleados/todos/', views.listar_todos_empleados, name='listar-todos-empleados'),
    
    # Crear
    path('empleados/crear/', views.crear_empleado, name='crear-empleado'),
    path('empleados/crear-simple/', views.crear_empleado_simple, name='crear-empleado-simple'),
    
    # Buscar
    path('empleados/buscar/', views.buscar_empleado_por_ci, name='buscar-empleado-ci'),
    path('empleados/rol/<str:rol>/', views.listar_empleados_por_rol, name='listar-empleados-rol'),
    
    # CRUD individual
    path('empleados/<int:pk>/', views.obtener_empleado, name='obtener-empleado'),
    path('empleados/<int:pk>/actualizar/', views.actualizar_empleado, name='actualizar-empleado'),
    path('empleados/<int:pk>/eliminar/', views.eliminar_empleado, name='eliminar-empleado'),
    path('empleados/<int:pk>/restaurar/', views.restaurar_empleado, name='restaurar-empleado'),
]