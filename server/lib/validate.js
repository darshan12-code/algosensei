export function requireFields(fields, body) {
  const missing = fields.filter(f => !body[f] && body[f] !== 0 && body[f] !== false);
  if (missing.length > 0) return `Missing required fields: ${missing.join(', ')}`;
  return null;
}

export function validateStringLength(value, name, max = 5000) {
  if (typeof value !== 'string') return `${name} must be a string`;
  if (value.length > max) return `${name} exceeds maximum length of ${max}`;
  return null;
}