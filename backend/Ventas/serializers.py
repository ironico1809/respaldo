from rest_framework import serializers
from .models import Venta, VentaDetalle
from Cliente.models import Cliente
from Empleados.models import Empleado
from Producto.models import Producto

class VentaDetalleSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    
    class Meta:
        model = VentaDetalle
        fields = ['id', 'venta', 'producto', 'producto_nombre', 'cantidad', 'precio_unitario', 'subtotal']
        read_only_fields = ['subtotal']


class VentaSerializer(serializers.ModelSerializer):
    detalles = VentaDetalleSerializer(many=True, read_only=True)
    cliente_nombre = serializers.CharField(source='cliente.nombre_completo', read_only=True)
    vendedor_nombre = serializers.CharField(source='vendedor.nombre_completo', read_only=True)
    
    class Meta:
        model = Venta
        fields = ['id', 'cliente', 'cliente_nombre', 'vendedor', 'vendedor_nombre', 
                  'fecha_venta', 'monto_total', 'metodo_pago', 'referencia_pago', 
                  'estado', 'detalles']
        read_only_fields = ['fecha_venta']


class VentaCreateSerializer(serializers.Serializer):
    cliente_id = serializers.IntegerField()
    vendedor_id = serializers.IntegerField(required=False, allow_null=True)
    metodo_pago = serializers.CharField(max_length=50)
    referencia_pago = serializers.CharField(max_length=255, required=False, allow_blank=True)
    detalles = serializers.ListField(
        child=serializers.DictField()
    )
    
    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles')
        
        # Calcular monto total
        monto_total = sum(
            float(detalle['precio_unitario']) * int(detalle['cantidad']) 
            for detalle in detalles_data
        )
        
        # Crear venta
        venta = Venta.objects.create(
            cliente_id=validated_data['cliente_id'],
            vendedor_id=validated_data.get('vendedor_id'),
            monto_total=monto_total,
            metodo_pago=validated_data['metodo_pago'],
            referencia_pago=validated_data.get('referencia_pago', '')
        )
        
        # Crear detalles
        for detalle in detalles_data:
            VentaDetalle.objects.create(
                venta=venta,
                producto_id=detalle['producto_id'],
                cantidad=detalle['cantidad'],
                precio_unitario=detalle['precio_unitario'],
                subtotal=float(detalle['precio_unitario']) * int(detalle['cantidad'])
            )
            
            # Actualizar stock del producto
            producto = Producto.objects.get(id=detalle['producto_id'])
            producto.stock -= detalle['cantidad']
            producto.save()
        
        return venta
