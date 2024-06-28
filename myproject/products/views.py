from django.shortcuts import render, redirect
from django.db.models import Q
from rest_framework import generics, views
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Producto
from .serializers import ProductoSerializer
from .forms import ProductoForm
import requests
from rest_framework.response import Response
from rest_framework.views import APIView
from decimal import Decimal
from django.conf import settings
from rest_framework.pagination import PageNumberPagination

# API MINDICADOR

def get_exchange_rate(currency):
    try:
        response = requests.get(f'https://mindicador.cl/api/{currency}')
        data = response.json()
        return data['serie'][0]['valor']
    except (requests.RequestException, KeyError, IndexError):
        return 1  
    

#API F1


import requests
from django.conf import settings
from django.shortcuts import render
from .models import Producto

def get_latest_race_info():
    ergast_url = "https://ergast.com/api/f1/current/last/results.json"
    response = requests.get(ergast_url)
    if response.status_code == 200:
        data = response.json()
        race_info = data['MRData']['RaceTable']['Races'][0]
        return race_info
    else:
        return None

def get_driver_headshot(driver_number):
    openf1_url = f"https://api.openf1.org/v1/drivers?driver_number={driver_number}"
    headers = {
        "Authorization": f"Bearer {settings.OPENF1_API_KEY}"
    }
    response = requests.get(openf1_url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        if data:
            return data[0]['headshot_url'], data[0]['team_name'], data[0]['team_colour']
    return None, None, None

def product_list(request):
    products = Producto.objects.all()
    exchange_rate = get_exchange_rate('dolar')
    race_info = get_latest_race_info()
    if race_info:
        top_3_pilots = race_info['Results'][:3]
        for pilot in top_3_pilots:
            headshot_url, team_name, team_colour = get_driver_headshot(pilot['Driver']['permanentNumber'])
            pilot['headshot_url'] = headshot_url
            pilot['team_name'] = team_name
            pilot['team_colour'] = team_colour
    else:
        top_3_pilots = []

    context = {
        'products': products,
        'exchange_rate': exchange_rate,
        'top_3_pilots': top_3_pilots,
        'race_info': race_info,
    }
    return render(request, 'products/list.html', context)


def add_product(request):
    if request.method == 'POST':
        form = ProductoForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('product-list')
    else:
        form = ProductoForm()
    return render(request, 'products/add_product.html', {'form': form})

#DRF

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 9
    page_size_query_param = 'page_size'
    max_page_size = 100

class ProductoListCreate(generics.ListCreateAPIView):
    queryset = Producto.objects.all().order_by('id')  
    serializer_class = ProductoSerializer
    parser_classes = [MultiPartParser, FormParser]
    pagination_class = StandardResultsSetPagination 

    def get_queryset(self):
        queryset = super().get_queryset()
        query = self.request.query_params.get('search')
        sort_option = self.request.query_params.get('sort')
        
        if query:
            queryset = queryset.filter(Q(nombre__icontains=query) | Q(marca__icontains=query) | Q(tipo__icontains=query))
        
        if sort_option:
            if sort_option == 'precio_asc':
                queryset = queryset.order_by('precio_valor')
            elif sort_option == 'precio_desc':
                queryset = queryset.order_by('-precio_valor')
            elif sort_option == 'marca_asc':
                queryset = queryset.order_by('marca')
            elif sort_option == 'marca_desc':
                queryset = queryset.order_by('-marca')
            elif sort_option == 'tipo_asc':
                queryset = queryset.order_by('tipo')
            elif sort_option == 'tipo_desc':
                queryset = queryset.order_by('-tipo')
            elif sort_option == 'stock_asc':
                queryset = queryset.order_by('stock')
            elif sort_option == 'stock_desc':
                queryset = queryset.order_by('-stock')

        return queryset



# METODOS
class ProductoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

class ProductoTiposView(views.APIView):
    def get(self, request):
        tipos = Producto.objects.values_list('tipo', flat=True).distinct()
        return Response(tipos)

class ProductoStockBajoView(views.APIView):
    def get(self, request):
        productos = Producto.objects.filter(stock__lt=100)
        serializer = ProductoSerializer(productos, many=True)
        return Response(serializer.data)
    
class ProductoPorTipoView(views.APIView):
    def get(self, request, tipo):
        productos = Producto.objects.filter(tipo__icontains=tipo)
        serializer = ProductoSerializer(productos, many=True)
        return Response(serializer.data)
    
class ProductoOrdenadoPorPrecioView(APIView):
    def get(self, request):
        productos = Producto.objects.order_by('-precio_valor')
        serializer = ProductoSerializer(productos, many=True)
        return Response(serializer.data)
    
class ProductoPrecioDolarView(views.APIView):
    def get(self, request):
        exchange_rate = Decimal(get_exchange_rate('dolar'))
        productos = Producto.objects.all()
        for producto in productos:
            producto.precio_valor = producto.precio_valor / exchange_rate
        serializer = ProductoSerializer(productos, many=True)
        return Response(serializer.data)

class ProductoPrecioEuroView(views.APIView):
    def get(self, request):
        exchange_rate = Decimal(get_exchange_rate('euro'))
        productos = Producto.objects.all()
        for producto in productos:
            producto.precio_valor = producto.precio_valor / exchange_rate
        serializer = ProductoSerializer(productos, many=True)
        return Response(serializer.data)
