from django.db import models
from Usuarios.models import Usuario
# Create your models here.
class Empleado(models.Model):
    usuario = models.OneToOneField(
        Usuario, 
        on_delete=models.CASCADE, 
        related_name='empleado',
        null=True,
        blank=True
    )
    nombre_completo = models.CharField(max_length=150)
    telefono = models.CharField(max_length=20)
    ci = models.CharField(max_length=20, unique=True)
    rol = models.CharField(max_length=50)
    direccion = models.TextField()
    fecha_contratacion = models.DateField(auto_now_add=True)
    salario = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    estado = models.BooleanField(default=True)  # True = Activo, False = Inactivo (eliminado lógicamente)
    
    class Meta:
        db_table = 'empleados'
        ordering = ['-id']
    
    def delete(self, *args, **kwargs):
        # Eliminación lógica
        self.estado = False
        self.save()
    
    def restaurar(self):
        # Método para restaurar un empleado eliminado
        self.estado = True
        self.save()
    
    def __str__(self):
        return f"{self.nombre_completo} - {self.ci}"