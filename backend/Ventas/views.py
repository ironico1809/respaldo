from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Venta, VentaDetalle
from .serializers import VentaSerializer, VentaDetalleSerializer, VentaCreateSerializer
from django.db.models import Sum, Count
from datetime import datetime, timedelta

class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all()
    serializer_class = VentaSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return VentaCreateSerializer
        return VentaSerializer
    
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
