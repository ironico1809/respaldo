from django.db import models


class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    estado = models.CharField(max_length=20, default='Activo')

    class Meta:
        db_table = 'categoria'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Producto(models.Model):
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True, related_name='productos')
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True, null=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    stock_minimo = models.IntegerField(default=5)  # Para alertas de inventario crítico
    imagen_url = models.TextField(blank=True, null=True)
    estado = models.CharField(max_length=20, default='Activo')
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'producto'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre

    def es_inventario_critico(self):
        """Verifica si el stock está en nivel crítico"""
        return self.stock <= self.stock_minimo

    def eliminar(self):
        """Eliminación lógica del producto"""
        self.estado = 'Inactivo'
        self.save()

    def restaurar(self):
        """Restauración del producto"""
        self.estado = 'Activo'
        self.save()


class MovimientoInventario(models.Model):
    TIPO_MOVIMIENTO_CHOICES = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
        ('ajuste', 'Ajuste'),
    ]

    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='movimientos')
    tipo_movimiento = models.CharField(max_length=20, choices=TIPO_MOVIMIENTO_CHOICES)
    cantidad = models.IntegerField()
    fecha_movimiento = models.DateTimeField(auto_now_add=True)
    usuario_responsable = models.ForeignKey('Usuarios.Usuario', on_delete=models.SET_NULL, null=True, blank=True)
    motivo = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'movimiento_inventario'
        ordering = ['-fecha_movimiento']

    def __str__(self):
        return f"{self.tipo_movimiento} - {self.producto.nombre} - {self.cantidad}"
