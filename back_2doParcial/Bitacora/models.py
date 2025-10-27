from django.db import models

# Create your models here.
class Bitacora (models.Model):
    username = models.CharField(max_length=100)
    ip = models.CharField(max_length=45)
    fecha_hora = models.DateTimeField()
    accion = models.TextField()
    descripcion = models.TextField()

    class Meta :
        db_table = 'bitacora'