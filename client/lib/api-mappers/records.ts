export function mapClientRecord<T extends { createdAt: string; updatedAt?: string }>(raw: T): T & {
  updatedAt: string;
} {
  return {
    ...raw,
    updatedAt: raw.updatedAt ?? raw.createdAt,
  };
}
