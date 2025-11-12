from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Venta, VentaDetalle
from .serializers import (
    VentaSerializer, 
    VentaDetalleSerializer, 
    VentaCreateSerializer,
    CrearVentaDesdeCarritoSerializer
)
from django.db.models import Sum, Count
from datetime import datetime, timedelta

class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all()
    serializer_class = VentaSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return VentaCreateSerializer
        elif self.action == 'crear_desde_carrito':
            return CrearVentaDesdeCarritoSerializer
        return VentaSerializer
    
    @action(detail=False, methods=['post'])
    def crear_desde_carrito(self, request):
        """Crear venta desde el carrito del usuario"""
        serializer = CrearVentaDesdeCarritoSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                venta = serializer.save()
                return Response({
                    'message': 'Venta creada exitosamente',
                    'venta': VentaSerializer(venta).data
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({
                    'error': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def metodos_pago(self, request):
        """Obtener métodos de pago disponibles"""
        return Response({
            'metodos': [
                {'value': 'efectivo', 'label': 'Efectivo', 'icon': '💵'},
                {'value': 'tarjeta', 'label': 'Tarjeta de Crédito/Débito', 'icon': '💳'},
                {'value': 'yape', 'label': 'Yape', 'icon': '📱'},
                {'value': 'plin', 'label': 'Plin', 'icon': '📲'},
                {'value': 'transferencia', 'label': 'Transferencia Bancaria', 'icon': '🏦'},
            ]
        })
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Obtener estadísticas de ventas"""
        hoy = datetime.now().date()
        inicio_mes = hoy.replace(day=1)
        
        ventas_hoy = Venta.objects.filter(fecha_venta__date=hoy)
        ventas_mes = Venta.objects.filter(fecha_venta__date__gte=inicio_mes)
        
        return Response({
            'ventas_hoy': {
                'total': ventas_hoy.aggregate(Sum('monto_total'))['monto_total__sum'] or 0,
                'cantidad': ventas_hoy.count()
            },
            'ventas_mes': {
                'total': ventas_mes.aggregate(Sum('monto_total'))['monto_total__sum'] or 0,
                'cantidad': ventas_mes.count()
            }
        })
    
    @action(detail=False, methods=['get'])
    def ultimas(self, request):
        """Obtener últimas ventas"""
        limit = int(request.query_params.get('limit', 10))
        ventas = Venta.objects.all()[:limit]
        serializer = self.get_serializer(ventas, many=True)
        return Response(serializer.data)


class VentaDetalleViewSet(viewsets.ModelViewSet):
    queryset = VentaDetalle.objects.all()
    serializer_class = VentaDetalleSerializer
