import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

/**
 * GET /api/conversations - List all conversations
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('page_size') || '20';
    const archived = searchParams.get('archived');

    const params = new URLSearchParams({
      page,
      page_size: pageSize,
    });

    if (archived !== null) {
      params.append('archived', archived);
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': request.headers.get('Authorization') || '',
    };

    const response = await fetch(`${BACKEND_URL}/api/v1/conversations?${params}`, {
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Failed to fetch conversations: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations - Create a new conversation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': request.headers.get('Authorization') || '',
    };

    const response = await fetch(`${BACKEND_URL}/api/v1/conversations`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Failed to create conversation: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
