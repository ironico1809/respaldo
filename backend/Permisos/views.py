from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Permiso, Rol, PermisoModulo, RolPermiso, UsuarioRol
from .serializers import (PermisoSerializer, RolSerializer, PermisoModuloSerializer, 
                          RolPermisoSerializer, UsuarioRolSerializer)
from Usuarios.decorators import jwt_required
from Bitacora.utils import registrar_accion_bitacora


# ============== ENDPOINT PRINCIPAL: Obtener permisos del usuario autenticado ==============
@api_view(['GET'])
@jwt_required
def mis_permisos(request):
    """
    Devuelve todos los módulos a los que el usuario tiene acceso
    según sus roles asignados.
    """
    usuario = request.user
    
    # Obtener todos los roles activos del usuario
    roles_usuario = UsuarioRol.objects.filter(usuario=usuario, activo=True)
    
    if not roles_usuario.exists():
        return Response({
            'modulos': [],
            'mensaje': 'Usuario sin roles asignados'
        })
    
    # Obtener todos los permisos de los roles del usuario
    permisos = []
    modulos_vistos = set()
    
    for usuario_rol in roles_usuario:
        rol_permisos = RolPermiso.objects.filter(
            rol=usuario_rol.rol,
            puede_ver=True
        ).select_related('permiso_modulo')
        
        for rp in rol_permisos:
            if rp.permiso_modulo.modulo not in modulos_vistos:
                permisos.append({
                    'modulo': rp.permiso_modulo.modulo,
                    'nombre_menu': rp.permiso_modulo.nombre_menu,
                    'ruta': rp.permiso_modulo.ruta,
                    'icono': rp.permiso_modulo.icono,
                    'puede_ver': rp.puede_ver,
                    'puede_crear': rp.puede_crear,
                    'puede_editar': rp.puede_editar,
                    'puede_eliminar': rp.puede_eliminar,
                })
                modulos_vistos.add(rp.permiso_modulo.modulo)
    
    return Response({
        'modulos': permisos,
        'total': len(permisos)
    })


