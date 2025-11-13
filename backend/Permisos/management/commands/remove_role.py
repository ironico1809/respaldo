from django.core.management.base import BaseCommand, CommandError
from Permisos.models import Rol

class Command(BaseCommand):
    help = "Desactiva (soft delete) o elimina (hard) un rol por nombre"

    def add_arguments(self, parser):
        parser.add_argument('--name', required=True, help='Nombre del rol a eliminar/desactivar')
        parser.add_argument('--hard', action='store_true', help='Eliminar definitivamente (cascade)')

    def handle(self, *args, **options):
        name = options['name']
        hard = options['hard']

        try:
            rol = Rol.objects.get(nombre=name)
        except Rol.DoesNotExist:
            raise CommandError(f"Rol '{name}' no existe")

        if hard:
            rol.delete()
            self.stdout.write(self.style.SUCCESS(f"Rol '{name}' eliminado definitivamente (cascade)."))
        else:
            if not rol.activo:
                self.stdout.write(self.style.WARNING(f"Rol '{name}' ya estaba desactivado."))
                return
            rol.activo = False
            rol.save()
            self.stdout.write(self.style.SUCCESS(f"Rol '{name}' desactivado (soft delete)."))