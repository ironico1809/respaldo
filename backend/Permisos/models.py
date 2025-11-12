from django.db import models
from Usuarios.models import Usuario

class Rol(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'roles'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class PermisoModulo(models.Model):
    """Define los permisos por módulo del sistema"""
    MODULOS = [
        ('dashboard', 'Dashboard e Inteligencia de Negocio'),
        ('predicciones', 'Predicciones de Ventas'),
        ('usuarios', 'Gestión de Usuarios'),
        ('roles', 'Gestión de Roles y Permisos'),
        ('bitacora', 'Bitácora de Actividad'),
        ('clientes', 'Gestión de Clientes'),
        ('ventas', 'Gestión de Ventas'),
        ('inventario', 'Gestión de Inventario'),
        ('catalogo', 'Catálogo de Productos'),
        ('carrito', 'Carrito de Compras'),
        ('notificaciones', 'Notificaciones'),
        ('reportes', 'Reportes Dinámicos'),
    ]
    
    modulo = models.CharField(max_length=50, choices=MODULOS, unique=True)
    nombre_menu = models.CharField(max_length=100, help_text="Nombre que aparece en el menú")
    descripcion = models.TextField(blank=True, null=True)
    icono = models.CharField(max_length=50, blank=True, null=True, help_text="Clase del icono")
    ruta = models.CharField(max_length=100, help_text="Ruta en el frontend (ej: /dashboard)")
    orden = models.IntegerField(default=0, help_text="Orden de aparición en el menú")

    class Meta:
        db_table = 'permisos_modulos'
        ordering = ['orden', 'nombre_menu']

    def __str__(self):
        return f"{self.nombre_menu} ({self.modulo})"


class RolPermiso(models.Model):
    """Relación muchos a muchos entre roles y permisos de módulos"""
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE, related_name='permisos')
    permiso_modulo = models.ForeignKey(PermisoModulo, on_delete=models.CASCADE, related_name='roles')
    
    # Permisos específicos por módulo
    puede_ver = models.BooleanField(default=True)
    puede_crear = models.BooleanField(default=False)
    puede_editar = models.BooleanField(default=False)
    puede_eliminar = models.BooleanField(default=False)

    class Meta:
        db_table = 'roles_permisos'
        unique_together = ('rol', 'permiso_modulo')

    def __str__(self):
        return f"{self.rol.nombre} - {self.permiso_modulo.modulo}"


class UsuarioRol(models.Model):
    """Relación entre usuarios y roles"""
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='roles_asignados')
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE, related_name='usuarios')
    fecha_asignacion = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)

    class Meta:
        db_table = 'usuarios_roles'
        unique_together = ('usuario', 'rol')

    def __str__(self):
        return f"{self.usuario.username} - {self.rol.nombre}"


# Modelo antiguo mantenido para compatibilidad
class Permiso(models.Model):
    crear = models.BooleanField(default=False)
    editar = models.BooleanField(default=False)
    eliminar = models.BooleanField(default=False)
    ver = models.BooleanField(default=True)
    vista = models.CharField(max_length=50)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='permisos')

    class Meta:
        db_table = 'permisos'
        unique_together = ('usuario', 'vista')
        ordering = ['id']

    def __str__(self):
        return f"{self.usuario.username} - {self.vista}"
