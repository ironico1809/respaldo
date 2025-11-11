from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ReporteLog
from .serializers import ReporteLogSerializer

class ReporteLogViewSet(viewsets.ModelViewSet):
    queryset = ReporteLog.objects.all()
    serializer_class = ReporteLogSerializer
    
    @action(detail=False, methods=['get'])
    def mis_reportes(self, request):
        """Obtener reportes del usuario"""
        usuario_id = request.query_params.get('usuario_id')
        if not usuario_id:
            return Response({'error': 'usuario_id requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        reportes = ReporteLog.objects.filter(usuario_id=usuario_id)
        serializer = self.get_serializer(reportes, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def generar(self, request):
        """Generar un nuevo reporte"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
