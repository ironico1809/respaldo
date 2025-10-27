from django.db import models

class Cliente(models.Model):
    nombre_completo = models.CharField(max_length=150)
    telefono = models.CharField(max_length=20, unique=True)
    direccion = models.TextField()
    ci = models.CharField(max_length=20, unique=True)
    fecha_registro = models.DateField(auto_now_add=True)
    estado = models.BooleanField(default=True)  # True = Activo, False = Inactivo (eliminación lógica)

    class Meta:
        db_table = 'clientes'
        ordering = ['-id']

    def delete(self, *args, **kwargs):
        """Eliminación lógica"""
        self.estado = False
        self.save()

    def restaurar(self):
        """Restaurar cliente eliminado"""
        self.estado = True
        self.save()

    def __str__(self):
        return f"{self.nombre_completo} ({self.ci})"
