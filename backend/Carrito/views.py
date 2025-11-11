from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Carrito, CarritoItem
from .serializers import CarritoSerializer, CarritoItemSerializer, AgregarItemSerializer
from Producto.models import Producto

class CarritoViewSet(viewsets.ModelViewSet):
    queryset = Carrito.objects.all()
    serializer_class = CarritoSerializer
    
    @action(detail=False, methods=['get'])
    def mi_carrito(self, request):
        """Obtener carrito del usuario actual"""
        usuario_id = request.query_params.get('usuario_id')
        if not usuario_id:
            return Response({'error': 'usuario_id requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        carrito, created = Carrito.objects.get_or_create(usuario_id=usuario_id)
        serializer = self.get_serializer(carrito)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def agregar_item(self, request, pk=None):
        """Agregar item al carrito"""
        carrito = self.get_object()
        serializer = AgregarItemSerializer(data=request.data)
        
        if serializer.is_valid():
            producto_id = serializer.validated_data['producto_id']
            cantidad = serializer.validated_data['cantidad']
            
            try:
                producto = Producto.objects.get(id=producto_id)
            except Producto.DoesNotExist:
                return Response({'error': 'Producto no encontrado'}, status=status.HTTP_404_NOT_FOUND)
            
            # Verificar si ya existe el item en el carrito
            item, created = CarritoItem.objects.get_or_create(
                carrito=carrito,
                producto=producto,
                defaults={'cantidad': cantidad}
            )
            
            if not created:
                item.cantidad += cantidad
                item.save()
            
            return Response(CarritoSerializer(carrito).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def actualizar_cantidad(self, request, pk=None):
        """Actualizar cantidad de un item"""
        carrito = self.get_object()
        item_id = request.data.get('item_id')
        cantidad = request.data.get('cantidad')
        
        try:
            item = CarritoItem.objects.get(id=item_id, carrito=carrito)
            item.cantidad = cantidad
            item.save()
            return Response(CarritoSerializer(carrito).data)
        except CarritoItem.DoesNotExist:
            return Response({'error': 'Item no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def eliminar_item(self, request, pk=None):
        """Eliminar item del carrito"""
        carrito = self.get_object()
        item_id = request.data.get('item_id')
        
        try:
            item = CarritoItem.objects.get(id=item_id, carrito=carrito)
            item.delete()
            return Response(CarritoSerializer(carrito).data)
        except CarritoItem.DoesNotExist:
            return Response({'error': 'Item no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def vaciar(self, request, pk=None):
        """Vaciar carrito"""
        carrito = self.get_object()
        carrito.items.all().delete()
        return Response(CarritoSerializer(carrito).data)


class CarritoItemViewSet(viewsets.ModelViewSet):
    queryset = CarritoItem.objects.all()
    serializer_class = CarritoItemSerializer
