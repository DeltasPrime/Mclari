from django import forms
from .models import Producto

class ProductoForm(forms.ModelForm):
    class Meta:
        model = Producto
        fields = ['marca', 'nombre', 'precio_fecha', 'precio_valor', 'stock', 'tipo', 'imagen']
