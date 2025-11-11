from django.db import models
from Usuarios.models import Usuario

class Notificacion(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='notificaciones')
    titulo = models.CharField(max_length=255)
    mensaje = models.TextField()
    leida = models.BooleanField(default=False)
    fecha_envio = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notificacion'
        ordering = ['-fecha_envio']
    
    def __str__(self):
        return f"{self.titulo} - {self.usuario.username}"


class DispositivoUsuario(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='dispositivos')
    fcm_token = models.TextField()
    plataforma = models.CharField(max_length=20, blank=True, null=True)
    ultimo_acceso = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'dispositivo_usuario'
    
    def __str__(self):
        return f"{self.usuario.username} - {self.plataforma}"
