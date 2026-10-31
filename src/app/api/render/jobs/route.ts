import { NextRequest, NextResponse } from 'next/server';
import { generateAIRender, generateMaskedAIRender } from '@/lib/ai/openai-adapter';
import { renderJobSchema } from '@/lib/validation/schemas';
import paints from '@/lib/data/generated-paints.json';
import sharp from 'sharp';
import { compositeRenderOutput } from '@/lib/image-processing/composite';
import { requireApiRole } from '@/lib/auth/authorization';
import { hasAcceptableJsonBody, isRateLimited, isSameOrigin, noStoreJson } from '@/lib/security/request';

function dataUrlToBuffer(value: string) {
  const match = value.match(/^data:image\/[\w+.-]+;base64,(.+)$/);
  if (!match) throw new Error('Dữ liệu ảnh hoặc mask không hợp lệ');
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(match[1])) throw new Error('Invalid base64 image data.');
  return Buffer.from(match[1], 'base64');
}

async function providerImageToBuffer(value: string) {
  if (value.startsWith('data:')) return dataUrlToBuffer(value);
  const url = new URL(value);
  if (url.protocol !== 'https:' || !url.hostname.endsWith('.blob.core.windows.net')) throw new Error('AI provider returned an untrusted image URL.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(url, { signal: controller.signal, redirect: 'error' });
    const contentLength = Number(response.headers.get('content-length') || 0);
    if (!response.ok || (contentLength && contentLength > 12_000_000)) throw new Error('Unable to retrieve generated image.');
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > 12_000_000) throw new Error('Generated image is too large.');
    return buffer;
  } finally { clearTimeout(timeout); }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSameOrigin(request)) return noStoreJson({ success: false, error: 'Invalid request origin.' }, { status: 403 });
    if (!hasAcceptableJsonBody(request, 18_000_000)) return noStoreJson({ success: false, error: 'Request body is too large.' }, { status: 413 });
    if (isRateLimited(request, 'render', 5, 60_000)) return noStoreJson({ success: false, error: 'Too many render requests. Please retry shortly.' }, { status: 429 });
    const authorization = await requireApiRole(['super_admin', 'admin', 'manager', 'technician']);
    if (!authorization.ok) return NextResponse.json({ success: false, error: authorization.message }, { status: authorization.status });
    const body = await request.json();

    if (body.originalImageBase64 && body.selectionMaskBase64) {
      const paint = paints.find((item) => item.code.toUpperCase() === String(body.colorId).toUpperCase());
      if (!paint) return NextResponse.json({ success: false, error: 'Không tìm thấy mã sơn đã chọn' }, { status: 400 });
      if (!body.employeeCode || String(body.employeeCode).trim().length < 2) return NextResponse.json({ success: false, error: 'Vui lòng nhập mã nhân viên' }, { status: 400 });

      if (body.originalImageBase64.length > 8_000_000 || body.selectionMaskBase64.length > 8_000_000) return NextResponse.json({ success: false, error: 'Ảnh vượt giới hạn xử lý.' }, { status: 413 });
      const originalInput = dataUrlToBuffer(body.originalImageBase64);
      const selectionInput = dataUrlToBuffer(body.selectionMaskBase64);
      const metadata = await sharp(originalInput).metadata();
      const width = metadata.width || 1024, height = metadata.height || 1024;
      if (width * height > 16_000_000) return NextResponse.json({ success: false, error: 'Kích thước ảnh quá lớn.' }, { status: 413 });
      const originalPng = await sharp(originalInput).resize(width, height).png().toBuffer();
      const selectionPng = await sharp(selectionInput).resize(width, height, { fit: 'fill' }).png().toBuffer();
      const selectionAlpha = await sharp(selectionPng).extractChannel('alpha').raw().toBuffer();
      const binaryAlpha = await sharp(selectionAlpha, { raw: { width, height, channels: 1 } }).threshold(10).raw().toBuffer();
      const invertedAlpha = await sharp(binaryAlpha, { raw: { width, height, channels: 1 } }).negate().raw().toBuffer();
      const whiteRgb = await sharp({ create: { width, height, channels: 3, background: { r: 255, g: 255, b: 255 } } }).raw().toBuffer();
      const apiMask = await sharp(whiteRgb, { raw: { width, height, channels: 3 } })
        .joinChannel(invertedAlpha, { raw: { width, height, channels: 1 } }).png().toBuffer();
      const compositeMask = await sharp(whiteRgb, { raw: { width, height, channels: 3 } })
        .joinChannel(binaryAlpha, { raw: { width, height, channels: 1 } }).png().toBuffer();

      const aiResult = await generateMaskedAIRender({
        originalBuffer: originalPng,
        apiMaskBuffer: apiMask,
        effectName: paint.category,
        colorName: `${paint.code} · ${paint.name}`,
        promptAddon: String(body.promptAddon || '').slice(0, 500),
        employeeCode: String(body.employeeCode),
      });
      if (!aiResult.success || !aiResult.renderedImageUrl) {
        return NextResponse.json({ success: false, error: aiResult.error }, { status: 500 });
      }
      const aiBuffer = await providerImageToBuffer(aiResult.renderedImageUrl);
      const composite = await compositeRenderOutput(originalPng, aiBuffer, compositeMask);
      return NextResponse.json({
        success: true,
        data: {
          jobId: `job-${Date.now()}`,
          status: 'completed',
          renderedImageUrl: `data:image/webp;base64,${composite.finalBuffer.toString('base64')}`,
          maskedPixelRatio: composite.maskedPixelRatio,
        },
      });
    }

    // 1. Zod Validation
    const validation = renderJobSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { colorId, promptAddon } = validation.data;
    const paint = paints.find((item) => item.code.toUpperCase() === colorId.toUpperCase());

    if (!paint) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy mã sơn đã chọn' },
        { status: 400 }
      );
    }

    // 2. Call OpenAI Adapter
    const aiResult = await generateAIRender({
      originalImageUrl: 'https://demo.supabase.co/storage/v1/object/public/originals/demo.png',
      maskImageUrl: 'data:image/png;base64,...',
      effectName: paint.category,
      colorName: `${paint.code} · ${paint.name}`,
      colorHex: '#079391',
      promptAddon,
    });

    if (!aiResult.success) {
      return NextResponse.json(
        { success: false, error: aiResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Render job completed via OpenAI & Sharp composite',
      data: {
        jobId: `job-${Date.now()}`,
        status: 'completed',
        renderedImageUrl: aiResult.renderedImageUrl,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: 'Không thể xử lý yêu cầu render.' },
      { status: 500 }
    );
  }
}
