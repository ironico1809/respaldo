from django.db import models
from Usuarios.models import Usuario

class ReporteLog(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='reportes')
    prompt_original = models.TextField(blank=True, null=True)
    tipo_archivo = models.CharField(max_length=10)  # 'PDF' o 'EXCEL'
    fecha_generacion = models.DateTimeField(auto_now_add=True)
    archivo_url = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'reporte_log'
        ordering = ['-fecha_generacion']
    
    def __str__(self):
        return f"Reporte {self.tipo_archivo} - {self.usuario.username}"
