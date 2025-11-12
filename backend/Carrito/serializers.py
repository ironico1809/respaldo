from rest_framework import serializers
from .models import Carrito, CarritoItem
from Producto.models import Producto
from decimal import Decimal

# Tipo de cambio USD a BOB (Bolivianos)
TIPO_CAMBIO_USD_BOB = Decimal("6.96")

class CarritoItemSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    producto_precio = serializers.DecimalField(source='producto.precio', max_digits=10, decimal_places=2, read_only=True)
    producto_precio_bs = serializers.SerializerMethodField()
    producto_imagen = serializers.CharField(source='producto.imagen_url', read_only=True)
    producto_stock = serializers.IntegerField(source='producto.stock', read_only=True)
    producto_descripcion = serializers.CharField(source='producto.descripcion', read_only=True)
    subtotal = serializers.SerializerMethodField()
    subtotal_bs = serializers.SerializerMethodField()
    
    class Meta:
        model = CarritoItem
        fields = ['id', 'carrito', 'producto', 'producto_nombre', 'producto_precio', 
                  'producto_precio_bs', 'producto_imagen', 'producto_stock', 
                  'producto_descripcion', 'cantidad', 'subtotal', 'subtotal_bs']
    
    def get_producto_precio_bs(self, obj):
        precio_usd = Decimal(str(obj.producto.precio))
        return float(precio_usd * TIPO_CAMBIO_USD_BOB)
    
    def get_subtotal(self, obj):
        return obj.subtotal()
    
    def get_subtotal_bs(self, obj):
        subtotal_usd = obj.subtotal()
        return float(subtotal_usd * TIPO_CAMBIO_USD_BOB)


class CarritoSerializer(serializers.ModelSerializer):
    items = CarritoItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    total_bs = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()
    subtotal_bs = serializers.SerializerMethodField()
    igv = serializers.SerializerMethodField()
    igv_bs = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    tipo_cambio = serializers.SerializerMethodField()
    
    class Meta:
        model = Carrito
        fields = ['id', 'usuario', 'usuario_username', 'fecha_actualizacion', 'items', 
                  'total_items', 'subtotal', 'subtotal_bs', 'igv', 'igv_bs', 'total', 
                  'total_bs', 'tipo_cambio']
        read_only_fields = ['fecha_actualizacion']
    
    def get_tipo_cambio(self, obj):
        return float(TIPO_CAMBIO_USD_BOB)
    
    def get_total_items(self, obj):
        return sum(item.cantidad for item in obj.items.all())
    
    def get_subtotal(self, obj):
        return obj.total()
    
    def get_subtotal_bs(self, obj):
        subtotal_usd = obj.total()
        return float(subtotal_usd * TIPO_CAMBIO_USD_BOB)
    
    def get_igv(self, obj):
        return obj.total() * Decimal("0.18")
    
    def get_igv_bs(self, obj):
        igv_usd = obj.total() * Decimal("0.18")
        return float(igv_usd * TIPO_CAMBIO_USD_BOB)
    
    def get_total(self, obj):
        subtotal = obj.total()
        return subtotal + (subtotal * Decimal("0.18"))
    
    def get_total_bs(self, obj):
        total_usd = self.get_total(obj)
        return float(total_usd * TIPO_CAMBIO_USD_BOB)


class AgregarItemSerializer(serializers.Serializer):
    producto_id = serializers.IntegerField()
    cantidad = serializers.IntegerField(min_value=1)
