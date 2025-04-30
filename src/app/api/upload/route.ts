import { NextResponse } from 'next/server';
import { Readable } from 'stream';
import { OpenRouter } from '@/lib/openrouter';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }
    
    // Convert file to Base64
    const fileBuffer = await file.arrayBuffer();
    const fileBase64 = Buffer.from(fileBuffer).toString('base64');
    const mimeType = file.type;
    const fileName = file.name;
    
    // Prepare system prompt
    const systemPrompt = `You are an AI assistant specializing in resume parsing and improvement.
    You will be provided with a resume file encoded in base64. Your task is to:
    
    1. Extract all relevant information from the resume
    2. Organize it into a structured JSON format following this schema:
    
    {
      "personal": {
        "name": "Full Name",
        "title": "Professional Title",
        "email": "email@example.com",
        "phone": "Phone Number",
        "location": "City, State"
      },
      "summary": "Professional summary...",
      "experience": [
        {
          "title": "Job Title",
          "company": "Company Name",
          "period": "Start Date - End Date",
          "description": "• Achievement 1\\n• Achievement 2..."
        }
      ],
      "education": [
        {
          "degree": "Degree Name",
          "institution": "Institution Name",
          "period": "Start Year - End Year"
        }
      ],
      "skills": ["Skill 1", "Skill 2", "Skill 3"]
    }
    
    Return ONLY the valid JSON object without any additional text or explanation.`;
    
    // Query OpenRouter
    const openRouter = new OpenRouter();
    const response = await openRouter.chat({
      model: 'shisa-ai/shisa-v2-llama3.3-70b:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Here is a resume file (${fileName}) encoded in base64 with MIME type ${mimeType}:\n\n${fileBase64}` 
        }
      ],
    });
    
    // Parse the response as JSON
    try {
      const content = JSON.parse(response);
      
      return NextResponse.json({
        message: 'Resume parsed successfully',
        content
      });
    } catch (e) {
      // If parsing fails, try to extract JSON from the response
      const jsonMatch = response.match(/({[\s\S]*})/);
      if (jsonMatch && jsonMatch[0]) {
        try {
          const content = JSON.parse(jsonMatch[0]);
          return NextResponse.json({
            message: 'Resume parsed successfully',
            content
          });
        } catch (e) {
          return NextResponse.json(
            { error: 'Failed to parse resume content' },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Failed to extract structured data from resume' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Failed to process resume upload' },
      { status: 500 }
    );
  }
}