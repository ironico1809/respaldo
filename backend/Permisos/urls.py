from django.urls import path
from . import views

urlpatterns = [
    # === ENDPOINT PRINCIPAL: MIS PERMISOS ===
    path('mis-permisos/', views.mis_permisos, name='mis-permisos'),
    
    # === GESTIÓN DE ROLES ===
    path('roles/', views.listar_roles, name='listar-roles'),
    path('roles/<int:pk>/', views.obtener_rol, name='obtener-rol'),
    path('roles/crear/', views.crear_rol, name='crear-rol'),
    path('roles/<int:pk>/actualizar/', views.actualizar_rol, name='actualizar-rol'),
    path('roles/<int:pk>/eliminar/', views.eliminar_rol, name='eliminar-rol'),
    
    # === GESTIÓN DE PERMISOS DE ROL ===
    path('roles/asignar-permiso/', views.asignar_permiso_a_rol, name='asignar-permiso-rol'),
    path('roles/<int:rol_id>/permisos/<int:permiso_modulo_id>/', views.quitar_permiso_de_rol, name='quitar-permiso-rol'),
    
    # === GESTIÓN DE ASIGNACIÓN DE ROLES A USUARIOS ===
    path('usuarios/asignar-rol/', views.asignar_rol_a_usuario, name='asignar-rol-usuario'),
    path('usuarios/<int:usuario_id>/roles/<int:rol_id>/', views.quitar_rol_de_usuario, name='quitar-rol-usuario'),
    path('usuarios/<int:usuario_id>/roles/', views.listar_roles_de_usuario, name='listar-roles-usuario'),
    
    # === GESTIÓN DE MÓDULOS ===
    path('modulos/', views.listar_modulos, name='listar-modulos'),
    
    # === PERMISOS ANTIGUOS (COMPATIBILIDAD) ===
    path('listar/', views.listar_permisos, name='listar-permisos'),
    path('usuario/<int:usuario_id>/', views.listar_permisos_por_usuario, name='listar-permisos-usuario'),
    path('<int:pk>/', views.obtener_permiso, name='obtener-permiso'),
    path('crear/', views.crear_permiso, name='crear-permiso'),
    path('<int:pk>/actualizar/', views.actualizar_permiso, name='actualizar-permiso'),
    path('<int:pk>/eliminar/', views.eliminar_permiso, name='eliminar-permiso'),
]
