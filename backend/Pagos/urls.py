from django.urls import path
from .views import create_payment_intent, confirm_payment, create_checkout_session, verify_checkout_session

urlpatterns = [
    path('create-payment-intent/', create_payment_intent, name='create_payment_intent'),
    path('confirm-payment/', confirm_payment, name='confirm_payment'),
    path('create-checkout-session/', create_checkout_session, name='create_checkout_session'),
    path('verify-checkout-session/', verify_checkout_session, name='verify_checkout_session'),
]
