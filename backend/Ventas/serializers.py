from rest_framework import serializers
from django.db import transaction
from decimal import Decimal
from .models import Venta, VentaDetalle
from Cliente.models import Cliente
from Empleados.models import Empleado
from Producto.models import Producto
from Carrito.models import Carrito

class VentaDetalleSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    producto_imagen = serializers.CharField(source='producto.imagen_url', read_only=True)
    
    class Meta:
        model = VentaDetalle
        fields = ['id', 'venta', 'producto', 'producto_nombre', 'producto_imagen', 
                  'cantidad', 'precio_unitario', 'subtotal']
        read_only_fields = ['subtotal']


class VentaSerializer(serializers.ModelSerializer):
    detalles = VentaDetalleSerializer(many=True, read_only=True)
    cliente_nombre = serializers.CharField(source='cliente.nombre_completo', read_only=True)
    vendedor_nombre = serializers.CharField(source='vendedor.nombre_completo', read_only=True)
    subtotal = serializers.SerializerMethodField()
    igv = serializers.SerializerMethodField()
    
    class Meta:
        model = Venta
        fields = ['id', 'cliente', 'cliente_nombre', 'vendedor', 'vendedor_nombre', 
                  'fecha_venta', 'subtotal', 'igv', 'monto_total', 'metodo_pago', 
                  'referencia_pago', 'estado', 'detalles']
        read_only_fields = ['fecha_venta']
    
    def get_subtotal(self, obj):
        return obj.monto_total / Decimal('1.18')
    
    def get_igv(self, obj):
        return obj.monto_total - (obj.monto_total / Decimal('1.18'))


class CrearVentaDesdeCarritoSerializer(serializers.Serializer):
    usuario_id = serializers.IntegerField(default=1)
    cliente_id = serializers.IntegerField()
    metodo_pago = serializers.ChoiceField(choices=[
        ('efectivo', 'Efectivo'),
        ('tarjeta', 'Tarjeta de Crédito/Débito'),
        ('yape', 'Yape'),
        ('plin', 'Plin'),
        ('transferencia', 'Transferencia Bancaria'),
    ])
    referencia_pago = serializers.CharField(max_length=255, required=False, allow_blank=True)
    
    @transaction.atomic
    def create(self, validated_data):
        usuario_id = validated_data.get('usuario_id', 1)
        
        try:
            carrito = Carrito.objects.get(usuario_id=usuario_id)
            
            if not carrito.items.exists():
                raise serializers.ValidationError('El carrito está vacío')
            
            # Verificar stock de todos los productos
            for item in carrito.items.all():
                if item.producto.stock < item.cantidad:
                    raise serializers.ValidationError(
                        f'Stock insuficiente para {item.producto.nombre}. '
                        f'Solo hay {item.producto.stock} unidades disponibles'
                    )
            
            # Calcular totales
            subtotal = carrito.total()
            igv = subtotal * 0.18
            monto_total = subtotal + igv
            
            # Crear venta
            venta = Venta.objects.create(
                cliente_id=validated_data['cliente_id'],
                monto_total=monto_total,
                metodo_pago=validated_data['metodo_pago'],
                referencia_pago=validated_data.get('referencia_pago', ''),
                estado='Completada'
            )
            
            # Crear detalles y actualizar stock
            for item in carrito.items.all():
                VentaDetalle.objects.create(
                    venta=venta,
                    producto=item.producto,
                    cantidad=item.cantidad,
                    precio_unitario=item.producto.precio,
                    subtotal=item.subtotal()
                )
                
                # Actualizar stock
                item.producto.stock -= item.cantidad
                item.producto.save()
            
            # Vaciar carrito
            carrito.items.all().delete()
            
            return venta
        
        except Carrito.DoesNotExist:
            raise serializers.ValidationError('Carrito no encontrado')


class VentaCreateSerializer(serializers.Serializer):
    cliente_id = serializers.IntegerField()
    vendedor_id = serializers.IntegerField(required=False, allow_null=True)
    metodo_pago = serializers.ChoiceField(choices=[
        ('efectivo', 'Efectivo'),
        ('tarjeta', 'Tarjeta de Crédito/Débito'),
        ('yape', 'Yape'),
        ('plin', 'Plin'),
        ('transferencia', 'Transferencia Bancaria'),
    ])
    referencia_pago = serializers.CharField(max_length=255, required=False, allow_blank=True)
    detalles = serializers.ListField(
        child=serializers.DictField()
    )
    
    @transaction.atomic
    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles')
        
        if not detalles_data:
            raise serializers.ValidationError('Debe incluir al menos un detalle de venta')
        
        # Verificar stock
        for detalle in detalles_data:
            try:
                producto = Producto.objects.get(id=detalle['producto_id'])
                if producto.stock < int(detalle['cantidad']):
                    raise serializers.ValidationError(
                        f'Stock insuficiente para {producto.nombre}. Stock disponible: {producto.stock}'
                    )
            except Producto.DoesNotExist:
                raise serializers.ValidationError(f'Producto con ID {detalle["producto_id"]} no existe')
        
        # Calcular monto total (con IGV incluido)
        from decimal import Decimal
        subtotal = sum(
            Decimal(str(detalle['precio_unitario'])) * Decimal(str(detalle['cantidad'])) 
            for detalle in detalles_data
        )
        monto_total = subtotal * Decimal('1.18')
        
        # Crear venta
        venta = Venta.objects.create(
            cliente_id=validated_data['cliente_id'],
            vendedor_id=validated_data.get('vendedor_id'),
            monto_total=monto_total,
            metodo_pago=validated_data['metodo_pago'],
            referencia_pago=validated_data.get('referencia_pago', '')
        )
        
        # Crear detalles y actualizar stock
        for detalle in detalles_data:
            producto = Producto.objects.get(id=detalle['producto_id'])
            
            from decimal import Decimal
            precio_unit = Decimal(str(detalle['precio_unitario']))
            cantidad = int(detalle['cantidad'])
            
            VentaDetalle.objects.create(
                venta=venta,
                producto=producto,
                cantidad=cantidad,
                precio_unitario=precio_unit,
                subtotal=precio_unit * Decimal(str(cantidad))
            )
            
            # Actualizar stock del producto
            producto.stock -= cantidad
            producto.save()
        
        return venta
