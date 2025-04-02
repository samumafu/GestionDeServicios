# GestionDeServicios
# Gestión de Gastos del Hogar - Documentación

## Descripción
Aplicación web para administrar y monitorear gastos de servicios básicos del hogar. Permite registrar gastos mensuales, visualizar tendencias y generar predicciones para futuros gastos.

## Características principales

- **Gestión de gastos por servicio**: Electricidad, Agua, Internet, Cable y Gas
- **Visualización de datos**: Gráficos de barras y líneas para analizar tendencias
- **Predicción de gastos**: Cálculo automático de gastos futuros basado en historial
- **Persistencia de datos**: Almacenamiento local en el navegador
- **Modo oscuro/claro**: Interfaz adaptable a las preferencias del usuario
- **Edición de datos históricos**: Capacidad para modificar registros previos

## Tecnologías utilizadas

- **React**: Framework para la interfaz de usuario
- **TypeScript**: Tipado estático para mayor robustez
- **Recharts**: Biblioteca para visualización de datos
- **ShadcnUI**: Componentes de UI reutilizables
- **Lucide React**: Iconos modernos y accesibles
- **date-fns**: Manipulación y formateo de fechas

## Estructura de la aplicación

La aplicación se divide en tres secciones principales:

1. **Servicios**: Registro de gastos para el mes seleccionado
2. **Predicción**: Estimación de gastos futuros basada en datos históricos
3. **Análisis**: Visualización y gestión del historial de gastos

## Modelo de datos

- **Expense**: Representa un gasto individual con servicio, monto, fecha e icono
- **MonthlyExpense**: Agrupa todos los gastos de un mes con datos de totales

## Funciones clave

- `calculatePredictions()`: Genera predicciones basadas en el historial reciente
- `saveMonthlyExpenses()`: Guarda o actualiza los gastos del mes seleccionado
- `editMonth()`: Permite modificar datos de meses anteriores
- `generateMonthOptions()`: Genera opciones limitadas para el selector de meses

## Personalización

La aplicación es fácilmente extensible para incluir:
- Categorías adicionales de servicios
- Diferentes métricas de análisis
- Exportación de datos
- Objetivos de ahorro

## Consideraciones técnicas

- Los datos se almacenan en localStorage para persistencia sin requerir un servidor
- La interfaz es responsiva, adaptándose a diferentes tamaños de pantalla
- Se implementa estado controlado para la navegación entre pestañas
