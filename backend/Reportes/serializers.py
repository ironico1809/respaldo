from rest_framework import serializers
from .models import ReporteLog

class ReporteLogSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    
    class Meta:
        model = ReporteLog
        fields = ['id', 'usuario', 'usuario_username', 'prompt_original', 'tipo_archivo', 
                  'fecha_generacion', 'archivo_url']
        read_only_fields = ['fecha_generacion']
