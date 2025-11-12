from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncMonth, TruncDate
from datetime import datetime, timedelta
from .models import PrediccionVentas
from .serializers import PrediccionVentasSerializer
from .ml_service import predictor
from Ventas.models import Venta
from Producto.models import Producto


class PrediccionVentasViewSet(viewsets.ModelViewSet):
    queryset = PrediccionVentas.objects.all()
    serializer_class = PrediccionVentasSerializer
    
    @action(detail=False, methods=['post'])
    def entrenar_modelo(self, request):
        """
        Entrena el modelo de IA con datos históricos
        """
        try:
            usar_datos_reales = request.data.get('usar_datos_reales', True)
            
            resultados = predictor.entrenar_modelo(usar_datos_reales=usar_datos_reales)
            
            return Response({
                'success': True,
                'message': 'Modelo entrenado exitosamente',
                'metricas': resultados
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def predecir_futuro(self, request):
        """
        Predice ventas para los próximos días
        """
        try:
            dias = int(request.query_params.get('dias', 30))
            
            if not predictor.is_trained:
                # Entrenar automáticamente si no está entrenado
                predictor.entrenar_modelo()
            
            predicciones = predictor.predecir_ventas_futuras(dias=dias)
            
            return Response({
                'success': True,
                'predicciones': predicciones
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def predecir_por_producto(self, request):
        """
        Predice ventas para un producto específico
        """
        try:
            producto_id = request.query_params.get('producto_id')
            dias = int(request.query_params.get('dias', 30))
            
            if not producto_id:
                return Response({
                    'success': False,
                    'error': 'producto_id es requerido'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not predictor.is_trained:
                predictor.entrenar_modelo()
            
            predicciones = predictor.predecir_por_producto(int(producto_id), dias=dias)
            
            return Response({
                'success': True,
                'predicciones': predicciones,
                'producto_id': producto_id
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def predecir_mensual(self, request):
        """
        Predice ventas totales mensuales
        """
        try:
            meses = int(request.query_params.get('meses', 6))
            
            if not predictor.is_trained:
                predictor.entrenar_modelo()
            
            predicciones = predictor.predecir_mensual(meses=meses)
            
            return Response({
                'success': True,
                'predicciones': predicciones
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def metricas_modelo(self, request):
        """
        Retorna métricas y estado del modelo
        """
        try:
            importancias = predictor.obtener_importancia_features()
            
            return Response({
                'success': True,
                'modelo_entrenado': predictor.is_trained,
                'importancia_features': importancias
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def ventas_historicas(self, request):
        """
        Obtiene ventas históricas agrupadas por período
        """
        try:
            periodo = request.query_params.get('periodo', 'mensual')  # diario, mensual
            
            if periodo == 'diario':
                # Últimos 30 días
                fecha_inicio = datetime.now() - timedelta(days=30)
                ventas = Venta.objects.filter(
                    fecha_venta__gte=fecha_inicio
                ).annotate(
                    fecha=TruncDate('fecha_venta')
                ).values('fecha').annotate(
                    total=Sum('monto_total'),
                    cantidad=Count('id')
                ).order_by('fecha')
                
                data = [
                    {
                        'fecha': v['fecha'].strftime('%Y-%m-%d'),
                        'total': float(v['total']),
                        'cantidad': v['cantidad']
                    }
                    for v in ventas
                ]
            
            else:  # mensual
                # Últimos 12 meses
                fecha_inicio = datetime.now() - timedelta(days=365)
                ventas = Venta.objects.filter(
                    fecha_venta__gte=fecha_inicio
                ).annotate(
                    mes=TruncMonth('fecha_venta')
                ).values('mes').annotate(
                    total=Sum('monto_total'),
                    cantidad=Count('id'),
                    promedio=Avg('monto_total')
                ).order_by('mes')
                
                data = [
                    {
                        'mes': v['mes'].strftime('%Y-%m'),
                        'total': float(v['total']),
                        'cantidad': v['cantidad'],
                        'promedio': float(v['promedio'])
                    }
                    for v in ventas
                ]
            
            return Response({
                'success': True,
                'periodo': periodo,
                'datos': data
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def productos_mas_vendidos(self, request):
        """
        Retorna los productos más vendidos
        """
        try:
            from Ventas.models import VentaDetalle
            
            limite = int(request.query_params.get('limite', 10))
            
            productos = VentaDetalle.objects.values(
                'producto__id',
                'producto__nombre',
                'producto__precio'
            ).annotate(
                cantidad_total=Sum('cantidad'),
                ventas_total=Sum('subtotal')
            ).order_by('-cantidad_total')[:limite]
            
            data = [
                {
                    'producto_id': p['producto__id'],
                    'nombre': p['producto__nombre'],
                    'precio': float(p['producto__precio']),
                    'cantidad_vendida': p['cantidad_total'],
                    'ventas_total': float(p['ventas_total'])
                }
                for p in productos
            ]
            
            return Response({
                'success': True,
                'productos': data
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def dashboard_data(request):
    """
    Endpoint unificado para obtener todos los datos del dashboard
    """
    try:
        # Entrenar modelo si no está entrenado
        if not predictor.is_trained:
            predictor.entrenar_modelo()
        
        # Obtener ventas históricas mensuales
        fecha_inicio = datetime.now() - timedelta(days=365)
        ventas_historicas = Venta.objects.filter(
            fecha_venta__gte=fecha_inicio
        ).annotate(
            mes=TruncMonth('fecha_venta')
        ).values('mes').annotate(
            total_ventas=Sum('monto_total'),
            cantidad=Count('id')
        ).order_by('mes')
        
        historico = [
            {
                'mes': v['mes'].strftime('%Y-%m'),
                'total': float(v['total_ventas']),
                'cantidad': v['cantidad']
            }
            for v in ventas_historicas
        ]
        
        # Predicciones mensuales
        predicciones_mensuales = predictor.predecir_mensual(meses=6)
        
        # Predicciones diarias (próximos 30 días)
        predicciones_diarias = predictor.predecir_ventas_futuras(dias=30)
        
        # Productos más vendidos
        from Ventas.models import VentaDetalle
        productos_top = VentaDetalle.objects.values(
            'producto__id',
            'producto__nombre'
        ).annotate(
            cantidad_total=Sum('cantidad')
        ).order_by('-cantidad_total')[:5]
        
        top_productos = [
            {
                'nombre': p['producto__nombre'],
                'cantidad': p['cantidad_total']
            }
            for p in productos_top
        ]
        
        return Response({
            'success': True,
            'ventas_historicas': historico,
            'predicciones_mensuales': predicciones_mensuales,
            'predicciones_diarias': predicciones_diarias,
            'productos_top': top_productos,
            'modelo_entrenado': predictor.is_trained
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
