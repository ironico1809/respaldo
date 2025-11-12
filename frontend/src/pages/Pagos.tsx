import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from '../api/axiosConfig';
import './Pagos.css';
import { CreditCard, CheckCircle } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface CarritoData {
  total_bs: number;
  total_usd: number;
  tipo_cambio: number;
  total_items: number;
}

const CheckoutForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [carritoData, setCarritoData] = useState<CarritoData | null>(null);

  useEffect(() => {
    // Crear el PaymentIntent cuando se carga el componente
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      const response = await axios.post('/pagos/create-payment-intent/');
      setClientSecret(response.data.clientSecret);
      setCarritoData({
        total_bs: response.data.total_bs,
        total_usd: response.data.total_usd,
        tipo_cambio: response.data.tipo_cambio,
        total_items: 0,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al inicializar el pago');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Error al cargar el formulario de tarjeta');
      setLoading(false);
      return;
    }

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Error al procesar el pago');
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirmar el pago en el backend
        await axios.post('/pagos/confirm-payment/', {
          payment_intent_id: paymentIntent.id,
        });

        setSuccess(true);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al procesar el pago');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pagos-success">
        <CheckCircle className="success-icon" size={64} />
        <h2>¡Pago Exitoso!</h2>
        <p>Tu pago ha sido procesado correctamente.</p>
        <button onClick={() => window.location.href = '/catalogo'}>
          Volver al Catálogo
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="payment-header">
        <CreditCard size={32} />
        <h2>Procesar Pago</h2>
      </div>

      {carritoData && (
        <div className="payment-summary">
          <h3>Resumen de Pago</h3>
          <div className="summary-row">
            <span>Total (USD):</span>
            <span>${carritoData.total_usd.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tipo de cambio:</span>
            <span>1 USD = {carritoData.tipo_cambio} Bs</span>
          </div>
          <div className="summary-row total">
            <span>Total a pagar:</span>
            <span className="total-amount">Bs {carritoData.total_bs.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="card-element-container">
        <label>Información de la Tarjeta</label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#2c3e50',
                '::placeholder': {
                  color: '#95a5a6',
                },
              },
              invalid: {
                color: '#e74c3c',
              },
            },
          }}
        />
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="pay-button"
      >
        {loading ? 'Procesando...' : `Pagar Bs ${carritoData?.total_bs.toFixed(2) || '0.00'}`}
      </button>

      <p className="secure-payment">
        🔒 Pago seguro procesado por Stripe
      </p>
    </form>
  );
};

const Pagos: React.FC = () => {
  return (
    <div className="pagos-container">
      <div className="pagos-content">
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  );
};

export default Pagos;
