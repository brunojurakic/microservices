'use client';

export async function getJWTToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/token', {
      credentials: 'include',
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.token;
  } catch (error) {
    console.error('Failed to get JWT token:', error);
    return null;
  }
}
