import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { saveSecureImage } from '@/lib/security/upload';
import { recordAuditLog } from '@/lib/security/audit';

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const subDir = (formData.get('directory') as 'gallery' | 'articles' | 'exco') || 'gallery';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await saveSecureImage(buffer, subDir);
    if (!result.success || !result.filePath) {
      return NextResponse.json({ error: result.error || 'Failed to process image' }, { status: 400 });
    }

    await recordAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action: 'MEDIA_UPLOAD',
      targetEntity: 'media',
      targetId: result.filePath,
      details: `Uploaded to ${subDir}, size: ${file.size} bytes`,
      outcome: 'SUCCESS',
    });

    return NextResponse.json({ success: true, filePath: result.filePath });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Internal operational error during upload' }, { status: 500 });
  }
}
