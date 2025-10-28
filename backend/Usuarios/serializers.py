from rest_framework import serializers
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'correo', 'password', 'tipo_usuario', 'estado']
        extra_kwargs = {
            'password': {'write_only': True}
        }
        read_only_fields = ['estado']

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

