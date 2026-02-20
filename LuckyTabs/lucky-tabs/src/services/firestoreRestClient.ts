/**
 * Firestore REST API Client for Native Platforms
 * 
 * Uses the Firestore REST API with native Firebase auth tokens
 * to bypass the web SDK auth sync issue on iOS
 */

import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

const PROJECT_ID = 'pull-tabs';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// Type definitions for Firestore REST API
interface FirestoreDocument {
  name?: string;
  fields?: Record<string, FirestoreValue>;
  createTime?: string;
  updateTime?: string;
}

interface FirestoreValue {
  nullValue?: null;
  booleanValue?: boolean;
  integerValue?: string;
  doubleValue?: number;
  timestampValue?: string;
  stringValue?: string;
  arrayValue?: { values?: FirestoreValue[] };
  mapValue?: { fields?: Record<string, FirestoreValue> };
}

interface QueryResult {
  document?: FirestoreDocument;
}

interface WhereClause {
  field: string;
  op: string;
  value: unknown;
}

async function getAuthToken(): Promise<string> {
  const result = await FirebaseAuthentication.getIdToken({ forceRefresh: false });
  if (!result.token) {
    throw new Error('No authentication token available');
  }
  return result.token;
}

export async function getDocument(path: string): Promise<Record<string, unknown> | null> {
  const token = await getAuthToken();
  
  const response = await fetch(`${BASE_URL}/${path}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (response.status === 404) {
    return null;
  }
  
  if (!response.ok) {
    const error = await response.text();
    console.error('Firestore REST API error:', error);
    throw new Error(`Failed to get document: ${response.status}`);
  }
  
  const data = await response.json() as FirestoreDocument;
  return convertFirestoreDocument(data);
}

export async function queryCollection(collectionPath: string, whereClause?: WhereClause[]): Promise<Record<string, unknown>[]> {
  const token = await getAuthToken();
  
  // Build structured query
  interface StructuredQuery {
    from: Array<{ collectionId: string | undefined }>;
    where?: {
      compositeFilter: {
        op: string;
        filters: Array<{
          fieldFilter: {
            field: { fieldPath: string };
            op: string;
            value: FirestoreValue;
          };
        }>;
      };
    };
  }
  
  const structuredQuery: StructuredQuery = {
    from: [{ collectionId: collectionPath.split('/').pop() }],
  };
  
  if (whereClause && whereClause.length > 0) {
    structuredQuery.where = {
      compositeFilter: {
        op: 'AND',
        filters: whereClause.map(({ field, op, value }) => ({
          fieldFilter: {
            field: { fieldPath: field },
            op: convertOperator(op),
            value: convertValue(value),
          },
        })),
      },
    };
  }
  
  const response = await fetch(`${BASE_URL}:runQuery`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ structuredQuery }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error('Firestore REST API query error:', error);
    throw new Error(`Failed to query collection: ${response.status}`);
  }
  
  const results = await response.json() as QueryResult[];
  
  return results
    .filter((item): item is QueryResult & { document: FirestoreDocument } => !!item.document)
    .map((item) => convertFirestoreDocument(item.document));
}

export async function addDocument(collectionPath: string, data: Record<string, unknown>): Promise<string> {
  const token = await getAuthToken();
  const firestoreDoc = convertToFirestoreDocument(data);
  
  const response = await fetch(`${BASE_URL}/${collectionPath}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields: firestoreDoc }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error('Firestore REST API add error:', error);
    throw new Error(`Failed to add document: ${response.status}`);
  }
  
  const result = await response.json() as FirestoreDocument;
  // Extract the document ID from the name (projects/xxx/databases/xxx/documents/collection/docId)
  const docId = result.name?.split('/').pop() || '';
  return docId;
}

export async function setDocument(path: string, data: Record<string, unknown>, merge = false): Promise<void> {
  const token = await getAuthToken();
  
  const firestoreDoc = convertToFirestoreDocument(data);
  
  const url = merge
    ? `${BASE_URL}/${path}?updateMask.fieldPaths=${Object.keys(data as object).join('&updateMask.fieldPaths=')}`
    : `${BASE_URL}/${path}`;
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields: firestoreDoc }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error('Firestore REST API set error:', error);
    throw new Error(`Failed to set document: ${response.status}`);
  }
}

export async function deleteDocument(path: string): Promise<void> {
  const token = await getAuthToken();
  
  const response = await fetch(`${BASE_URL}/${path}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error('Firestore REST API delete error:', error);
    throw new Error(`Failed to delete document: ${response.status}`);
  }
}

// Helper functions to convert between Firestore REST API format and JS objects

function convertFirestoreDocument(doc: FirestoreDocument): Record<string, unknown> {
  if (!doc.fields) {
    return { id: doc.name?.split('/').pop() };
  }
  
  const result: Record<string, unknown> = {
    id: doc.name?.split('/').pop(),
  };
  
  for (const [key, value] of Object.entries(doc.fields)) {
    result[key] = convertFirestoreValue(value);
  }
  
  return result;
}

function convertFirestoreValue(value: FirestoreValue): unknown {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(value.integerValue);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.timestampValue !== undefined) return new Date(value.timestampValue);
  if (value.nullValue !== undefined) return null;
  if (value.arrayValue) {
    return value.arrayValue.values?.map((v) => convertFirestoreValue(v)) || [];
  }
  if (value.mapValue) {
    const obj: Record<string, unknown> = {};
    if (value.mapValue.fields) {
      for (const [k, v] of Object.entries(value.mapValue.fields)) {
        obj[k] = convertFirestoreValue(v);
      }
    }
    return obj;
  }
  return null;
}

function convertToFirestoreDocument(obj: Record<string, unknown>): Record<string, FirestoreValue> {
  const fields: Record<string, FirestoreValue> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    fields[key] = convertValue(value);
  }
  
  return fields;
}

function convertValue(value: unknown): FirestoreValue {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { integerValue: value.toString() }
      : { doubleValue: value };
  }
  if (typeof value === 'boolean') return { booleanValue: value };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map(v => convertValue(v)),
      },
    };
  }
  if (typeof value === 'object') {
    const fields: Record<string, FirestoreValue> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      fields[k] = convertValue(v);
    }
    return { mapValue: { fields } };
  }
  return { nullValue: null };
}

function convertOperator(op: string): string {
  const opMap: Record<string, string> = {
    '==': 'EQUAL',
    '<': 'LESS_THAN',
    '<=': 'LESS_THAN_OR_EQUAL',
    '>': 'GREATER_THAN',
    '>=': 'GREATER_THAN_OR_EQUAL',
    '!=': 'NOT_EQUAL',
    'array-contains': 'ARRAY_CONTAINS',
    'in': 'IN',
    'array-contains-any': 'ARRAY_CONTAINS_ANY',
    'not-in': 'NOT_IN',
  };
  return opMap[op] || 'EQUAL';
}
