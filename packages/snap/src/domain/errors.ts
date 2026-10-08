/** Field-level validation errors, keyed by request field. */
export class ValidationError extends Error {
  readonly fields: Record<string, string>;

  constructor(fields: Record<string, string>) {
    super(Object.values(fields).join(' '));
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

export type FieldErrors = Record<string, string>;
