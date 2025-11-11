from rest_framework import serializers
from .models import Notificacion, DispositivoUsuario

class NotificacionSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    
    class Meta:
        model = Notificacion
        fields = ['id', 'usuario', 'usuario_username', 'titulo', 'mensaje', 'leida', 'fecha_envio']
        read_only_fields = ['fecha_envio']


class DispositivoUsuarioSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    
    class Meta:
        model = DispositivoUsuario
        fields = ['id', 'usuario', 'usuario_username', 'fcm_token', 'plataforma', 'ultimo_acceso']
        read_only_fields = ['ultimo_acceso']
