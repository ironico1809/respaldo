import axios from '../api/axiosConfig';

const API_URL = '/pagos';

export interface CheckoutSession {
  checkout_url: string;
  session_id: string;
}

export interface PaymentIntent {
  clientSecret: string;
  total_usd: number;
  total_bs: number;
  tipo_cambio: number;
}

export const pagoService = {
  // Crear sesión de checkout de Stripe
  createCheckoutSession: async (
    usuarioId: number = 1,
    successUrl?: string,
    cancelUrl?: string
  ): Promise<CheckoutSession> => {
    const response = await axios.post(`${API_URL}/create-checkout-session/`, {
      usuario_id: usuarioId,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return response.data;
  },

  // Verificar sesión de checkout
  verifyCheckoutSession: async (sessionId: string) => {
    const response = await axios.get(`${API_URL}/verify-checkout-session/`, {
      params: { session_id: sessionId },
    });
    return response.data;
  },

  // Crear PaymentIntent
  createPaymentIntent: async (usuarioId: number = 1): Promise<PaymentIntent> => {
    const response = await axios.post(`${API_URL}/create-payment-intent/`, {
      usuario_id: usuarioId,
    });
    return response.data;
  },

  // Confirmar pago
  confirmPayment: async (paymentIntentId: string) => {
    const response = await axios.post(`${API_URL}/confirm-payment/`, {
      payment_intent_id: paymentIntentId,
    });
    return response.data;
  },
};

export default pagoService;
