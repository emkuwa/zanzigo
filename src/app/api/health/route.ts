import { NextResponse } from 'next/server';

export async function GET() {
  // Minimal health check - no external dependencies
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
}
