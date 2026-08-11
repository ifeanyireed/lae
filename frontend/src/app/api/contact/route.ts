import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, category, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, Email, and Message are required fields.' },
        { status: 400 }
      );
    }

    const playerServiceUrl = process.env.NEXT_PUBLIC_PLAYER_SERVICE_URL || 'http://localhost:8081';

    const response = await fetch(`${playerServiceUrl}/api/v1/contact/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, category, message }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
