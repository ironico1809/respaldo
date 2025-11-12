from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Carrito, CarritoItem
from .serializers import CarritoSerializer, CarritoItemSerializer, AgregarItemSerializer
from Producto.models import Producto

class CarritoViewSet(viewsets.ModelViewSet):
    queryset = Carrito.objects.all()
    serializer_class = CarritoSerializer
    
    @action(detail=False, methods=['get'])
    def mi_carrito(self, request):
        """Obtener carrito del usuario actual o por usuario_id"""
        usuario_id = request.query_params.get('usuario_id', 1)  # Default usuario 1 para demo
        
        carrito, created = Carrito.objects.get_or_create(usuario_id=usuario_id)
        serializer = self.get_serializer(carrito)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def agregar_item(self, request):
        """Agregar item al carrito"""
        usuario_id = request.data.get('usuario_id', 1)
        producto_id = request.data.get('producto_id')
        cantidad = request.data.get('cantidad', 1)
        
        if not producto_id:
            return Response({'error': 'producto_id requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            producto = Producto.objects.get(id=producto_id, estado="Activo")
            
            # Verificar stock
            if producto.stock < cantidad:
                return Response({
                    'error': f'Stock insuficiente. Solo hay {producto.stock} unidades disponibles'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            carrito, created = Carrito.objects.get_or_create(usuario_id=usuario_id)
            
            # Verificar si ya existe el item en el carrito
            item, item_created = CarritoItem.objects.get_or_create(
                carrito=carrito,
                producto=producto,
                defaults={'cantidad': cantidad}
            )
            
            if not item_created:
                nueva_cantidad = item.cantidad + cantidad
                if producto.stock < nueva_cantidad:
                    return Response({
                        'error': f'Stock insuficiente. Solo hay {producto.stock} unidades disponibles'
                    }, status=status.HTTP_400_BAD_REQUEST)
                item.cantidad = nueva_cantidad
                item.save()
            
            return Response({
                'message': 'Producto agregado al carrito',
                'carrito': CarritoSerializer(carrito).data
            })
        
        except Producto.DoesNotExist:
            return Response({'error': 'Producto no encontrado o inactivo'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def actualizar_cantidad(self, request):
        """Actualizar cantidad de un item"""
        usuario_id = request.data.get('usuario_id', 1)
        item_id = request.data.get('item_id')
        cantidad = request.data.get('cantidad')
        
        if not item_id or not cantidad:
            return Response({'error': 'item_id y cantidad requeridos'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            carrito = Carrito.objects.get(usuario_id=usuario_id)
            item = CarritoItem.objects.get(id=item_id, carrito=carrito)
            
            # Verificar stock
            if item.producto.stock < cantidad:
                return Response({
                    'error': f'Stock insuficiente. Solo hay {item.producto.stock} unidades disponibles'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            item.cantidad = cantidad
            item.save()
            
            return Response({
                'message': 'Cantidad actualizada',
                'carrito': CarritoSerializer(carrito).data
            })
        except (Carrito.DoesNotExist, CarritoItem.DoesNotExist):
            return Response({'error': 'Item no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def eliminar_item(self, request):
        """Eliminar item del carrito"""
        usuario_id = request.data.get('usuario_id', 1)
        item_id = request.data.get('item_id')
        
        if not item_id:
            return Response({'error': 'item_id requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            carrito = Carrito.objects.get(usuario_id=usuario_id)
            item = CarritoItem.objects.get(id=item_id, carrito=carrito)
            item.delete()
            
            return Response({
                'message': 'Item eliminado del carrito',
                'carrito': CarritoSerializer(carrito).data
            })
        except (Carrito.DoesNotExist, CarritoItem.DoesNotExist):
            return Response({'error': 'Item no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def vaciar(self, request):
        """Vaciar carrito"""
        usuario_id = request.data.get('usuario_id', 1)
        
        try:
            carrito = Carrito.objects.get(usuario_id=usuario_id)
            carrito.items.all().delete()
            
            return Response({
                'message': 'Carrito vaciado',
                'carrito': CarritoSerializer(carrito).data
            })
        except Carrito.DoesNotExist:
            return Response({'error': 'Carrito no encontrado'}, status=status.HTTP_404_NOT_FOUND)


class CarritoItemViewSet(viewsets.ModelViewSet):
    queryset = CarritoItem.objects.all()
    serializer_class = CarritoItemSerializer
