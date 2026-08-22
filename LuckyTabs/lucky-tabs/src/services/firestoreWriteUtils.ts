export function isServerTimestampValue(value: unknown): value is { _methodName?: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    '_methodName' in value &&
    (value as { _methodName?: unknown })._methodName === 'serverTimestamp'
  );
}

export function preparePayloadForWrite<T>(payload: T, isNative: boolean): T {
  if (!isNative) {
    return payload;
  }

  const normalizeValue = (value: unknown): unknown => {
    if (value === null || value === undefined) {
      return value;
    }

    if (value instanceof Date) {
      return value;
    }

    if (isServerTimestampValue(value)) {
      return new Date();
    }

    if (Array.isArray(value)) {
      return value.map((item) => normalizeValue(item));
    }

    if (typeof value === 'object') {
      const normalizedObject: Record<string, unknown> = {};
      for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
        normalizedObject[key] = normalizeValue(nestedValue);
      }
      return normalizedObject;
    }

    return value;
  };

  return normalizeValue(payload) as T;
}
