;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;v1.1
;author: Nicolas Vasquez, Cristell Cadiu, Joaquín Gallegos
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

Proyecto API/Webservice Inventario Automotriz MClari en Django: Instrucciones de Instalación y Ejecución

===============================================
Requisitos Previos
===============================================

- Python 3.6 o superior
- pip 

===============================================
Instrucciones para Configurar el Proyecto
===============================================

Se recomienda usar virtualenv e instalar dependencias dentro
python -m venv nombre_entorno

linux/mac:
source nombre_entorno/bin/activate
(comando "deactivate" para desactivar)

windows/hasefroch:
nombre_entorno\Scripts\activate
(comando "deactivate" para desactivar)

*para instalar dependencias "dentro" del entorno virtual, se debe activar primero, instalar después.

Para instalar dependencias:
pip install -r requirements.txt


Ejecutar el servidor de desarrollo:

cd myproject
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
Abrir el navegador web y navegar a `http://127.0.0.1:8000` para ver el proyecto en ejecución.


ref:
https://www.freecodecamp.org/espanol/news/entornos-virtuales-de-python-explicados-con-ejemplos/
https://codigofacilito.com/articulos/entornos-virtuales-python
