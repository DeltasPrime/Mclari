from django.db import models
from datetime import date

class Producto(models.Model):
    id = models.AutoField(primary_key=True)
    marca = models.CharField(max_length=100)
    nombre = models.CharField(max_length=100)
    precio_fecha = models.DateField(default=date.today)
    precio_valor = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock = models.IntegerField()
    tipo = models.CharField(max_length=100)
    imagen = models.ImageField(upload_to='productos/', null=True, blank=True)

    def __str__(self):
        return self.nombre