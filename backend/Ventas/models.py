from django.db import models
from Cliente.models import Cliente
from Empleados.models import Empleado
from Producto.models import Producto

class Venta(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.RESTRICT, related_name='ventas')
    vendedor = models.ForeignKey(Empleado, on_delete=models.SET_NULL, null=True, blank=True, related_name='ventas')
    fecha_venta = models.DateTimeField(auto_now_add=True)
    monto_total = models.DecimalField(max_digits=10, decimal_places=2)
    metodo_pago = models.CharField(max_length=50, blank=True, null=True)
    referencia_pago = models.CharField(max_length=255, blank=True, null=True)
    estado = models.CharField(max_length=50, default='Completada')
    
    class Meta:
        db_table = 'venta'
        ordering = ['-fecha_venta']
    
    def __str__(self):
        return f"Venta #{self.id} - {self.cliente.nombre_completo} - ${self.monto_total}"


class VentaDetalle(models.Model):
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.RESTRICT)
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'venta_detalle'
    
    def save(self, *args, **kwargs):
        # Calcular subtotal automáticamente
        self.subtotal = self.cantidad * self.precio_unitario
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.producto.nombre} x {self.cantidad}"
