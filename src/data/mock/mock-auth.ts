export type TestUser = {
  fullName: string;
  email: string;
  role: 'supervisor';
};

const TEST_EMAIL = 'testemail@mocoss.my';
const TEST_PASSWORD = 'testpassword';

const TEST_USER: TestUser = {
  fullName: 'Test Supervisor',
  email: TEST_EMAIL,
  role: 'supervisor',
};

/** Returns a login payload if the credentials are the test pair, otherwise null. */
export function tryTestLogin(
  email: string,
  password: string
): { token: string; user: TestUser } | null {
  if (!__DEV__) return null;

  if (email.trim().toLowerCase() === TEST_EMAIL && password === TEST_PASSWORD) {
    return { token: 'test-supervisor-token', user: TEST_USER };
  }
  return null;
}
