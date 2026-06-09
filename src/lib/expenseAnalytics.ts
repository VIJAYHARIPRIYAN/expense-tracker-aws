import * as XLSX from 'xlsx';

export type SupportedFileFormat = 'csv' | 'xlsx' | 'json';

export interface NormalizedTransaction {
  id: number;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  type: 'expense' | 'income';
}

export interface CategoryDatum {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface MonthlyDatum {
  month: string;
  amount: number;
}

export interface AnalyticsSnapshot {
  stats: {
    totalSpending: number;
    transactionCount: number;
    highestCategory: string;
    lowestCategory: string;
    monthlyAverage: number;
    savingsRate: number;
  };
  transactions: NormalizedTransaction[];
  categoryData: CategoryDatum[];
  monthlyData: MonthlyDatum[];
  insights: string[];
  warnings: string[];
  sourceCurrency: string;
}

export interface ValidationError extends Error {
  missingColumns?: string[];
}

const EXCHANGE_RATES_INR: Record<string, number> = {
  INR: 1,
  USD: 83,
  EUR: 90,
  GBP: 105,
  JPY: 0.56,
  AED: 22.6,
  CAD: 61,
  AUD: 55,
  SGD: 61,
  CHF: 94,
};

const CATEGORY_COLOR_PALETTE = ['#c4ff00', '#00e5ff', '#6366f1', '#f472b6', '#fb923c', '#a78bfa', '#34d399', '#f87171', '#fbbf24'];

const CURRENCY_SYMBOLS: Array<{ symbol: string; code: string }> = [
  { symbol: '₹', code: 'INR' },
  { symbol: '$', code: 'USD' },
  { symbol: '€', code: 'EUR' },
  { symbol: '£', code: 'GBP' },
  { symbol: '¥', code: 'JPY' },
  { symbol: 'AED', code: 'AED' },
];

const SUPPORTED_EXTENSIONS: SupportedFileFormat[] = ['csv', 'xlsx', 'json'];

export const REQUIRED_COLUMNS = ['Category', 'Amount'];

export function isSupportedExpenseFile(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension ? SUPPORTED_EXTENSIONS.includes(extension as SupportedFileFormat) : false;
}

export function formatInr(amount: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits,
  }).format(amount);
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[_\s-]+/g, ' ');
}

function isMissingValue(value: unknown) {
  return value === null || value === undefined || `${value}`.trim() === '';
}

function detectCurrency(rawValue: string) {
  const upper = rawValue.toUpperCase();
  for (const entry of CURRENCY_SYMBOLS) {
    if (rawValue.includes(entry.symbol) || upper.includes(entry.code)) {
      return entry.code;
    }
  }
  return 'INR';
}

function extractNumericPart(rawValue: string) {
  const cleaned = rawValue.replace(/(usd|eur|gbp|jpy|aed|inr|cad|aud|sgd|chf)/gi, '').replace(/[^0-9,.-]/g, '');
  const normalized = cleaned.replace(/,/g, '');
  return normalized;
}

function normalizeAmount(rawValue: unknown) {
  if (isMissingValue(rawValue)) {
    return { amountInInr: NaN, currency: 'INR', warning: 'missing', isMissing: true, isInvalid: false };
  }

  const value = `${rawValue}`.trim();
  const currency = detectCurrency(value);
  const numericPart = extractNumericPart(value);
  const parsedAmount = Number.parseFloat(numericPart);

  if (Number.isNaN(parsedAmount)) {
    return { amountInInr: NaN, currency, warning: 'invalid', isMissing: false, isInvalid: true };
  }

  const amountInInr = parsedAmount * (EXCHANGE_RATES_INR[currency] || 1);
  const warning = parsedAmount < 0 ? 'negative' : null;

  return {
    amountInInr: Math.abs(amountInInr),
    currency,
    warning,
    isMissing: false,
    isInvalid: false,
  };
}

function resolveField(row: Record<string, unknown>, aliases: string[]) {
  const keys = Object.keys(row);
  for (const alias of aliases) {
    const normalizedAlias = normalizeHeader(alias);
    const matchingKey = keys.find((key) => normalizeHeader(key) === normalizedAlias || normalizeHeader(key).includes(normalizedAlias));
    if (matchingKey) {
      return row[matchingKey];
    }
  }
  return undefined;
}

function getCategoryColor(index: number) {
  return CATEGORY_COLOR_PALETTE[index % CATEGORY_COLOR_PALETTE.length];
}

function monthFromDate(rawDate: string) {
  const parsedDate = new Date(rawDate);
  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.toLocaleString('default', { month: 'short' });
  }

  const parts = rawDate.split(/[-/]/);
  if (parts.length > 1) {
    const monthNumber = Number.parseInt(parts[1], 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (monthNumber >= 1 && monthNumber <= 12) {
      return months[monthNumber - 1];
    }
  }

  return 'Unsorted';
}

