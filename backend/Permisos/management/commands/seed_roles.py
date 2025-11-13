import os
from django.core.management.base import BaseCommand
from Permisos.models import Rol, PermisoModulo, RolPermiso

DEFAULT_ROLES = [
    {"nombre": "Administrador", "descripcion": "Acceso completo a todo el sistema"},
    {"nombre": "Vendedor", "descripcion": "Acceso a ventas, clientes, catálogo y carrito"},
    {"nombre": "Cliente", "descripcion": "Acceso solo a catálogo, carrito y notificaciones"},
]

DEFAULT_PERMISOS_MODULOS = [
    # modulo, nombre_menu, ruta, orden
    ("dashboard", "Dashboard", "/dashboard", 1),
    ("predicciones", "Predicciones", "/predicciones", 2),
    ("usuarios", "Usuarios", "/usuarios", 3),
    ("roles", "Roles & Permisos", "/roles", 4),
    ("bitacora", "Bitácora", "/bitacora", 5),
    ("clientes", "Clientes", "/clientes", 6),
    ("ventas", "Ventas", "/ventas", 7),
    ("inventario", "Inventario", "/inventario", 8),
    ("catalogo", "Catálogo", "/catalogo", 9),
    ("carrito", "Carrito", "/carrito", 10),
    ("notificaciones", "Notificaciones", "/notificaciones", 11),
    ("reportes", "Reportes", "/reportes", 12),
]

ROLE_PERMISSIONS_MATRIX = {
    # Cada rol define CRUD por módulo
    "Administrador": {"*": {"puede_ver": True, "puede_crear": True, "puede_editar": True, "puede_eliminar": True}},
    "Vendedor": {
        # ventas y clientes con más acciones, catálogo/carrito de lectura (carrito también crear)
        "ventas": {"puede_ver": True, "puede_crear": True},
        "clientes": {"puede_ver": True, "puede_crear": True, "puede_editar": True},
        "catalogo": {"puede_ver": True},
        "carrito": {"puede_ver": True, "puede_crear": True},
    },
    "Cliente": {
        # Solo catálogo, carrito y notificaciones (lectura y creación en carrito)
        "catalogo": {"puede_ver": True},
        "carrito": {"puede_ver": True, "puede_crear": True},
        "notificaciones": {"puede_ver": True},
    },
}


class Command(BaseCommand):
    help = "Crea roles base, módulos y asigna permisos predeterminados"

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Iniciando seed de roles y permisos..."))

        # Crear módulos si faltan
        for modulo, nombre_menu, ruta, orden in DEFAULT_PERMISOS_MODULOS:
            obj, created = PermisoModulo.objects.get_or_create(
                modulo=modulo,
                defaults={
                    "nombre_menu": nombre_menu,
                    "ruta": ruta,
                    "orden": orden,
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f" + Módulo creado: {modulo}"))

        # Crear roles base
        for r in DEFAULT_ROLES:
            rol, created = Rol.objects.get_or_create(nombre=r["nombre"], defaults={"descripcion": r["descripcion"], "activo": True})
            if created:
                self.stdout.write(self.style.SUCCESS(f" + Rol creado: {rol.nombre}"))

            # Asignar permisos
            matrix = ROLE_PERMISSIONS_MATRIX.get(rol.nombre, {})
            for permiso_modulo in PermisoModulo.objects.all():
                perms = matrix.get(permiso_modulo.modulo)
                if not perms:
                    # Si rol admin: wildcard
                    if "*" in matrix:
                        perms = matrix["*"]
                    else:
                        continue

                rol_permiso, created_rp = RolPermiso.objects.get_or_create(
                    rol=rol,
                    permiso_modulo=permiso_modulo,
                    defaults={
                        'puede_ver': perms.get('puede_ver', True),
                        'puede_crear': perms.get('puede_crear', False),
                        'puede_editar': perms.get('puede_editar', False),
                        'puede_eliminar': perms.get('puede_eliminar', False),
                    }
                )
                if created_rp:
                    self.stdout.write(self.style.SUCCESS(f"   - Permisos asignados a rol {rol.nombre} en módulo {permiso_modulo.modulo}"))

        self.stdout.write(self.style.SUCCESS("Seed de roles y permisos completado."))