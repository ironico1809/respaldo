# Sistema de Predicción de Ventas con IA

## 📊 Descripción General

Sistema de predicción de ventas implementado con **Random Forest Regressor** de scikit-learn que analiza datos históricos y genera predicciones futuras visualizadas en un dashboard interactivo.

## 🤖 Modelo de IA

### Algoritmo: Random Forest Regressor
- **Biblioteca:** scikit-learn 1.5.2
- **Tipo:** Modelo de ensamble basado en árboles de decisión
- **Ventajas:**
  - No requiere datasets extensos
  - Buena capacidad de generalización
  - Maneja bien datos no lineales
  - Resistente al overfitting
  - No necesita normalización de datos

### Características (Features) del Modelo:
1. **mes** - Mes del año (1-12)
2. **dia_semana** - Día de la semana (0-6)
3. **dia_mes** - Día del mes (1-31)
4. **trimestre** - Trimestre del año (1-4)
5. **es_fin_semana** - Indicador binario (0-1)
6. **producto_id** - ID del producto
7. **categoria** - Categoría del producto
8. **precio_promedio** - Precio promedio de venta
9. **cantidad** - Cantidad vendida

### Variable Objetivo (Target):
- **total_venta** - Monto total de la venta

## 🚀 Instalación

### Backend

```bash
cd backend
pip install scikit-learn pandas numpy joblib
```

O instalar todas las dependencias:
```bash
pip install -r requeriments.txt
```

### Frontend

```bash
cd frontend
npm install recharts
```

## 📁 Estructura de Archivos

### Backend
```
backend/
├── Predicciones/
│   ├── ml_service.py          # Servicio de Machine Learning
│   ├── views.py                # Endpoints de la API
│   ├── urls.py                 # Rutas
│   ├── models/                 # Carpeta para modelos serializados
│   │   └── ventas_model.pkl   # Modelo entrenado guardado
```

### Frontend
```
frontend/src/pages/
├── DashboardPredicciones.tsx   # Componente principal
└── DashboardPredicciones.css   # Estilos
```

## 🔧 Endpoints de la API

### 1. Dashboard Completo
```
GET /api/predicciones/dashboard/
```
Retorna todos los datos necesarios para el dashboard en una sola llamada.

**Respuesta:**
```json
{
  "success": true,
  "ventas_historicas": [...],
  "predicciones_mensuales": [...],
  "predicciones_diarias": [...],
  "productos_top": [...],
  "modelo_entrenado": true
}
```

### 2. Entrenar Modelo
```
POST /api/predicciones/predicciones/entrenar_modelo/
Body: { "usar_datos_reales": true }
```
Entrena el modelo con datos reales o sintéticos.

### 3. Predicciones Futuras
```
GET /api/predicciones/predicciones/predecir_futuro/?dias=30
```
Genera predicciones para los próximos N días.

### 4. Predicciones por Producto
```
GET /api/predicciones/predicciones/predecir_por_producto/?producto_id=1&dias=30
```
Predicciones específicas para un producto.

### 5. Predicciones Mensuales
```
GET /api/predicciones/predicciones/predecir_mensual/?meses=6
```
Predicciones agregadas por mes.

### 6. Ventas Históricas
```
GET /api/predicciones/predicciones/ventas_historicas/?periodo=mensual
```
Obtiene ventas históricas agrupadas (diario o mensual).

### 7. Productos Más Vendidos
```
GET /api/predicciones/predicciones/productos_mas_vendidos/?limite=10
```
Lista de productos más vendidos.

### 8. Métricas del Modelo
```
GET /api/predicciones/predicciones/metricas_modelo/
```
Estado e importancia de features del modelo.

## 📈 Dashboard Frontend

### Características:

1. **Gráfico de Área:** Ventas históricas vs predicciones mensuales
2. **Gráfico de Barras/Líneas:** Predicciones detalladas (mensual/diario)
3. **Gráfico de Pie:** Distribución de ventas por producto
4. **Tarjetas de Resumen:**
   - Total histórico
   - Predicción 6 meses
   - Promedio mensual
   - Productos analizados
