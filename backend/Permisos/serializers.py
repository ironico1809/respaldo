from rest_framework import serializers
from .models import Permiso, Rol, PermisoModulo, RolPermiso, UsuarioRol

class PermisoModuloSerializer(serializers.ModelSerializer):
    class Meta:
        model = PermisoModulo
        fields = ['id', 'modulo', 'nombre_menu', 'descripcion', 'icono', 'ruta', 'orden']


class RolPermisoSerializer(serializers.ModelSerializer):
    modulo = serializers.CharField(source='permiso_modulo.modulo', read_only=True)
    nombre_menu = serializers.CharField(source='permiso_modulo.nombre_menu', read_only=True)
    ruta = serializers.CharField(source='permiso_modulo.ruta', read_only=True)
    
    class Meta:
        model = RolPermiso
        fields = ['id', 'permiso_modulo', 'modulo', 'nombre_menu', 'ruta', 
                  'puede_ver', 'puede_crear', 'puede_editar', 'puede_eliminar']


class RolSerializer(serializers.ModelSerializer):
    permisos = RolPermisoSerializer(many=True, read_only=True)
    total_permisos = serializers.SerializerMethodField()
    
    class Meta:
        model = Rol
        fields = ['id', 'nombre', 'descripcion', 'activo', 'fecha_creacion', 'permisos', 'total_permisos']
    
    def get_total_permisos(self, obj):
        return obj.permisos.filter(puede_ver=True).count()


class UsuarioRolSerializer(serializers.ModelSerializer):
    rol_nombre = serializers.CharField(source='rol.nombre', read_only=True)
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    
    class Meta:
        model = UsuarioRol
        fields = ['id', 'usuario', 'usuario_username', 'rol', 'rol_nombre', 
                  'fecha_asignacion', 'activo']


class PermisoSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)

    class Meta:
        model = Permiso
        fields = [
            'id',
            'usuario',
            'usuario_username',
            'vista',
            'crear',
            'editar',
            'eliminar',
            'ver'
        ]
