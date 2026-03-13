import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/auth/logout - Logout and revoke refresh token from httpOnly cookie
 */
export async function POST(request: NextRequest) {
  try {
    // Forward cookies and authorization from request to backend
    const cookies = request.headers.get('cookie');
    const authorization = request.headers.get('Authorization');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(authorization ? { 'Authorization': authorization } : {}),
      ...(cookies ? { 'Cookie': cookies } : {}),
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Forward set-cookie headers (cookie deletion) from backend to client
    const nextResponse = NextResponse.json(data);
    const setCookieHeaders = response.headers.getSetCookie();
    setCookieHeaders.forEach(cookie => {
      nextResponse.headers.append('Set-Cookie', cookie);
    });

    return nextResponse;
  } catch (error) {
    console.error('Error logging out:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
