from django.urls import path
from . import views

urlpatterns = [
    # === CLIENTES ===
    path('listar/', views.listar_clientes, name='listar-clientes'),
    path('todos/', views.listar_todos_clientes, name='listar-todos-clientes'),
    path('crear/', views.crear_cliente, name='crear-cliente'),
    path('<int:pk>/', views.obtener_cliente, name='obtener-cliente'),
    path('<int:pk>/actualizar/', views.actualizar_cliente, name='actualizar-cliente'),
    path('<int:pk>/eliminar/', views.eliminar_cliente, name='eliminar-cliente'),
    path('<int:pk>/restaurar/', views.restaurar_cliente, name='restaurar-cliente'),
]
