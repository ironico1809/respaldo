from rest_framework import serializers
from .models import Categoria, Producto, MovimientoInventario
from decimal import Decimal

# Tipo de cambio USD a BOB (Bolivianos)
TIPO_CAMBIO_USD_BOB = Decimal("6.96")


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'descripcion', 'estado']


class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    es_critico = serializers.SerializerMethodField()
    precio_bs = serializers.SerializerMethodField()
    
    class Meta:
        model = Producto
        fields = ['id', 'categoria', 'categoria_nombre', 'nombre', 'descripcion', 'precio', 
                  'precio_bs', 'stock', 'stock_minimo', 'imagen_url', 'estado', 'fecha_creacion', 'es_critico']
        read_only_fields = ['fecha_creacion']
    
    def get_es_critico(self, obj):
        return obj.es_inventario_critico()
    
    def get_precio_bs(self, obj):
        precio_usd = Decimal(str(obj.precio))
        return float(precio_usd * TIPO_CAMBIO_USD_BOB)


class MovimientoInventarioSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    usuario_username = serializers.CharField(source='usuario_responsable.username', read_only=True)
    
    class Meta:
        model = MovimientoInventario
        fields = ['id', 'producto', 'producto_nombre', 'tipo_movimiento', 'cantidad', 
                  'fecha_movimiento', 'usuario_responsable', 'usuario_username', 'motivo']
        read_only_fields = ['fecha_movimiento']
