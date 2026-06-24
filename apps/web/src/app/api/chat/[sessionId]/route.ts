import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, chatSessions, chatMessages } from '@vidforge/db';
import { eq, and, asc } from 'drizzle-orm';

export async function GET(request: Request, context: { params: Promise<{ sessionId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await context.params;

    // Verify ownership
    const chatSession = await db.query.chatSessions.findFirst({
      where: eq(chatSessions.id, sessionId)
    });

    if (!chatSession) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Admins could potentially view any chat, but for now restrict to user's tenant/id
    const isAdmin = (session.user as any).role === 'admin';
    if (chatSession.userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await db.query.chatMessages.findMany({
      where: eq(chatMessages.sessionId, sessionId),
      orderBy: [asc(chatMessages.createdAt)]
    });

    return NextResponse.json({ session: chatSession, messages });
  } catch (error) {
    console.error('Error fetching chat session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
