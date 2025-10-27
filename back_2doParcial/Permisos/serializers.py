from rest_framework import serializers
from .models import Permiso

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
