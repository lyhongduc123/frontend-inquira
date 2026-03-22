import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/core';

/**
 * GET /api/v1/admin/institutions/[institution_id] - Get an institution
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ institution_id: string }> }
) {
  try {
    const { institution_id } = await params;

    // Forward cookies from request to backend
    const cookies = request.headers.get('cookie');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(cookies ? { 'Cookie': cookies } : {}),
    };

    // Keep Authorization header for backward compatibility
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/admin/institutions/${institution_id}`,
      {
        headers,
        credentials: 'include',
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching institution:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/admin/institutions/[institution_id] - Update an institution
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ institution_id: string }> }
) {
  try {
    const { institution_id } = await params;
    const body = await request.json();

    // Forward cookies from request to backend
    const cookies = request.headers.get('cookie');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(cookies ? { 'Cookie': cookies } : {}),
    };

    // Keep Authorization header for backward compatibility
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/admin/institutions/${institution_id}`,
      {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating institution:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/admin/institutions/[institution_id] - Delete an institution
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ institution_id: string }> }
) {
  try {
    const { institution_id } = await params;

    // Forward cookies from request to backend
    const cookies = request.headers.get('cookie');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(cookies ? { 'Cookie': cookies } : {}),
    };

    // Keep Authorization header for backward compatibility
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/admin/institutions/${institution_id}`,
      {
        method: 'DELETE',
        headers,
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting institution:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