# ============== GESTIÓN DE ROLES ==============
@api_view(['GET'])
@jwt_required
def listar_roles(request):
    roles = Rol.objects.filter(activo=True)
    serializer = RolSerializer(roles, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@jwt_required
def obtener_rol(request, pk):
    try:
        rol = Rol.objects.get(pk=pk)
        serializer = RolSerializer(rol)
        return Response(serializer.data)
    except Rol.DoesNotExist:
        return Response({'error': 'Rol no encontrado'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@jwt_required
def crear_rol(request):
    serializer = RolSerializer(data=request.data)
    if serializer.is_valid():
        rol = serializer.save()
        registrar_accion_bitacora(
            request=request,
            accion="Creación de Rol",
            descripcion=f"Se creó el rol '{rol.nombre}'. Descripción: {rol.descripcion}. Estado: {'Activo' if rol.activo else 'Inactivo'}."
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@jwt_required
def actualizar_rol(request, pk):
    try:
        rol = Rol.objects.get(pk=pk)
        nombre_anterior = rol.nombre
        estado_anterior = rol.activo
    except Rol.DoesNotExist:
        return Response({'error': 'Rol no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    serializer = RolSerializer(rol, data=request.data, partial=True)
    if serializer.is_valid():
        rol = serializer.save()
        
        # Construir descripción detallada de cambios
        cambios = []
        if nombre_anterior != rol.nombre:
            cambios.append(f"Nombre: '{nombre_anterior}' → '{rol.nombre}'")
        if estado_anterior != rol.activo:
            cambios.append(f"Estado: {'Activo' if estado_anterior else 'Inactivo'} → {'Activo' if rol.activo else 'Inactivo'}")
        if 'descripcion' in request.data:
            cambios.append(f"Descripción actualizada")
        
        cambios_texto = '; '.join(cambios) if cambios else 'Sin cambios significativos'
        
        registrar_accion_bitacora(
            request=request,
            accion="Actualización de Rol",
            descripcion=f"Se actualizó el rol '{rol.nombre}'. Cambios: {cambios_texto}."
        )
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@jwt_required
def eliminar_rol(request, pk):
    try:
        rol = Rol.objects.get(pk=pk)
        nombre = rol.nombre
        
        # Contar usuarios y permisos afectados
        usuarios_afectados = UsuarioRol.objects.filter(rol=rol, activo=True).count()
        permisos_asociados = RolPermiso.objects.filter(rol=rol).count()
        
        rol.activo = False
        rol.save()
        registrar_accion_bitacora(
            request=request,
            accion="Desactivación de Rol",
            descripcion=f"Se desactivó el rol '{nombre}'. Usuarios afectados: {usuarios_afectados}. Permisos asociados: {permisos_asociados}."
        )
        return Response({'message': 'Rol desactivado correctamente'}, status=status.HTTP_200_OK)
    except Rol.DoesNotExist:
        return Response({'error': 'Rol no encontrado'}, status=status.HTTP_404_NOT_FOUND)


# ============== GESTIÓN DE PERMISOS DE ROL ==============
@api_view(['POST'])
@jwt_required
def asignar_permiso_a_rol(request):
    """
    Asigna un permiso de módulo a un rol
    Body: {
        "rol_id": 1,
        "permiso_modulo_id": 1,
        "puede_ver": true,
        "puede_crear": false,
        "puede_editar": false,
        "puede_eliminar": false
    }
    """
    rol_id = request.data.get('rol_id')
    permiso_modulo_id = request.data.get('permiso_modulo_id')
    
    try:
        rol = Rol.objects.get(id=rol_id)
        permiso_modulo = PermisoModulo.objects.get(id=permiso_modulo_id)
        
        # Construir lista de permisos otorgados
        permisos_otorgados = []
        if request.data.get('puede_ver', True):
            permisos_otorgados.append('Ver')
        if request.data.get('puede_crear', False):
            permisos_otorgados.append('Crear')
        if request.data.get('puede_editar', False):
            permisos_otorgados.append('Editar')
        if request.data.get('puede_eliminar', False):
            permisos_otorgados.append('Eliminar')
        
        permisos_texto = ', '.join(permisos_otorgados) if permisos_otorgados else 'Ninguno'
        
        rol_permiso, created = RolPermiso.objects.update_or_create(
            rol=rol,
            permiso_modulo=permiso_modulo,
            defaults={
                'puede_ver': request.data.get('puede_ver', True),
                'puede_crear': request.data.get('puede_crear', False),
                'puede_editar': request.data.get('puede_editar', False),
                'puede_eliminar': request.data.get('puede_eliminar', False),
            }
        )
        
        action = "Asignación" if created else "Actualización"
        registrar_accion_bitacora(
            request=request,
            accion=f"{action} de Permiso",
            descripcion=f"{action} de permiso para el rol '{rol.nombre}' en el módulo '{permiso_modulo.nombre_menu}'. Permisos CRUD: {permisos_texto}."
        )
        
        serializer = RolPermisoSerializer(rol_permiso)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
    except Rol.DoesNotExist:
        return Response({'error': 'Rol no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except PermisoModulo.DoesNotExist:
        return Response({'error': 'Módulo no encontrado'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@jwt_required
def quitar_permiso_de_rol(request, rol_id, permiso_modulo_id):
    """
    Quita un permiso de módulo de un rol
    """
    try:
        rol_permiso = RolPermiso.objects.get(rol_id=rol_id, permiso_modulo_id=permiso_modulo_id)
        rol_nombre = rol_permiso.rol.nombre
        modulo_nombre = rol_permiso.permiso_modulo.nombre_menu
        
        # Obtener permisos antes de eliminar para el registro
        permisos_eliminados = []
        if rol_permiso.puede_ver:
            permisos_eliminados.append('Ver')
        if rol_permiso.puede_crear:
            permisos_eliminados.append('Crear')
        if rol_permiso.puede_editar:
            permisos_eliminados.append('Editar')
        if rol_permiso.puede_eliminar:
            permisos_eliminados.append('Eliminar')
        
        permisos_texto = ', '.join(permisos_eliminados) if permisos_eliminados else 'Ninguno'
        
        rol_permiso.delete()
        
        registrar_accion_bitacora(
            request=request,
            accion="Eliminación de Permiso",
            descripcion=f"Se eliminó el permiso del módulo '{modulo_nombre}' del rol '{rol_nombre}'. Permisos CRUD eliminados: {permisos_texto}."
        )
        
        return Response({'message': 'Permiso eliminado del rol correctamente'}, status=status.HTTP_200_OK)
    except RolPermiso.DoesNotExist:
        return Response({'error': 'Permiso no encontrado en el rol'}, status=status.HTTP_404_NOT_FOUND)


# ============== GESTIÓN DE ASIGNACIÓN DE ROLES A USUARIOS ==============
@api_view(['POST'])
@jwt_required
def asignar_rol_a_usuario(request):
    """
    Asigna un rol a un usuario
    Body: {
        "usuario_id": 1,
        "rol_id": 1
    }
    """
    serializer = UsuarioRolSerializer(data=request.data)
    if serializer.is_valid():
        usuario_rol = serializer.save()
        
        # Obtener cantidad de permisos del rol
        cantidad_permisos = RolPermiso.objects.filter(
            rol=usuario_rol.rol,
            puede_ver=True
        ).count()
        
        registrar_accion_bitacora(
            request=request,
            accion="Asignación de Rol a Usuario",
            descripcion=f"Se asignó el rol '{usuario_rol.rol.nombre}' al usuario '{usuario_rol.usuario.username}' ({usuario_rol.usuario.correo}). El rol tiene acceso a {cantidad_permisos} módulo(s)."
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@jwt_required
def quitar_rol_de_usuario(request, usuario_id, rol_id):
    """
    Quita un rol de un usuario
    """
    try:
        usuario_rol = UsuarioRol.objects.get(usuario_id=usuario_id, rol_id=rol_id)
        usuario_nombre = usuario_rol.usuario.username
        usuario_email = usuario_rol.usuario.correo
        rol_nombre = usuario_rol.rol.nombre
        
        # Obtener cantidad de permisos del rol antes de eliminar
        cantidad_permisos = RolPermiso.objects.filter(
            rol=usuario_rol.rol,
            puede_ver=True
        ).count()
        
        usuario_rol.delete()
        
        registrar_accion_bitacora(
            request=request,
            accion="Eliminación de Rol de Usuario",
            descripcion=f"Se quitó el rol '{rol_nombre}' del usuario '{usuario_nombre}' ({usuario_email}). El usuario ya no tiene acceso a {cantidad_permisos} módulo(s) asociados a este rol."
        )
        
        return Response({'message': 'Rol eliminado del usuario correctamente'}, status=status.HTTP_200_OK)
    except UsuarioRol.DoesNotExist:
        return Response({'error': 'Asignación de rol no encontrada'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@jwt_required
def listar_roles_de_usuario(request, usuario_id):
    """
    Lista todos los roles asignados a un usuario
    """
    roles_usuario = UsuarioRol.objects.filter(usuario_id=usuario_id, activo=True)
    serializer = UsuarioRolSerializer(roles_usuario, many=True)
    return Response(serializer.data)


# ============== GESTIÓN DE MÓDULOS ==============
@api_view(['GET'])
@jwt_required
def listar_modulos(request):
    """
    Lista todos los módulos disponibles en el sistema
    """
    modulos = PermisoModulo.objects.all()
    serializer = PermisoModuloSerializer(modulos, many=True)
    return Response(serializer.data)


# ============== PERMISOS ANTIGUOS (COMPATIBILIDAD) ==============
@api_view(['GET'])
@jwt_required
def listar_permisos(request):
    permisos = Permiso.objects.all()
    serializer = PermisoSerializer(permisos, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@jwt_required
def listar_permisos_por_usuario(request, usuario_id):
    permisos = Permiso.objects.filter(usuario_id=usuario_id)
    serializer = PermisoSerializer(permisos, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@jwt_required
def obtener_permiso(request, pk):
    try:
        permiso = Permiso.objects.get(pk=pk)
        serializer = PermisoSerializer(permiso)
        return Response(serializer.data)
    except Permiso.DoesNotExist:
        return Response({'error': 'Permiso no encontrado'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@jwt_required
def crear_permiso(request):
    serializer = PermisoSerializer(data=request.data)
    if serializer.is_valid():
        permiso = serializer.save()
        registrar_accion_bitacora(
            request=request,
            accion="Creación de Permiso",
            descripcion=f"Se creó el permiso para vista '{permiso.vista}' - usuario ID {permiso.usuario_id}."
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@jwt_required
def actualizar_permiso(request, pk):
    try:
        permiso = Permiso.objects.get(pk=pk)
    except Permiso.DoesNotExist:
        return Response({'error': 'Permiso no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    serializer = PermisoSerializer(permiso, data=request.data, partial=True)
    if serializer.is_valid():
        permiso_actualizado = serializer.save()
        registrar_accion_bitacora(
            request=request,
            accion="Actualización de Permiso",
            descripcion=f"Se actualizó el permiso para vista '{permiso_actualizado.vista}' - usuario ID {permiso_actualizado.usuario_id}."
        )
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@jwt_required
def eliminar_permiso(request, pk):
    try:
        permiso = Permiso.objects.get(pk=pk)
        permiso.delete()
        registrar_accion_bitacora(
            request=request,
            accion="Eliminación de Permiso",
            descripcion=f"Se eliminó el permiso para vista '{permiso.vista}' - usuario ID {permiso.usuario_id}."
        )
        return Response({'message': 'Permiso eliminado correctamente'}, status=status.HTTP_200_OK)
    except Permiso.DoesNotExist:
        return Response({'error': 'Permiso no encontrado'}, status=status.HTTP_404_NOT_FOUND)
