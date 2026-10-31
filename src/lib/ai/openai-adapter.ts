import OpenAI from 'openai';
import { toFile } from 'openai/uploads';

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('AI provider is not configured.');
  return new OpenAI({ apiKey });
}

export interface RenderRequestParams {
  originalImageUrl: string;
  maskImageUrl: string;
  effectName: string;
  colorName: string;
  colorHex: string;
  promptAddon?: string;
}

export interface RenderResponse {
  success: boolean;
  renderedImageUrl?: string;
  error?: string;
}

export async function generateAIRender(params: RenderRequestParams): Promise<RenderResponse> {
  try {
    // Prompt construction for specialized paint finish
    const prompt = `Architectural realistic texture painting for wall finish. Replace the main wall surface with exact finish style: ${params.effectName}, color name: ${params.colorName} (${params.colorHex}). Preserve the architecture, furniture, openings and lighting. Ultra high detail, photorealistic lighting, seamless architectural integration.${params.promptAddon ? ` Additional direction: ${params.promptAddon}` : ''}`;

    // Calling OpenAI DALL-E 3 / Edit API
    // If running with real OpenAI API Key:
    const response = await getOpenAI().images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
    });

    const imageUrl = response.data?.[0]?.url;

    if (!imageUrl) {
      return { success: false, error: 'OpenAI returned empty image payload' };
    }

    return {
      success: true,
      renderedImageUrl: imageUrl,
    };
  } catch (err: any) {
    console.error('OpenAI Adapter Render Error:', err);
    return {
      success: false,
      error: err.message || 'AI Render provider connection failed',
    };
  }
}

export async function generateMaskedAIRender(params: {
  originalBuffer: Buffer;
  apiMaskBuffer: Buffer;
  effectName: string;
  colorName: string;
  promptAddon?: string;
  employeeCode?: string;
}): Promise<RenderResponse> {
  try {
    const prompt = `Edit only the transparent masked area of this architectural photo. Apply a realistic ${params.effectName} wall finish using the exact reference color ${params.colorName}. Preserve the room geometry, lighting direction and material scale. Do not alter doors, windows, furniture, floor, ceiling, decor, people or any unmasked area.${params.promptAddon ? ` Additional direction: ${params.promptAddon}` : ''}`;
    const response = await getOpenAI().images.edit({
      model: 'gpt-image-1',
      image: await toFile(params.originalBuffer, 'current-space.png', { type: 'image/png' }),
      mask: await toFile(params.apiMaskBuffer, 'selection-mask.png', { type: 'image/png' }),
      prompt,
      size: 'auto',
      quality: 'high',
      n: 1,
      user: params.employeeCode,
    });
    const output = response.data?.[0];
    if (output?.b64_json) {
      return { success: true, renderedImageUrl: `data:image/png;base64,${output.b64_json}` };
    }
    if (output?.url) return { success: true, renderedImageUrl: output.url };
    return { success: false, error: 'OpenAI không trả về dữ liệu hình ảnh' };
  } catch (error: any) {
    console.error('OpenAI Masked Render Error:', error);
    return { success: false, error: error.message || 'Không thể kết nối dịch vụ AI' };
  }
}
