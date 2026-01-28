import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/core';

/**
 * GET /api/conversations/[id] - Get a specific conversation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': request.headers.get('Authorization') || '',
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/conversations/${id}`, {
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Backend returns ApiResponse with error field
      return NextResponse.json(
        data,
        { status: response.status }
      );
    }

    // Pass through the ApiResponse structure
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/conversations/[id] - Update a conversation
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': request.headers.get('Authorization') || '',
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/conversations/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      // Backend returns ApiResponse with error field
      return NextResponse.json(
        data,
        { status: response.status }
      );
    }

    // Pass through the ApiResponse structure
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/conversations/[id] - Delete a conversation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await fetch(`${API_BASE_URL}/api/v1/conversations/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Backend returns ApiResponse with error field
      return NextResponse.json(
        data,
        { status: response.status }
      );
    }

    // Pass through the ApiResponse structure
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
