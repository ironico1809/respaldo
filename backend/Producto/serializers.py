from rest_framework import serializers
from .models import Categoria, Producto, MovimientoInventario

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'descripcion', 'estado']


class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    es_critico = serializers.SerializerMethodField()
    
    class Meta:
        model = Producto
        fields = ['id', 'categoria', 'categoria_nombre', 'nombre', 'descripcion', 'precio', 
                  'stock', 'stock_minimo', 'imagen_url', 'estado', 'fecha_creacion', 'es_critico']
        read_only_fields = ['fecha_creacion']
    
    def get_es_critico(self, obj):
        return obj.es_inventario_critico()


class MovimientoInventarioSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    usuario_username = serializers.CharField(source='usuario_responsable.username', read_only=True)
    
    class Meta:
        model = MovimientoInventario
        fields = ['id', 'producto', 'producto_nombre', 'tipo_movimiento', 'cantidad', 
                  'fecha_movimiento', 'usuario_responsable', 'usuario_username', 'motivo']
        read_only_fields = ['fecha_movimiento']
