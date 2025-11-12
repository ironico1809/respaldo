from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import stripe
from decimal import Decimal
from Carrito.models import Carrito, CarritoItem
from Usuarios.decorators import jwt_required

stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(['POST'])
@jwt_required
def create_checkout_session(request):
    """
    Crea una sesión de Stripe Checkout y devuelve la URL de pago.
    El usuario será redirigido a la página de pago de Stripe.
    """
    try:
        # Usar usuario_id=1 por defecto para demo (igual que en el resto de la app)
        usuario_id = request.data.get('usuario_id', 1)
        
        # Obtener o crear el carrito del usuario
        carrito, created = Carrito.objects.get_or_create(usuario_id=usuario_id)
        
        items = CarritoItem.objects.filter(carrito=carrito)
        if not items.exists():
            return Response(
                {'error': 'Tu carrito está vacío'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear los line_items para Stripe
        line_items = []
        for item in items:
            line_items.append({
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': item.producto.nombre,
                        'description': item.producto.descripcion or '',
                    },
                    'unit_amount': int(float(item.producto.precio) * 100),  # Precio en centavos
                },
                'quantity': item.cantidad,
            })
        
        # URLs de éxito y cancelación
        # Cambia estas URLs por las de tu frontend
        success_url = request.data.get('success_url', 'http://localhost:5173/pago-exitoso?session_id={CHECKOUT_SESSION_ID}')
        cancel_url = request.data.get('cancel_url', 'http://localhost:5173/carrito')
        
        # Obtener el usuario para el email
        usuario = carrito.usuario
        
        # Crear la sesión de Checkout
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                'carrito_id': carrito.id,
                'usuario_id': usuario.id,
                'usuario_email': usuario.email if hasattr(usuario, 'email') else '',
            },
            customer_email=usuario.email if hasattr(usuario, 'email') else None,
        )
        
        return Response({
            'checkout_url': checkout_session.url,
            'session_id': checkout_session.id,
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@jwt_required
def verify_checkout_session(request):
    """
    Verifica el estado de la sesión de Stripe Checkout después del pago.
    """
    try:
        session_id = request.query_params.get('session_id')
        
        if not session_id:
            return Response(
                {'error': 'Se requiere el ID de la sesión'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Recuperar la sesión de Stripe
        session = stripe.checkout.Session.retrieve(session_id)
        
        if session.payment_status == 'paid':
            # Obtener el carrito
            carrito_id = session.metadata.get('carrito_id')
            carrito = Carrito.objects.get(id=carrito_id)
            
            # Vaciar el carrito después del pago exitoso
            CarritoItem.objects.filter(carrito=carrito).delete()
            
            return Response({
                'message': 'Pago confirmado exitosamente',
                'carrito_id': carrito.id,
                'payment_status': session.payment_status,
                'amount_total': session.amount_total / 100,  # Convertir de centavos a dólares
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'El pago no fue completado', 'payment_status': session.payment_status},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@jwt_required
def create_payment_intent(request):
    """
    Crea un PaymentIntent de Stripe para procesar el pago del carrito.
    Convierte los precios a Bolivianos (Bs) con un tipo de cambio fijo.
    """
    try:
        # Usar usuario_id=1 por defecto para demo
        usuario_id = request.data.get('usuario_id', 1)
        
        # Obtener o crear el carrito del usuario
        carrito, created = Carrito.objects.get_or_create(usuario_id=usuario_id)
        
        items = CarritoItem.objects.filter(carrito=carrito)
        if not items.exists():
            return Response(
                {'error': 'Tu carrito está vacío'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calcular el total en USD (del carrito)
        subtotal = sum(Decimal(str(item.producto.precio)) * item.cantidad for item in items)
        igv = subtotal * Decimal("0.18")
        total_usd = subtotal + igv
        
        # Convertir a Bolivianos (Bs) - Tipo de cambio aproximado: 1 USD = 6.96 Bs
        tipo_cambio = Decimal("6.96")
        total_bs = total_usd * tipo_cambio
        
        # Stripe requiere el monto en centavos (menor unidad de la moneda)
        # Para BOB (Boliviano), la menor unidad es el centavo
        amount = int(total_bs * 100)
        
        # Obtener el usuario para los metadatos
        usuario = carrito.usuario
        
        # Crear el PaymentIntent en Stripe
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency='bob',  # Boliviano Boliviano
            metadata={
                'carrito_id': carrito.id,
                'usuario_id': usuario.id,
                'usuario_email': usuario.email if hasattr(usuario, 'email') else '',
            },
            description=f'Pago de carrito #{carrito.id}',
        )
        
        return Response({
            'clientSecret': intent.client_secret,
            'total_usd': float(total_usd),
            'total_bs': float(total_bs),
            'tipo_cambio': float(tipo_cambio),
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@jwt_required
def confirm_payment(request):
    """
    Confirma el pago y actualiza el estado del carrito.
    """
    try:
        payment_intent_id = request.data.get('payment_intent_id')
        
        if not payment_intent_id:
            return Response(
                {'error': 'Se requiere el ID del PaymentIntent'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar el pago con Stripe
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        if intent.status == 'succeeded':
            # Obtener el carrito y vaciarlo
            carrito_id = intent.metadata.get('carrito_id')
            carrito = Carrito.objects.get(id=carrito_id)
            
            # Vaciar el carrito después del pago exitoso
            CarritoItem.objects.filter(carrito=carrito).delete()
            
            return Response({
                'message': 'Pago confirmado exitosamente',
                'carrito_id': carrito.id,
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'El pago no fue exitoso'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
