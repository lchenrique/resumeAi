import { NextResponse } from 'next/server';
import { OpenRouter } from '@/lib/openrouter';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { content, template } = await req.json();
    
    if (!content || !template) {
      return NextResponse.json(
        { error: 'Resume content and template are required' },
        { status: 400 }
      );
    }
    
    // Use OpenRouter to generate HTML for the resume
    const openRouter = new OpenRouter();
    const systemPrompt = `You are an expert HTML/CSS developer specializing in resume design.
    
    Create a beautiful, print-ready HTML resume based on the JSON data and template style provided.
    
    The HTML should:
    1. Be fully self-contained with inline CSS
    2. Use clean, semantic HTML5
    3. Be optimized for PDF printing (A4 size)
    4. Include appropriate styling based on the requested template style
    5. Format the content professionally
    
    Return ONLY the complete HTML code without any explanation, markdown formatting, or code blocks.`;
    
    const response = await openRouter.chat({
      model: 'shisa-ai/shisa-v2-llama3.3-70b:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Create a professional resume using the "${template}" template style with the following content:\n\n${JSON.stringify(content, null, 2)}` 
        }
      ],
    });
    
    // Clean up the response to get only the HTML
    let html = response;
    
    // If the response includes markdown code blocks, extract just the HTML
    if (html.includes('```html')) {
      html = html.split('```html')[1].split('```')[0].trim();
    } else if (html.includes('```')) {
      html = html.split('```')[1].split('```')[0].trim();
    }
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': 'attachment; filename="resume.html"',
      },
    });
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      { error: 'Failed to export resume' },
      { status: 500 }
    );
  }
}