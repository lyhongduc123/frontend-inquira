import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/auth/logout - Logout and revoke refresh token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': request.headers.get('Authorization') || '',
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error logging out:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
