from rest_framework import serializers
from .models import Empleado
from Usuarios.models import Usuario

class EmpleadoSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    usuario_correo = serializers.CharField(source='usuario.correo', read_only=True)
    
    class Meta:
        model = Empleado
        fields = [
            'id', 
            'usuario', 
            'usuario_username',
            'nombre_completo', 
            'telefono', 
            'ci', 
            'rol', 
            'direccion',
            'fecha_contratacion',
            'salario',
            'estado'
        ]
        read_only_fields = ['fecha_contratacion', 'estado']
        extra_kwargs = {
            'usuario': {'required': False, 'allow_null': True}
        }
    
    def validate_ci(self, value):
        # Validar que el CI sea único (solo para empleados activos)
        empleado_id = self.instance.id if self.instance else None
        if Empleado.objects.filter(ci=value, estado=True).exclude(id=empleado_id).exists():
            raise serializers.ValidationError("Ya existe un empleado activo con este CI")
        return value
    
class EmpleadoCreateSerializer(serializers.Serializer):
    """Serializer para crear empleado con usuario asociado"""
    # Datos del usuario
    username = serializers.CharField(max_length=50)
    correo = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    tipo_usuario = serializers.CharField(max_length=20, default='empleado')
    
    # Datos del empleado
    nombre_completo = serializers.CharField(max_length=150)
    telefono = serializers.CharField(max_length=20)
    ci = serializers.CharField(max_length=20)
    rol = serializers.CharField(max_length=50)
    direccion = serializers.CharField()
    salario = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    
    def validate_username(self, value):
        if Usuario.objects.filter(username=value, estado=True).exists():
            raise serializers.ValidationError("Este username ya está en uso")
        return value
    
    def validate_correo(self, value):
        if Usuario.objects.filter(correo=value, estado=True).exists():
            raise serializers.ValidationError("Este correo ya está en uso")
        return value
    
    def validate_ci(self, value):
        if Empleado.objects.filter(ci=value, estado=True).exists():
            raise serializers.ValidationError("Ya existe un empleado activo con este CI")
        return value
    
    def create(self, validated_data):
        # Crear usuario
        usuario = Usuario.objects.create(
            username=validated_data['username'],
            correo=validated_data['correo'],
            password=validated_data['password'],
            tipo_usuario=validated_data.get('tipo_usuario', 'empleado')
        )
        
        # Crear empleado
        empleado = Empleado.objects.create(
            usuario=usuario,
            nombre_completo=validated_data['nombre_completo'],
            telefono=validated_data['telefono'],
            ci=validated_data['ci'],
            rol=validated_data['rol'],
            direccion=validated_data['direccion'],
            salario=validated_data.get('salario')
        )
        
        return empleado