from django.urls import path
from .views import ProductoListCreate, ProductoDetail, product_list, ProductoTiposView, ProductoStockBajoView,ProductoPorTipoView,ProductoOrdenadoPorPrecioView,ProductoPrecioDolarView,ProductoPrecioEuroView,add_product

urlpatterns = [
    path('', product_list, name='product-list'),
    path('productos/', ProductoListCreate.as_view(), name='productos-list-create'),
    path('productos/<int:pk>/', ProductoDetail.as_view(), name='producto-detail'),
    path('productos/tipos', ProductoTiposView.as_view(), name='producto-tipos'),
    path('productos/tipos/<str:tipo>/', ProductoPorTipoView.as_view(), name='productos-por-tipo'),
    path('productos/stock-bajo/', ProductoStockBajoView.as_view(), name='productos-stock-bajo'),
    path('productos/ordenado-precio/', ProductoOrdenadoPorPrecioView.as_view(), name='productos-ordenado-precio'),
    path('productos/precio-dolar/', ProductoPrecioDolarView.as_view(), name='productos-precio-dolar'),
    path('productos/precio-euro/', ProductoPrecioEuroView.as_view(), name='productos-precio-euro'),
    path('add/', add_product, name='add-product'),      
] 