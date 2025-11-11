from django.db import models
from Usuarios.models import Usuario
from Producto.models import Producto

class Carrito(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='carrito')
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'carrito'
    
    def __str__(self):
        return f"Carrito de {self.usuario.username}"
    
    def total(self):
        """Calcula el total del carrito"""
        return sum(item.subtotal() for item in self.items.all())


class CarritoItem(models.Model):
    carrito = models.ForeignKey(Carrito, on_delete=models.CASCADE, related_name='items')
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.IntegerField(default=1)
    
    class Meta:
        db_table = 'carrito_item'
        unique_together = ('carrito', 'producto')
    
    def subtotal(self):
        """Calcula el subtotal del item"""
        return self.cantidad * self.producto.precio
    
    def __str__(self):
        return f"{self.producto.nombre} x {self.cantidad}"
