from django.db import models
from Usuarios.models import Usuario

class Permiso(models.Model):
    crear = models.BooleanField(default=False)
    editar = models.BooleanField(default=False)
    eliminar = models.BooleanField(default=False)
    ver = models.BooleanField(default=True)
    vista = models.CharField(max_length=50)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='permisos')

    class Meta:
        db_table = 'permisos'
        unique_together = ('usuario', 'vista')  # opcional: evita duplicados por vista
        ordering = ['id']

    def __str__(self):
        return f"{self.usuario.username} - {self.vista}"