5. **Top Productos:** Lista de productos más vendidos
6. **Botón de Entrenamiento:** Re-entrenar el modelo con datos actualizados

### Acceso:
```
http://localhost:5173/predicciones
```

## 🎓 Entrenamiento del Modelo

### Datos Sintéticos (Inicial)
Si no hay suficientes datos reales (menos de 50 registros), el sistema genera **500 registros sintéticos** que simulan:
- Tendencia creciente de ventas
- Estacionalidad (más ventas en noviembre-diciembre)
- Patrones de fin de semana
- Variabilidad aleatoria

### Datos Reales
Cuando hay suficientes ventas reales en la base de datos, el modelo se entrena automáticamente con ellos.

### Métricas de Evaluación:
- **MSE (Mean Squared Error)** - Error cuadrático medio
- **RMSE (Root Mean Squared Error)** - Raíz del error cuadrático medio
- **R² Score** - Coeficiente de determinación (0-1, donde 1 es perfecto)

### Parámetros del Random Forest:
```python
RandomForestRegressor(
    n_estimators=100,      # 100 árboles
    max_depth=10,          # Profundidad máxima
    min_samples_split=5,   # Mínimo para dividir
    min_samples_leaf=2,    # Mínimo en hojas
    random_state=42,       # Semilla para reproducibilidad
    n_jobs=-1             # Usar todos los núcleos
)
```

## 💾 Persistencia del Modelo

El modelo entrenado se guarda automáticamente en:
```
backend/Predicciones/models/ventas_model.pkl
```

Se carga automáticamente al iniciar el servidor, evitando re-entrenar en cada petición.

## 🔄 Flujo de Uso

1. **Primera vez:**
   - El sistema genera datos sintéticos
   - Entrena el modelo automáticamente
   - Guarda el modelo

2. **Uso normal:**
   - Carga el modelo guardado
   - Genera predicciones instantáneas
   - Muestra resultados en el dashboard

3. **Re-entrenamiento:**
   - Click en "Entrenar Modelo"
   - El modelo se actualiza con datos más recientes
   - Se guarda la nueva versión

## 📊 Visualizaciones (Recharts)

### Componentes utilizados:
- **LineChart** - Predicciones diarias
- **AreaChart** - Histórico vs predicciones
- **BarChart** - Predicciones mensuales
- **PieChart** - Distribución por productos

### Personalización:
- Tooltips con formato de moneda
- Colores por gradientes
- Animaciones suaves
- Responsive para móviles

## 🎯 Casos de Uso

1. **Planificación de Inventario:** Predecir demanda futura
2. **Estrategia de Ventas:** Identificar períodos de alta/baja demanda
3. **Análisis de Productos:** Ver qué productos se venden más
4. **Proyecciones Financieras:** Estimar ingresos futuros
5. **Detección de Tendencias:** Identificar patrones estacionales

## 🛠️ Mejoras Futuras

1. **Múltiples Modelos:** Comparar Random Forest con XGBoost, LSTM
2. **Más Features:** Agregar promociones, clima, eventos
3. **Predicción por Categoría:** Análisis más granular
4. **Alertas Automáticas:** Notificar cuando predicciones bajen
5. **Optimización de Hiperparámetros:** GridSearch para mejor rendimiento
6. **Análisis de Clientes:** Segmentación y predicción por cliente

## 🐛 Solución de Problemas

### Error: "El modelo no ha sido entrenado aún"
**Solución:** Click en "Entrenar Modelo" o hacer una petición que lo entrene automáticamente.

### Error: Predicciones muy altas/bajas
**Solución:** Re-entrenar con más datos reales. Los datos sintéticos son solo para demo.

### No se muestran gráficos
**Solución:** 
```bash
npm install recharts
```

### Modelo no se guarda
**Solución:** Verificar permisos de escritura en `backend/Predicciones/models/`

## 📚 Referencias

- [Scikit-learn Random Forest](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestRegressor.html)
- [Recharts Documentation](https://recharts.org/)
- [Django REST Framework](https://www.django-rest-framework.org/)

## 👥 Autor

Sistema desarrollado para SmartSale - Sistema de Gestión de Ventas