function buildWarnings(params: {
  fileWarnings: string[];
  negativeCount: number;
  missingAmountCount: number;
  invalidCurrencyCount: number;
  duplicateCount: number;
}) {
  const warnings = [...params.fileWarnings];

  if (params.negativeCount > 0) {
    warnings.push(`${params.negativeCount} negative amount${params.negativeCount === 1 ? '' : 's'} converted to positive values.`);
  }
  if (params.missingAmountCount > 0) {
    warnings.push(`${params.missingAmountCount} row${params.missingAmountCount === 1 ? '' : 's'} had missing amount values and were skipped.`);
  }
  if (params.invalidCurrencyCount > 0) {
    warnings.push(`${params.invalidCurrencyCount} invalid currency value${params.invalidCurrencyCount === 1 ? '' : 's'} were skipped.`);
  }
  if (params.duplicateCount > 0) {
    warnings.push(`${params.duplicateCount} duplicate transaction${params.duplicateCount === 1 ? '' : 's'} were removed.`);
  }

  return warnings;
}

function buildInsights(categoryData: CategoryDatum[]) {
  if (categoryData.length === 0) {
    return ['No spending data available yet.'];
  }

  const highest = categoryData[0];
  const lowest = categoryData[categoryData.length - 1];
  const savingsTarget = Math.max(0, 100 - highest.percentage);

  return [
    `Highest spending category: ${highest.name} at ${highest.percentage.toFixed(1)}% of total spend.`,
    `Lowest spending category: ${lowest.name} at ${lowest.percentage.toFixed(1)}% of total spend.`,
    `Largest expense contributor: ${highest.name} is the main optimization target.`,
    `Suggested savings opportunity: reduce ${highest.name} by 10% to recover about ${savingsTarget.toFixed(1)}% of the remaining budget share.`,
  ];
}

function normalizeRows(rows: Record<string, unknown>[]) {
  const normalized: NormalizedTransaction[] = [];
  const warnings: string[] = [];
  let negativeCount = 0;
  let missingAmountCount = 0;
  let invalidCurrencyCount = 0;
  let duplicateCount = 0;
  const seen = new Set<string>();

  rows.forEach((row, index) => {
    const categoryValue = resolveField(row, ['Category', 'category', 'type', 'tag']);
    const amountValue = resolveField(row, ['Amount', 'amount', 'value', 'price', 'cost', 'total']);

    const category = `${categoryValue ?? ''}`.trim();
    if (!category) {
      return;
    }

    const amountResult = normalizeAmount(amountValue);
    if (amountResult.isMissing) {
      missingAmountCount += 1;
      return;
    }

    if (amountResult.isInvalid) {
      invalidCurrencyCount += 1;
      return;
    }

    if (amountResult.warning === 'negative') {
      negativeCount += 1;
    }

    const dateValue = `${resolveField(row, ['Date', 'date', 'time', 'transaction date']) ?? ''}`.trim() || `row-${index + 1}`;
    const merchantValue = `${resolveField(row, ['Merchant', 'merchant', 'description', 'payee', 'vendor', 'name']) ?? ''}`.trim() || 'Unknown';

    const dedupeKey = [dateValue, merchantValue, category, amountResult.amountInInr.toFixed(2)].join('|');
    if (seen.has(dedupeKey)) {
      duplicateCount += 1;
      return;
    }
    seen.add(dedupeKey);

    normalized.push({
      id: index + 1,
      date: dateValue,
      merchant: merchantValue,
      category,
      amount: amountResult.amountInInr,
      type: 'expense',
    });
  });

  warnings.push(...buildWarnings({
    fileWarnings: [],
    negativeCount,
    missingAmountCount,
    invalidCurrencyCount,
    duplicateCount,
  }));

  return { transactions: normalized, warnings };
}

function convertTransactionsToAnalytics(transactions: NormalizedTransaction[], sourceCurrency: string, warnings: string[]): AnalyticsSnapshot {
  const totalSpending = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const transactionCount = transactions.length;

  const categories: Record<string, number> = {};
  transactions.forEach((transaction) => {
    categories[transaction.category] = (categories[transaction.category] || 0) + transaction.amount;
  });

  const sortedCategories = Object.entries(categories)
    .sort(([, left], [, right]) => right - left)
    .map(([name, value], index) => ({
      name,
      value,
      color: getCategoryColor(index),
      percentage: totalSpending > 0 ? (value / totalSpending) * 100 : 0,
    }));

  const highestCategory = sortedCategories[0]?.name || 'General';
  const lowestCategory = sortedCategories[sortedCategories.length - 1]?.name || 'General';

  const monthlySpend: Record<string, number> = {};
  transactions.forEach((transaction) => {
    const monthName = monthFromDate(transaction.date);
    monthlySpend[monthName] = (monthlySpend[monthName] || 0) + transaction.amount;
  });

  const uniqueMonths = Object.keys(monthlySpend).length || 1;
  const monthlyAverage = totalSpending / uniqueMonths;

  return {
    stats: {
      totalSpending,
      transactionCount,
      highestCategory,
      lowestCategory,
      monthlyAverage,
      savingsRate: totalSpending > 0 ? Math.max(0, 100 - (sortedCategories[0]?.percentage || 0)) : 0,
    },
    transactions,
    categoryData: sortedCategories,
    monthlyData: Object.entries(monthlySpend).map(([month, amount]) => ({ month, amount })),
    insights: buildInsights(sortedCategories),
    warnings,
    sourceCurrency,
  };
}

