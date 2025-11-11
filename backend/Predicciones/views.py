from rest_framework import viewsets
from .models import PrediccionVentas
from .serializers import PrediccionVentasSerializer

class PrediccionVentasViewSet(viewsets.ModelViewSet):
    queryset = PrediccionVentas.objects.all()
    serializer_class = PrediccionVentasSerializer
