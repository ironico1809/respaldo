from django.db import models
from django.contrib.auth.hashers import make_password, check_password

class Usuario(models.Model):
    username = models.CharField(max_length=50, unique=True)
    correo = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    tipo_usuario = models.CharField(max_length=20)
    estado = models.BooleanField(default=True)  # True = Activo, False = Inactivo (eliminado lógicamente)
    
    class Meta:
        db_table = 'usuarios'
    
    def save(self, *args, **kwargs):
        # Hashear la contraseña antes de guardar
        if not self.password.startswith('pbkdf2_'):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)
    
    def check_password(self, raw_password):
        # Verificar contraseña
        return check_password(raw_password, self.password)
    
    def delete(self, *args, **kwargs):
        # Eliminación lógica
        self.estado = False
        self.save()
    
    def restaurar(self):
        # Método para restaurar un usuario eliminado
        self.estado = True
        self.save()
    
    def __str__(self):
        return self.username

