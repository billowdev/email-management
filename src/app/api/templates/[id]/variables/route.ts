// src/app/api/templates/[id]/variables/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/templates/:id/variables - Get all variables for a template
export async function GET(
  request: NextRequest,
  context: any,
  // { params }: { params: { id: string } }
) {
  try {
    // const { searchParams } = new URL(request.url);
    // const templateId = searchParams.get("id") as string;
 
    const { id: templateId } = await context.params;
    

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }
    const variables = await prisma.templateVariable.findMany({
      where: { emailTemplateId: templateId },
      orderBy: { key: 'asc' },
    });
    
    return NextResponse.json(variables);
  } catch (error) {
    console.error('Error fetching variables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variables' },
      { status: 500 }
    );
  }
}

// POST /api/templates/:id/variables - Add a new variable to a template
export async function POST(
  request: NextRequest,
  context:any,
  // { params }: { params: { id: string } }
) {
  try {
    // const { searchParams } = new URL(request.url);
    // const templateId = searchParams.get("id") as string;
  
    const { id: templateId } = await context.params;
    
    const body = await request.json();
    const { key, name, type, defaultValue, description, required } = body;
    
    // Validate required fields
    if (!key || !name) {
      return NextResponse.json(
        { error: 'Key and name are required' },
        { status: 400 }
      );
    }
    
    // Check if template exists
    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    
    // Check if variable with this key already exists
    const existingVariable = await prisma.templateVariable.findFirst({
      where: {
        emailTemplateId: templateId,
        key,
      },
    });
    
    if (existingVariable) {
      return NextResponse.json(
        { error: 'A variable with this key already exists' },
        { status: 409 }
      );
    }
    
    // Create the new variable
    const variable = await prisma.templateVariable.create({
      data: {
        key,
        name,
        type: type || 'TEXT',
        defaultValue: defaultValue || null,
        description: description || null,
        required: required || false,
        emailTemplateId: templateId,
      },
    });
    
    return NextResponse.json(variable, { status: 201 });
  } catch (error) {
    console.error('Error creating variable:', error);
    return NextResponse.json(
      { error: 'Failed to create variable' },
      { status: 500 }
    );
  }
}