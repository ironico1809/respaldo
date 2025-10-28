import jwt
import datetime
from django.conf import settings

def generate_token(user):
    """
    Genera un JWT token con información del usuario
    """
    payload = {
        'id': user.id,
        'username': user.username,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=settings.JWT_EXP_DELTA_HOURS),
        'iat': datetime.datetime.utcnow()
    }
    
    token = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    
    return token


def decode_token(token):
    """
    Decodifica y valida un JWT token
    Retorna el payload si es válido, None si no lo es
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None  # Token expirado
    except jwt.InvalidTokenError:
        return None  # Token inválido