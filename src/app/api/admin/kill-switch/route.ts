import { NextRequest, NextResponse } from 'next/server';
import { requireApiAdmin } from '@/lib/auth/authorization';

let isKillSwitchActive = false;

export async function GET() {
  const authorization = await requireApiAdmin();
  if (!authorization.ok) return NextResponse.json({ error: authorization.message }, { status: authorization.status });
  return NextResponse.json({
    success: true,
    killSwitch: isKillSwitchActive,
  });
}

export async function POST(request: NextRequest) {
  try {
    const authorization = await requireApiAdmin();
    if (!authorization.ok) return NextResponse.json({ error: authorization.message }, { status: authorization.status });
    const body = await request.json();
    if (typeof body.killSwitch === 'boolean') {
      isKillSwitchActive = body.killSwitch;
    }

    return NextResponse.json({
      success: true,
      message: `Kill switch updated to ${isKillSwitchActive}`,
      killSwitch: isKillSwitchActive,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Kill switch error' },
      { status: 500 }
    );
  }
}
