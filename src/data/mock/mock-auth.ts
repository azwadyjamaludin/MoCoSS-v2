import { DEV_APP } from "../dev-app";

export type TestUser = {
  fullName: string;
  email: string;
  role: 'supervisor';
};

const TEST_EMAIL = process.env.EXPO_PUBLIC_MOCK_EMAIL?.trim().toLowerCase();
const TEST_PASSWORD = process.env.EXPO_PUBLIC_MOCK_PASSWORD;


export function tryTestLogin(
  email: string,
  password: string
): { token: string; user: TestUser } | null {
  if (!DEV_APP) return null;

  if (email.trim().toLowerCase() === TEST_EMAIL && password === TEST_PASSWORD) {
    const TEST_USER: TestUser = {
      fullName: 'Test Supervisor',
      email: TEST_EMAIL,
      role: 'supervisor',
    };
    return { token: 'test-supervisor-token', user: TEST_USER };
  }
  return null;
}
