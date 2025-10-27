from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Cliente
from .serializers import ClienteSerializer
from Usuarios.decorators import jwt_required

# GET /api/clientes/ - Listar clientes activos (PROTEGIDA)
@api_view(['GET'])
@jwt_required
def listar_clientes(request):
    clientes = Cliente.objects.filter(estado=True)
    serializer = ClienteSerializer(clientes, many=True)
    return Response(serializer.data)


# GET /api/clientes/todos/ - Listar todos los clientes, activos e inactivos (PROTEGIDA)
@api_view(['GET'])
@jwt_required
def listar_todos_clientes(request):
    clientes = Cliente.objects.all()
    serializer = ClienteSerializer(clientes, many=True)
    return Response(serializer.data)


# GET /api/clientes/{id}/ - Obtener cliente específico (PROTEGIDA)
@api_view(['GET'])
@jwt_required
def obtener_cliente(request, pk):
    try:
        cliente = Cliente.objects.get(pk=pk, estado=True)
        serializer = ClienteSerializer(cliente)
        return Response(serializer.data)
    except Cliente.DoesNotExist:
        return Response({'error': 'Cliente no encontrado o inactivo'}, status=status.HTTP_404_NOT_FOUND)


# POST /api/clientes/crear/ - Crear cliente (PROTEGIDA)
@api_view(['POST'])
@jwt_required
def crear_cliente(request):
    serializer = ClienteSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# PUT /api/clientes/{id}/actualizar/ - Actualizar cliente (PROTEGIDA)
@api_view(['PUT'])
@jwt_required
def actualizar_cliente(request, pk):
    try:
        cliente = Cliente.objects.get(pk=pk, estado=True)
    except Cliente.DoesNotExist:
        return Response({'error': 'Cliente no encontrado o inactivo'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ClienteSerializer(cliente, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# DELETE /api/clientes/{id}/eliminar/ - Eliminación lógica (PROTEGIDA)
@api_view(['DELETE'])
@jwt_required
def eliminar_cliente(request, pk):
    try:
        cliente = Cliente.objects.get(pk=pk, estado=True)
        cliente.delete()  # eliminación lógica
        return Response({'message': 'Cliente eliminado correctamente (eliminación lógica)'}, status=status.HTTP_200_OK)
    except Cliente.DoesNotExist:
        return Response({'error': 'Cliente no encontrado o ya inactivo'}, status=status.HTTP_404_NOT_FOUND)


# POST /api/clientes/{id}/restaurar/ - Restaurar cliente eliminado (PROTEGIDA)
@api_view(['POST'])
@jwt_required
def restaurar_cliente(request, pk):
    try:
        cliente = Cliente.objects.get(pk=pk, estado=False)
        cliente.restaurar()
        serializer = ClienteSerializer(cliente)
        return Response({'message': 'Cliente restaurado correctamente', 'cliente': serializer.data}, status=status.HTTP_200_OK)
    except Cliente.DoesNotExist:
        return Response({'error': 'Cliente no encontrado o ya activo'}, status=status.HTTP_404_NOT_FOUND)
