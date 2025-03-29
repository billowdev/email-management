// src/app/api/templates/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/templates/:id - Get template by ID
export async function GET(
  request: NextRequest,
  context:any,
  // { params }: { params: Promise<{ id: string }> }
) {
  try {
    // const { searchParams } = new URL(request.url);
 
    const { id: templateId } = await context.params;
    
    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
      include: {
        variables: true,
        previewData: true,
      },
    });
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// PUT /api/templates/:id - Update template
export async function PUT(
  request: NextRequest,
  context: any
  // context: { params: { id: string } }
) {
  // const { searchParams } = new URL(request.url);
  // const templateId = searchParams.get("id") as string;
 
  const { id: templateId } = await context.params;
    

  try {
    // const templateId = params.id;
    const body = await request.json();
    const { name, description, defaultContent, variables } = body;
    
    // First check if template exists
    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    
    // Update the template
    const updatedTemplate = await prisma.emailTemplate.update({
      where: { id: templateId },
      data: {
        name,
        description,
        defaultContent,
      },
      include: {
        variables: true,
        previewData: true,
      },
    });
    
    // If variables are provided, update them
    if (variables && Array.isArray(variables)) {
      // Delete existing variables first, if it's a complete replacement
      if (body.replaceAllVariables) {
        await prisma.templateVariable.deleteMany({
          where: { emailTemplateId: templateId },
        });
        
        // Then create the new variables
        await Promise.all(
          variables.map(variable => 
            prisma.templateVariable.create({
              data: {
                key: variable.key,
                name: variable.name,
                type: variable.type || 'TEXT',
                defaultValue: variable.defaultValue || null,
                description: variable.description || null,
                required: variable.required || false,
                emailTemplateId: templateId,
              },
            })
          )
        );
      }
      
      // Fetch the updated template with new variables
      const refreshedTemplate = await prisma.emailTemplate.findUnique({
        where: { id: templateId },
        include: {
          variables: true,
          previewData: true,
        },
      });
      
      return NextResponse.json(refreshedTemplate);
    }
    
    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/:id - Delete template
export async function DELETE(
  request: NextRequest,
  context:any,
  // { params }: { params: { id: string } }
) {
  try {
    // const { searchParams } = new URL(request.url);
    // const templateId = searchParams.get("id") as string;
    // const templateId = await context.params.id as string;

     
    const { id: templateId } = await context.params;
    
    
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
    
    // Prevent deletion of system templates
    if (template.isSystem) {
      return NextResponse.json(
        { error: 'Cannot delete system templates' },
        { status: 403 }
      );
    }
    
    // Delete the template (cascades to variables and preview data)
    await prisma.emailTemplate.delete({
      where: { id: templateId },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}