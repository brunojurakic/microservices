import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { user } from '@/db/schema';
import { count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [userCountResult] = await db.select({ count: count() }).from(user);

    return NextResponse.json({
      userCount: userCountResult.count,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
