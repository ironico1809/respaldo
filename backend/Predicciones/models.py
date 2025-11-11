from django.db import models
from Producto.models import Categoria

class PrediccionVentas(models.Model):
    fecha_prediccion = models.DateField()
    monto_predicho = models.DecimalField(max_digits=10, decimal_places=2)
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True, related_name='predicciones')
    fecha_generacion = models.DateTimeField(auto_now_add=True)
    modelo_usado = models.CharField(max_length=100, default='Random Forest Regressor')
    
    class Meta:
        db_table = 'prediccion_ventas'
        ordering = ['-fecha_prediccion']
    
    def __str__(self):
        return f"Predicción {self.fecha_prediccion} - ${self.monto_predicho}"
