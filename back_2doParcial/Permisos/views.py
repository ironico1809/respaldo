from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Permiso
from .serializers import PermisoSerializer
from Usuarios.decorators import jwt_required


# GET /api/permisos/ - Listar todos los permisos (PROTEGIDA)
@api_view(['GET'])
@jwt_required
def listar_permisos(request):
    permisos = Permiso.objects.all()
    serializer = PermisoSerializer(permisos, many=True)
    return Response(serializer.data)


# GET /api/permisos/usuario/{usuario_id}/ - Listar permisos de un usuario específico (PROTEGIDA)
@api_view(['GET'])
@jwt_required
def listar_permisos_por_usuario(request, usuario_id):
    permisos = Permiso.objects.filter(usuario_id=usuario_id)
    serializer = PermisoSerializer(permisos, many=True)
    return Response(serializer.data)


# GET /api/permisos/{id}/ - Obtener un permiso específico (PROTEGIDA)
@api_view(['GET'])
@jwt_required
def obtener_permiso(request, pk):
    try:
        permiso = Permiso.objects.get(pk=pk)
        serializer = PermisoSerializer(permiso)
        return Response(serializer.data)
    except Permiso.DoesNotExist:
        return Response({'error': 'Permiso no encontrado'}, status=status.HTTP_404_NOT_FOUND)


# POST /api/permisos/crear/ - Crear un permiso (PROTEGIDA)
@api_view(['POST'])
@jwt_required
def crear_permiso(request):
    serializer = PermisoSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# PUT /api/permisos/{id}/actualizar/ - Actualizar un permiso (PROTEGIDA)
@api_view(['PUT'])
@jwt_required
def actualizar_permiso(request, pk):
    try:
        permiso = Permiso.objects.get(pk=pk)
    except Permiso.DoesNotExist:
        return Response({'error': 'Permiso no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    serializer = PermisoSerializer(permiso, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# DELETE /api/permisos/{id}/eliminar/ - Eliminar permiso (PROTEGIDA)
@api_view(['DELETE'])
@jwt_required
def eliminar_permiso(request, pk):
    try:
        permiso = Permiso.objects.get(pk=pk)
        permiso.delete()
        return Response({'message': 'Permiso eliminado correctamente'}, status=status.HTTP_200_OK)
    except Permiso.DoesNotExist:
        return Response({'error': 'Permiso no encontrado'}, status=status.HTTP_404_NOT_FOUND)
