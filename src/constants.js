/**
 * @file Contiene las constantes utilizadas en toda la aplicación para evitar "magic strings".
 * Esto mejora la mantenibilidad y previene errores de tipeo.
 */

// Modos de vista de la aplicación
export const VIEW_MODES = {
  LIST: 'list',
  CALENDAR: 'calendar',
  ANALYSIS: 'analysis',
  BUDGETS: 'budgets',
  SECURITY: 'security',
};

// Tipos de transacciones
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
  ALL: 'all',
};

// Categorías para ingresos y gastos
export const CATEGORIES = [
  'Comida',
  'Vivienda',
  'Transporte',
  'Ocio',
  'Salario',
  'Otros',
];

// Opciones de ordenamiento para la lista de transacciones
export const SORT_OPTIONS = {
  DATE_DESC: 'date-desc',
  DATE_ASC: 'date-asc',
  AMOUNT_DESC: 'amount-desc',
  AMOUNT_ASC: 'amount-asc',
  DESCRIPTION_ASC: 'description-asc',
  DESCRIPTION_DESC: 'description-desc',
};
