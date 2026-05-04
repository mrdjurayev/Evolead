const AUTH_HASH = '6b5a4fc321df1cf3f68311c38e9b067d32cd1b6dab16528845efc8d2b0090670';
const SESSION_KEY = 'evolead_auth';

async function hashPassword(pw) {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(pw)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function attemptLogin(pw) {
  const h = await hashPassword(pw);
  if (h === AUTH_HASH) {
    sessionStorage.setItem(SESSION_KEY, AUTH_HASH);
    return true;
  }
  return false;
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  location.replace('login.html');
}
