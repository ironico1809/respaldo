from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notificacion, DispositivoUsuario
from .serializers import NotificacionSerializer, DispositivoUsuarioSerializer

class NotificacionViewSet(viewsets.ModelViewSet):
    queryset = Notificacion.objects.all()
    serializer_class = NotificacionSerializer
    
    @action(detail=False, methods=['get'])
    def mis_notificaciones(self, request):
        """Obtener notificaciones del usuario"""
        usuario_id = request.query_params.get('usuario_id')
        if not usuario_id:
            return Response({'error': 'usuario_id requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        notificaciones = Notificacion.objects.filter(usuario_id=usuario_id)
        serializer = self.get_serializer(notificaciones, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def no_leidas(self, request):
        """Obtener notificaciones no leídas"""
        usuario_id = request.query_params.get('usuario_id')
        if not usuario_id:
            return Response({'error': 'usuario_id requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        notificaciones = Notificacion.objects.filter(usuario_id=usuario_id, leida=False)
        serializer = self.get_serializer(notificaciones, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def marcar_leida(self, request, pk=None):
        """Marcar notificación como leída"""
        notificacion = self.get_object()
        notificacion.leida = True
        notificacion.save()
        return Response(self.get_serializer(notificacion).data)
    
    @action(detail=False, methods=['post'])
    def marcar_todas_leidas(self, request):
        """Marcar todas las notificaciones como leídas"""
        usuario_id = request.data.get('usuario_id')
        if not usuario_id:
            return Response({'error': 'usuario_id requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        Notificacion.objects.filter(usuario_id=usuario_id, leida=False).update(leida=True)
        return Response({'mensaje': 'Todas las notificaciones marcadas como leídas'})


class DispositivoUsuarioViewSet(viewsets.ModelViewSet):
    queryset = DispositivoUsuario.objects.all()
    serializer_class = DispositivoUsuarioSerializer
