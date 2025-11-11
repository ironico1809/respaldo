from rest_framework import serializers
from .models import PrediccionVentas

class PrediccionVentasSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    
    class Meta:
        model = PrediccionVentas
        fields = ['id', 'fecha_prediccion', 'monto_predicho', 'categoria', 'categoria_nombre', 
                  'fecha_generacion', 'modelo_usado']
        read_only_fields = ['fecha_generacion']