function getRowsFromCsv(text: string) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return { headers: [] as string[], rows: [] as Record<string, unknown>[], isEmpty: true };
  }

  const headers = lines[0].split(',').map((header) => header.trim());
  const rows = lines.slice(1).map((line) => {
    const cells = line.match(/("[^"]*"|[^,]+)/g) || [];
    const row: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      row[header] = (cells[index] ?? '').replace(/^"|"$/g, '').trim();
    });
    return row;
  });

  return { headers, rows, isEmpty: rows.length === 0 };
}

function getRowsFromJson(text: string) {
  const parsed = JSON.parse(text);
  const candidate = Array.isArray(parsed) ? parsed : (parsed.transactions || parsed.expenses || parsed.records || parsed.items || []);
  if (!Array.isArray(candidate)) {
    return { headers: [] as string[], rows: [] as Record<string, unknown>[], isEmpty: true };
  }
  const rows = candidate.filter((item) => item && typeof item === 'object') as Record<string, unknown>[];
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  return { headers, rows, isEmpty: rows.length === 0 };
}

function getRowsFromXlsx(buffer: ArrayBuffer) {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return { headers: [] as string[], rows: [] as Record<string, unknown>[], isEmpty: true };
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  return { headers, rows, isEmpty: rows.length === 0 };
}

function findMissingColumns(headers: string[]) {
  const normalizedHeaders = headers.map((header) => normalizeHeader(header));
  const missing: string[] = [];

  if (!normalizedHeaders.some((header) => header.includes('category'))) {
    missing.push('Category');
  }
  if (!normalizedHeaders.some((header) => header.includes('amount') || header.includes('total') || header.includes('cost') || header.includes('value') || header.includes('price'))) {
    missing.push('Amount');
  }

  return missing;
}

export async function analyzeUploadedFile(file: File): Promise<AnalyticsSnapshot> {
  if (!isSupportedExpenseFile(file.name)) {
    const error: ValidationError = new Error('Invalid file format.') as ValidationError;
    throw error;
  }

  if (file.size === 0) {
    const error: ValidationError = new Error('File is empty.') as ValidationError;
    throw error;
  }

  const extension = file.name.split('.').pop()?.toLowerCase();

  try {
    let headers: string[] = [];
    let rows: Record<string, unknown>[] = [];

    if (extension === 'csv') {
      const text = await file.text();
      const csvData = getRowsFromCsv(text);
      headers = csvData.headers;
      rows = csvData.rows;
    } else if (extension === 'json') {
      const text = await file.text();
      const jsonData = getRowsFromJson(text);
      headers = jsonData.headers;
      rows = jsonData.rows;
    } else if (extension === 'xlsx') {
      const buffer = await file.arrayBuffer();
      const xlsxData = getRowsFromXlsx(buffer);
      headers = xlsxData.headers;
      rows = xlsxData.rows;
    }

    if (!rows.length) {
      const error: ValidationError = new Error('File is empty.') as ValidationError;
      throw error;
    }

    const missingColumns = findMissingColumns(headers);
    if (missingColumns.length > 0) {
      const error: ValidationError = new Error(`Required columns are missing: ${missingColumns.join(', ')}`) as ValidationError;
      error.missingColumns = missingColumns;
      throw error;
    }

    const { transactions, warnings } = normalizeRows(rows);
    if (transactions.length === 0) {
      const error: ValidationError = new Error('Unable to process uploaded file.') as ValidationError;
      throw error;
    }

    const sourceCurrency = transactions.find((transaction) => transaction.amount > 0)?.amount ? 'INR' : 'INR';
    return convertTransactionsToAnalytics(transactions, sourceCurrency, warnings);
  } catch (error) {
    if (error instanceof SyntaxError) {
      const validationError: ValidationError = new Error('Unable to process uploaded file.') as ValidationError;
      throw validationError;
    }
    throw error;
  }
}

export function buildValidationMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unable to process uploaded file.';
}
