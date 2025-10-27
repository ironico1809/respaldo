from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from .jwt_utils import decode_token
from .models import Usuario

def jwt_required(view_func):
    """
    Decorador para proteger vistas con JWT
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        # Obtener el token del header
        auth_header = request.headers.get('Authorization', None)
        
        if not auth_header:
            return Response(
                {'error': 'Token no proporcionado'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # El formato debe ser: "Bearer <token>"
        parts = auth_header.split()
        
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return Response(
                {'error': 'Formato de token inválido. Use: Bearer <token>'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        token = parts[1]
        
        # Decodificar y validar el token
        payload = decode_token(token)
        
        if payload is None:
            return Response(
                {'error': 'Token inválido o expirado'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Verificar que el usuario existe
        try:
            user = Usuario.objects.get(id=payload['id'])
            request.user = user  # Agregar usuario al request
        except Usuario.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        return view_func(request, *args, **kwargs)
    
    return wrapper