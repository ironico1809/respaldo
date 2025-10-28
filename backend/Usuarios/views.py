from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Usuario
from .serializers import UsuarioSerializer, LoginSerializer
from .jwt_utils import generate_token
from .decorators import jwt_required
from Bitacora.utils import registrar_accion_bitacora

# POST /api/login/ - Login de usuario
@api_view(['POST'])
def login(request):
    serializer = LoginSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    username = serializer.validated_data['username']
    password = serializer.validated_data['password']
    
    try:
        # Buscar usuario por username (solo activos)
        usuario = Usuario.objects.get(username=username, estado=True)
        # Verificar contraseña
        if not usuario.check_password(password):
            return Response(
                {'error': 'Credenciales inválidas'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        # Generar token
        token = generate_token(usuario)
        # Registrar en bitácora
        registrar_accion_bitacora(
            request=request,
            accion="Login",
            descripcion=f"Usuario '{usuario.username}' inició sesión.",
            usuario_obj=usuario  # Pasamos el objeto de usuario explícitamente
        )
        return Response({
            'message': 'Login exitoso',
            'token': token,
            'user': {
                'id': usuario.id,
                'username': usuario.username,
                'correo': usuario.correo,
                'tipo_usuario': usuario.tipo_usuario
            }
        }, status=status.HTTP_200_OK)
    except Usuario.DoesNotExist:
        return Response(
            {'error': 'Credenciales inválidas'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )


# POST /api/usuarios/logout/ - Logout de usuario y registro en bitácora (PROTEGIDA)
@api_view(['POST'])
@jwt_required
def logout_view(request):
    # El decorador @jwt_required ya nos da el usuario en request.user
    usuario = request.user
    
    # Registrar en bitácora
    registrar_accion_bitacora(
        request=request,
        accion="Logout",
        descripcion=f"Usuario '{usuario.username}' cerró sesión."
    )
    
    return Response({'message': 'Logout exitoso y registrado.'}, status=status.HTTP_200_OK)

# GET /api/usuarios/ - Listar usuarios activos (PROTEGIDA)
@api_view(['GET'])
@jwt_required
def listar_usuarios(request):
    usuarios = Usuario.objects.filter(estado=True)
    serializer = UsuarioSerializer(usuarios, many=True)
    return Response(serializer.data)


# GET /api/usuarios/todos/ - Listar todos los usuarios (PROTEGIDA)
@api_view(['GET'])
@jwt_required
def listar_todos_usuarios(request):
    usuarios = Usuario.objects.all()
    serializer = UsuarioSerializer(usuarios, many=True)
    return Response(serializer.data)


# POST /api/usuarios/crear/ - Crear un usuario (PÚBLICA)
@api_view(['POST'])
def crear_usuario(request):
    serializer = UsuarioSerializer(data=request.data)
    if serializer.is_valid():
        usuario = serializer.save()
        # Registrar en bitácora
        registrar_accion_bitacora(
            request=request,
            accion="Creación de Usuario",
            descripcion=f"Se creó el usuario '{usuario.username}' con correo {usuario.correo}.",
            usuario_obj=usuario # Pasamos el objeto de usuario explícitamente
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# GET /api/usuarios/{id}/ - Obtener un usuario específico (PROTEGIDA)
@api_view(['GET'])
@jwt_required
def obtener_usuario(request, pk):
    try:
        usuario = Usuario.objects.get(pk=pk, estado=True)
        serializer = UsuarioSerializer(usuario)
        return Response(serializer.data)
    except Usuario.DoesNotExist:
        return Response(
            {'error': 'Usuario no encontrado o inactivo'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# PUT /api/usuarios/{id}/editar/ - Editar un usuario (PROTEGIDA)
@api_view(['PUT'])
@jwt_required
def editar_usuario(request, pk):
    try:
        usuario = Usuario.objects.get(pk=pk, estado=True)
    except Usuario.DoesNotExist:
        return Response(
            {'error': 'Usuario no encontrado o inactivo'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = UsuarioSerializer(usuario, data=request.data, partial=True)
    if serializer.is_valid():
        usuario_actualizado = serializer.save()
        # Registrar en bitácora
        registrar_accion_bitacora(
            request=request,
            accion="Actualización de Usuario",
            descripcion=f"Se actualizó el usuario '{usuario_actualizado.username}' con correo {usuario_actualizado.correo}."
        )
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# DELETE /api/usuarios/{id}/eliminar/ - Eliminar usuario (PROTEGIDA) - Eliminación lógica
@api_view(['DELETE'])
@jwt_required
def eliminar_usuario(request, pk):
    try:
        usuario = Usuario.objects.get(pk=pk, estado=True)
        usuario.delete()  # Eliminación lógica
        # Registrar en bitácora
        registrar_accion_bitacora(
            request=request,
            accion="Eliminación de Usuario",
            descripcion=f"Se eliminó (lógicamente) el usuario '{usuario.username}' con correo {usuario.correo}."
        )
        return Response(
            {'message': 'Usuario eliminado correctamente (eliminación lógica)'}, 
            status=status.HTTP_200_OK
        )
    except Usuario.DoesNotExist:
        return Response(
            {'error': 'Usuario no encontrado o ya está inactivo'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# POST /api/usuarios/{id}/restaurar/ - Restaurar usuario (PROTEGIDA)
@api_view(['POST'])
@jwt_required
def restaurar_usuario(request, pk):
    try:
        usuario = Usuario.objects.get(pk=pk, estado=False)
        usuario.restaurar()
        serializer = UsuarioSerializer(usuario)
        # Registrar en bitácora
        registrar_accion_bitacora(
            request=request,
            accion="Restauración de Usuario",
            descripcion=f"Se restauró el usuario '{usuario.username}' con correo {usuario.correo}."
        )
        return Response(
            {
                'message': 'Usuario restaurado correctamente',
                'usuario': serializer.data
            }, 
            status=status.HTTP_200_OK
        )
    except Usuario.DoesNotExist:
        return Response(
            {'error': 'Usuario no encontrado o ya está activo'}, 
            status=status.HTTP_404_NOT_FOUND
        )