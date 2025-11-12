from django.core.management.base import BaseCommand
from Permisos.models import PermisoModulo, Rol, RolPermiso

class Command(BaseCommand):
    help = 'Inicializa los módulos del sistema y crea roles por defecto'

    def handle(self, *args, **kwargs):
        self.stdout.write('Inicializando módulos del sistema...')
        
        # Crear módulos del sistema
        modulos_data = [
            {
                'modulo': 'dashboard',
                'nombre_menu': 'Dashboard Principal',
                'ruta': '/dashboard',
                'icono': 'chart',
                'orden': 1
            },
            {
                'modulo': 'predicciones',
                'nombre_menu': 'Predicción de Ventas (IA)',
                'ruta': '/predicciones',
                'icono': 'brain',
                'orden': 2
            },
            {
                'modulo': 'usuarios',
                'nombre_menu': 'Gestionar Usuarios',
                'ruta': '/gestionar-usuarios',
                'icono': 'users',
                'orden': 3
            },
            {
                'modulo': 'roles',
                'nombre_menu': 'Roles y Permisos',
                'ruta': '/gestionar-roles-permisos',
                'icono': 'shield',
                'orden': 4
            },
            {
                'modulo': 'bitacora',
                'nombre_menu': 'Bitácora de Actividad',
                'ruta': '/gestionar-bitacora',
                'icono': 'file-text',
                'orden': 5
            },
            {
                'modulo': 'clientes',
                'nombre_menu': 'Gestionar Clientes',
                'ruta': '/gestionar-clientes',
                'icono': 'user-group',
                'orden': 6
            },
            {
                'modulo': 'ventas',
                'nombre_menu': 'Gestionar Ventas',
                'ruta': '/gestionar-ventas',
                'icono': 'shopping-cart',
                'orden': 7
            },
            {
                'modulo': 'inventario',
                'nombre_menu': 'Gestionar Inventario',
                'ruta': '/gestionar-inventario',
                'icono': 'package',
                'orden': 8
            },
            {
                'modulo': 'catalogo',
                'nombre_menu': 'Catálogo de Productos',
                'ruta': '/catalogo',
                'icono': 'grid',
                'orden': 9
            },
            {
                'modulo': 'carrito',
                'nombre_menu': 'Carrito de Compras',
                'ruta': '/carrito',
                'icono': 'shopping-bag',
                'orden': 10
            },
            {
                'modulo': 'notificaciones',
                'nombre_menu': 'Notificaciones',
                'ruta': '/notificaciones',
                'icono': 'bell',
                'orden': 11
            },
            {
                'modulo': 'reportes',
                'nombre_menu': 'Gestionar Reportes',
                'ruta': '/reportes',
                'icono': 'bar-chart',
                'orden': 12
            },
        ]
        
        for modulo_data in modulos_data:
            modulo, created = PermisoModulo.objects.get_or_create(
                modulo=modulo_data['modulo'],
                defaults={
                    'nombre_menu': modulo_data['nombre_menu'],
                    'ruta': modulo_data['ruta'],
                    'icono': modulo_data.get('icono', ''),
                    'orden': modulo_data.get('orden', 0),
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Módulo creado: {modulo.nombre_menu}'))
            else:
                self.stdout.write(f'  Módulo ya existe: {modulo.nombre_menu}')
        
        # Crear roles por defecto
        self.stdout.write('\nCreando roles por defecto...')
        
        # Rol Administrador (acceso total)
        rol_admin, created = Rol.objects.get_or_create(
            nombre='Administrador',
            defaults={
                'descripcion': 'Acceso completo a todo el sistema',
                'activo': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Rol creado: {rol_admin.nombre}'))
            # Asignar todos los permisos al administrador
            for modulo in PermisoModulo.objects.all():
                RolPermiso.objects.create(
                    rol=rol_admin,
                    permiso_modulo=modulo,
                    puede_ver=True,
                    puede_crear=True,
                    puede_editar=True,
                    puede_eliminar=True
                )
            self.stdout.write('  Permisos completos asignados al Administrador')
        
        # Rol Vendedor
        rol_vendedor, created = Rol.objects.get_or_create(
            nombre='Vendedor',
            defaults={
                'descripcion': 'Acceso a ventas, clientes, catálogo y carrito',
                'activo': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Rol creado: {rol_vendedor.nombre}'))
            # Asignar permisos específicos al vendedor
            modulos_vendedor = ['dashboard', 'clientes', 'ventas', 'catalogo', 'carrito', 'notificaciones']
            for modulo_nombre in modulos_vendedor:
                try:
                    modulo = PermisoModulo.objects.get(modulo=modulo_nombre)
                    RolPermiso.objects.create(
                        rol=rol_vendedor,
                        permiso_modulo=modulo,
                        puede_ver=True,
                        puede_crear=True,
                        puede_editar=True,
                        puede_eliminar=False
                    )
                except PermisoModulo.DoesNotExist:
                    pass
            self.stdout.write('  Permisos de vendedor asignados')
        
        # Rol Cliente
        rol_cliente, created = Rol.objects.get_or_create(
            nombre='Cliente',
            defaults={
                'descripcion': 'Acceso solo a catálogo, carrito y notificaciones',
                'activo': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Rol creado: {rol_cliente.nombre}'))
            # Asignar permisos específicos al cliente
            modulos_cliente = ['catalogo', 'carrito', 'notificaciones']
            for modulo_nombre in modulos_cliente:
                try:
                    modulo = PermisoModulo.objects.get(modulo=modulo_nombre)
                    RolPermiso.objects.create(
                        rol=rol_cliente,
                        permiso_modulo=modulo,
                        puede_ver=True,
                        puede_crear=False,
                        puede_editar=False,
                        puede_eliminar=False
                    )
                except PermisoModulo.DoesNotExist:
                    pass
            self.stdout.write('  Permisos de cliente asignados')
        
        self.stdout.write(self.style.SUCCESS('\n✅ Inicialización completada!'))
        self.stdout.write('\nPróximos pasos:')
        self.stdout.write('1. Asigna roles a los usuarios: POST /api/permisos/usuarios/asignar-rol/')
        self.stdout.write('2. Los usuarios pueden consultar sus permisos: GET /api/permisos/mis-permisos/')
