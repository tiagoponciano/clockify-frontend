export { mockApiFetch } from './handlers';
export { MOCK_ACCESS_TOKEN, MOCK_USER } from './data';
export { resetMockStore } from './store';

export function isMockApiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
}
