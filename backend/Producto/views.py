from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from .models import Categoria, Producto, MovimientoInventario
from .serializers import CategoriaSerializer, ProductoSerializer, MovimientoInventarioSerializer

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    
    @action(detail=False, methods=['get'])
    def inventario_critico(self, request):
        """Obtener productos con inventario crítico"""
        productos = Producto.objects.filter(stock__lte=models.F('stock_minimo'))
        serializer = self.get_serializer(productos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def activos(self, request):
        """Obtener productos activos"""
        productos = Producto.objects.filter(estado='Activo')
        serializer = self.get_serializer(productos, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def ajustar_stock(self, request, pk=None):
        """Ajustar stock de un producto"""
        producto = self.get_object()
        cantidad = request.data.get('cantidad')
        tipo_movimiento = request.data.get('tipo_movimiento', 'ajuste')
        motivo = request.data.get('motivo', '')
        usuario_id = request.data.get('usuario_id')
        
        if tipo_movimiento == 'entrada':
            producto.stock += int(cantidad)
        elif tipo_movimiento == 'salida':
            producto.stock -= int(cantidad)
        else:  # ajuste
            producto.stock = int(cantidad)
        
        producto.save()
        
        # Registrar movimiento
        MovimientoInventario.objects.create(
            producto=producto,
            tipo_movimiento=tipo_movimiento,
            cantidad=cantidad,
            usuario_responsable_id=usuario_id,
            motivo=motivo
        )
        
        return Response(self.get_serializer(producto).data)


class MovimientoInventarioViewSet(viewsets.ModelViewSet):
    queryset = MovimientoInventario.objects.all()
    serializer_class = MovimientoInventarioSerializer
    
    @action(detail=False, methods=['get'])
    def por_producto(self, request):
        """Obtener movimientos de un producto"""
        producto_id = request.query_params.get('producto_id')
        if not producto_id:
            return Response({'error': 'producto_id requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        movimientos = MovimientoInventario.objects.filter(producto_id=producto_id)
        serializer = self.get_serializer(movimientos, many=True)
        return Response(serializer.data)
