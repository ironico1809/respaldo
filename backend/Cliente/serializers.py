from rest_framework import serializers
from .models import Cliente

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = [
            'id',
            'nombre_completo',
            'correo',
            'telefono',
            'direccion',
            'ci',
            'fecha_registro',
            'estado'
        ]
        read_only_fields = ['fecha_registro', 'estado']

    def validate_ci(self, value):
        cliente_id = self.instance.id if self.instance else None
        if Cliente.objects.filter(ci=value, estado=True).exclude(id=cliente_id).exists():
            raise serializers.ValidationError("Ya existe un cliente activo con este CI")
        return value

    def validate_correo(self, value):
        cliente_id = self.instance.id if self.instance else None
        if Cliente.objects.filter(correo=value, estado=True).exclude(id=cliente_id).exists():
            raise serializers.ValidationError("Ya existe un cliente activo con este correo")
        return value

    def validate_telefono(self, value):
        cliente_id = self.instance.id if self.instance else None
        if Cliente.objects.filter(telefono=value, estado=True).exclude(id=cliente_id).exists():
            raise serializers.ValidationError("Ya existe un cliente activo con este teléfono")
        return value
