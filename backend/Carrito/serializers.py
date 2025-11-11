from rest_framework import serializers
from .models import Carrito, CarritoItem
from Producto.models import Producto

class CarritoItemSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    producto_precio = serializers.DecimalField(source='producto.precio', max_digits=10, decimal_places=2, read_only=True)
    producto_imagen = serializers.CharField(source='producto.imagen_url', read_only=True)
    subtotal = serializers.SerializerMethodField()
    
    class Meta:
        model = CarritoItem
        fields = ['id', 'carrito', 'producto', 'producto_nombre', 'producto_precio', 
                  'producto_imagen', 'cantidad', 'subtotal']
    
    def get_subtotal(self, obj):
        return obj.subtotal()


class CarritoSerializer(serializers.ModelSerializer):
    items = CarritoItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    
    class Meta:
        model = Carrito
        fields = ['id', 'usuario', 'usuario_username', 'fecha_actualizacion', 'items', 'total']
        read_only_fields = ['fecha_actualizacion']
    
    def get_total(self, obj):
        return obj.total()


class AgregarItemSerializer(serializers.Serializer):
    producto_id = serializers.IntegerField()
    cantidad = serializers.IntegerField(min_value=1)
