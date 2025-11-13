import os
from django.core.management.base import BaseCommand
from Usuarios.models import Usuario

class Command(BaseCommand):
    help = "Crea un usuario inicial para pruebas si no existe"

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, help='Username del usuario de prueba')
        parser.add_argument('--email', type=str, help='Correo del usuario de prueba')
        parser.add_argument('--password', type=str, help='Password plano (se hashea)')
        parser.add_argument('--tipo', type=str, default='admin', help='Tipo de usuario')

    def handle(self, *args, **options):
        username = options.get('username') or os.getenv('SEED_USER_USERNAME', 'admin')
        email = options.get('email') or os.getenv('SEED_USER_EMAIL', 'admin@example.com')
        password = options.get('password') or os.getenv('SEED_USER_PASSWORD', 'Admin123!')
        tipo = options.get('tipo') or os.getenv('SEED_USER_TIPO', 'admin')

        if Usuario.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f"Usuario '{username}' ya existe. No se creó uno nuevo."))
            return

        user = Usuario(
            username=username,
            correo=email,
            password=password,
            tipo_usuario=tipo,
            estado=True,
        )
        user.save()
        self.stdout.write(self.style.SUCCESS(f"Usuario inicial creado: {username} ({email})"))