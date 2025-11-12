"""
Servicio de Machine Learning para predicción de ventas
Utiliza Random Forest Regressor de scikit-learn
"""

import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib
from datetime import datetime, timedelta
from django.conf import settings
from Ventas.models import Venta
from Producto.models import Producto


class VentasPredictor:
    """
    Clase para manejar predicciones de ventas usando Random Forest
    """
    
    def __init__(self):
        self.model = None
        self.model_path = os.path.join(settings.BASE_DIR, 'Predicciones', 'models', 'ventas_model.pkl')
        self.scaler_path = os.path.join(settings.BASE_DIR, 'Predicciones', 'models', 'scaler.pkl')
        self.is_trained = False
        
        # Crear directorio de modelos si no existe
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        
        # Cargar modelo si existe
        self.load_model()
    
    def generar_datos_sinteticos(self, n_registros=500):
        """
        Genera datos sintéticos para entrenamiento inicial
        """
        np.random.seed(42)
        
        # Generar fechas
        fecha_inicio = datetime.now() - timedelta(days=365)
        fechas = [fecha_inicio + timedelta(days=i) for i in range(n_registros)]
        
        # Generar características
        data = {
            'mes': [f.month for f in fechas],
            'dia_semana': [f.weekday() for f in fechas],
            'dia_mes': [f.day for f in fechas],
            'trimestre': [(f.month - 1) // 3 + 1 for f in fechas],
            'es_fin_semana': [1 if f.weekday() >= 5 else 0 for f in fechas],
            'producto_id': np.random.randint(1, 20, n_registros),
            'categoria': np.random.randint(1, 5, n_registros),
            'precio_promedio': np.random.uniform(10, 1000, n_registros),
            'cantidad': np.random.randint(1, 50, n_registros),
        }
        
        # Calcular ventas con tendencia estacional
        ventas = []
        for i in range(n_registros):
            # Base
            venta = data['cantidad'][i] * data['precio_promedio'][i]
            
            # Tendencia creciente
            venta *= (1 + i / n_registros * 0.5)
            
            # Estacionalidad mensual (más ventas en fin de año)
            if data['mes'][i] in [11, 12]:
                venta *= 1.3
            elif data['mes'][i] in [1, 2]:
                venta *= 0.8
            
            # Boost fin de semana
            if data['es_fin_semana'][i]:
                venta *= 1.2
            
            # Añadir ruido
            venta *= np.random.uniform(0.9, 1.1)
            
            ventas.append(venta)
        
        data['total_venta'] = ventas
        
        return pd.DataFrame(data)
    
    def obtener_datos_reales(self):
        """
        Obtiene datos reales de ventas de la base de datos
        """
        try:
            ventas = Venta.objects.all().select_related('cliente').prefetch_related('detalles__producto')
            
            if ventas.count() < 10:
                return None
            
            data_list = []
            for venta in ventas:
                # Calcular precio promedio y cantidad total
                total_cantidad = sum(item.cantidad for item in venta.detalles.all())
                precio_promedio = venta.monto_total / total_cantidad if total_cantidad > 0 else 0
                
                # Obtener primer producto como referencia (simplificación)
                primer_item = venta.detalles.first()
                producto_id = primer_item.producto.id if primer_item else 1
                
                data_list.append({
                    'mes': venta.fecha_venta.month,
                    'dia_semana': venta.fecha_venta.weekday(),
                    'dia_mes': venta.fecha_venta.day,
                    'trimestre': (venta.fecha_venta.month - 1) // 3 + 1,
                    'es_fin_semana': 1 if venta.fecha_venta.weekday() >= 5 else 0,
                    'producto_id': producto_id,
                    'categoria': 1,  # Simplificación
                    'precio_promedio': float(precio_promedio),
                    'cantidad': total_cantidad,
                    'total_venta': float(venta.monto_total)
                })
            
            return pd.DataFrame(data_list)
        
        except Exception as e:
            print(f"Error obteniendo datos reales: {e}")
            return None
    
    def entrenar_modelo(self, usar_datos_reales=True):
        """
        Entrena el modelo Random Forest
        """
        # Intentar obtener datos reales
        df = None
        if usar_datos_reales:
            df = self.obtener_datos_reales()
        
        # Si no hay datos reales suficientes, usar sintéticos
        if df is None or len(df) < 50:
            print("Usando datos sintéticos para entrenamiento")
            df = self.generar_datos_sinteticos()
        else:
            print(f"Usando {len(df)} registros reales para entrenamiento")
        
        # Preparar features y target
        features = ['mes', 'dia_semana', 'dia_mes', 'trimestre', 'es_fin_semana', 
                   'producto_id', 'categoria', 'precio_promedio', 'cantidad']
        X = df[features]
        y = df['total_venta']
        
        # Split train/test
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Entrenar Random Forest
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        
        self.model.fit(X_train, y_train)
        
        # Evaluar
        y_pred = self.model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        self.is_trained = True
        
        # Guardar modelo
        self.save_model()
        
        return {
            'mse': float(mse),
            'rmse': float(np.sqrt(mse)),
            'r2_score': float(r2),
            'n_samples': len(df),
            'data_type': 'real' if usar_datos_reales and df is not None else 'sintético'
        }
    
    def predecir_ventas_futuras(self, dias=30):
        """
        Predice ventas para los próximos N días
        """
        if not self.is_trained:
            raise Exception("El modelo no ha sido entrenado aún")
        
        predicciones = []
        fecha_actual = datetime.now()
        
        for i in range(dias):
            fecha = fecha_actual + timedelta(days=i)
            
            # Features para predicción (valores promedio)
            features = {
                'mes': fecha.month,
                'dia_semana': fecha.weekday(),
                'dia_mes': fecha.day,
                'trimestre': (fecha.month - 1) // 3 + 1,
                'es_fin_semana': 1 if fecha.weekday() >= 5 else 0,
                'producto_id': 5,  # Producto promedio
                'categoria': 2,    # Categoría promedio
                'precio_promedio': 200,  # Precio promedio
                'cantidad': 10     # Cantidad promedio
            }
            
            X = pd.DataFrame([features])
            prediccion = self.model.predict(X)[0]
            
            predicciones.append({
                'fecha': fecha.strftime('%Y-%m-%d'),
                'prediccion': float(prediccion),
                'dia_semana': fecha.strftime('%A')
            })
        
        return predicciones
    
    def predecir_por_producto(self, producto_id, dias=30):
        """
        Predice ventas para un producto específico
        """
        if not self.is_trained:
            raise Exception("El modelo no ha sido entrenado aún")
        
        predicciones = []
        fecha_actual = datetime.now()
        
        # Obtener info del producto si existe
        try:
            producto = Producto.objects.get(id=producto_id)
            precio = float(producto.precio)
        except:
            precio = 200
        
        for i in range(dias):
            fecha = fecha_actual + timedelta(days=i)
            
            features = {
                'mes': fecha.month,
                'dia_semana': fecha.weekday(),
                'dia_mes': fecha.day,
                'trimestre': (fecha.month - 1) // 3 + 1,
                'es_fin_semana': 1 if fecha.weekday() >= 5 else 0,
                'producto_id': producto_id,
                'categoria': 2,
                'precio_promedio': precio,
                'cantidad': 10
            }
            
            X = pd.DataFrame([features])
            prediccion = self.model.predict(X)[0]
            
            predicciones.append({
                'fecha': fecha.strftime('%Y-%m-%d'),
                'prediccion': float(prediccion)
            })
        
        return predicciones
    
    def predecir_mensual(self, meses=6):
        """
        Predice ventas totales mensuales
        """
        if not self.is_trained:
            raise Exception("El modelo no ha sido entrenado aún")
        
        predicciones = []
        fecha_actual = datetime.now()
        
        for i in range(meses):
            # Calcular mes futuro
            mes = ((fecha_actual.month - 1 + i) % 12) + 1
            año = fecha_actual.year + ((fecha_actual.month - 1 + i) // 12)
            
            # Predecir para cada día del mes (promedio)
            suma_mes = 0
            dias_mes = 30  # Simplificación
            
            for dia in range(dias_mes):
                fecha = datetime(año, mes, min(dia + 1, 28))
                
                features = {
                    'mes': mes,
                    'dia_semana': fecha.weekday(),
                    'dia_mes': dia + 1,
                    'trimestre': (mes - 1) // 3 + 1,
                    'es_fin_semana': 1 if fecha.weekday() >= 5 else 0,
                    'producto_id': 5,
                    'categoria': 2,
                    'precio_promedio': 200,
                    'cantidad': 10
                }
                
                X = pd.DataFrame([features])
                prediccion = self.model.predict(X)[0]
                suma_mes += prediccion
            
            predicciones.append({
                'mes': f"{año}-{mes:02d}",
                'prediccion': float(suma_mes),
                'año': año,
                'mes_numero': mes
            })
        
        return predicciones
    
    def obtener_importancia_features(self):
        """
        Retorna la importancia de cada feature en el modelo
        """
        if not self.is_trained:
            return None
        
        features = ['mes', 'dia_semana', 'dia_mes', 'trimestre', 'es_fin_semana', 
                   'producto_id', 'categoria', 'precio_promedio', 'cantidad']
        
        importancias = self.model.feature_importances_
        
        return [
            {'feature': feat, 'importancia': float(imp)}
            for feat, imp in zip(features, importancias)
        ]
    
    def save_model(self):
        """
        Guarda el modelo entrenado
        """
        if self.model is not None:
            joblib.dump(self.model, self.model_path)
            print(f"Modelo guardado en {self.model_path}")
    
    def load_model(self):
        """
        Carga el modelo guardado
        """
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                self.is_trained = True
                print("Modelo cargado exitosamente")
            except Exception as e:
                print(f"Error cargando modelo: {e}")
                self.is_trained = False
        else:
            print("No se encontró modelo guardado")
            self.is_trained = False


# Instancia global del predictor
predictor = VentasPredictor()
