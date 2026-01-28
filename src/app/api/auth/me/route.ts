import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/auth/me - Get current user info
 */
export async function GET(request: NextRequest) {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': request.headers.get('Authorization') || '',
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
