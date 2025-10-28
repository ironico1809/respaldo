from django.utils import timezone
from .models import Bitacora
from Usuarios.models import Usuario

def registrar_accion_bitacora(request, accion, descripcion, usuario_obj=None):
    """
    Una función centralizada para registrar acciones en la bitácora.
    Acepta un objeto de usuario opcional para vistas públicas como login o registro.
    """
    username = "Anónimo"
    
    if usuario_obj:
        username = usuario_obj.username
    else:
        # Si no se pasa un usuario, intentamos obtenerlo del request (para vistas protegidas)
        # El decorador @jwt_required se encarga de asignar el usuario autenticado a request.user.
        if hasattr(request, 'user') and isinstance(request.user, Usuario):
            username = request.user.username

    Bitacora.objects.create(
        username=username,
        ip=request.META.get('REMOTE_ADDR'),
        fecha_hora=timezone.now(),
        accion=accion,
        descripcion=descripcion
    )
