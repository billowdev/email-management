// src/app/api/templates/[id]/variables/[variableId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  id: string;
  variableId: string;
}

// GET /api/templates/:id/variables/:variableId - Get a specific variable
export async function GET(
  request: NextRequest,
  context:any,
  // { params }: { params: RouteParams }
) {
  try {
    // const { id: templateId, variableId } = params;
    
    // const { searchParams } = new URL(request.url);
    // const templateId = searchParams.get("id") as string;
    // const variableId = searchParams.get("variableId") as string;


    const { id: templateId } = await context.params;
    const { variableId } = await context.params;



    const variable = await prisma.templateVariable.findFirst({
      where: {
        id: variableId,
        emailTemplateId: templateId,
      },
    });
    
    if (!variable) {
      return NextResponse.json(
        { error: 'Variable not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(variable);
  } catch (error) {
    console.error('Error fetching variable:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variable' },
      { status: 500 }
    );
  }
}

// PUT /api/templates/:id/variables/:variableId - Update a variable
export async function PUT(
  request: NextRequest,
  context: any,
  // { params }: { params: RouteParams }
) {
  try {
    // const { searchParams } = new URL(request.url);
    // const templateId = searchParams.get("id") as string;
    // const variableId = searchParams.get("variableId") as string;

    const { id: templateId } = await context.params;
    const { variableId } = await context.params;

    const body = await request.json();
    const { key, name, type, defaultValue, description, required } = body;
    
    // Check if variable exists
    const variable = await prisma.templateVariable.findFirst({
      where: {
        id: variableId,
        emailTemplateId: templateId,
      },
    });
    
    if (!variable) {
      return NextResponse.json(
        { error: 'Variable not found' },
        { status: 404 }
      );
    }
    
    // If key is being changed, check for duplicates
    if (key && key !== variable.key) {
      const existingVariable = await prisma.templateVariable.findFirst({
        where: {
          emailTemplateId: templateId,
          key,
          id: { not: variableId }, // Exclude current variable from check
        },
      });
      
      if (existingVariable) {
        return NextResponse.json(
          { error: 'A variable with this key already exists' },
          { status: 409 }
        );
      }
    }
    
    // Update the variable
    const updatedVariable = await prisma.templateVariable.update({
      where: { id: variableId },
      data: {
        key: key || variable.key,
        name: name || variable.name,
        type: type || variable.type,
        defaultValue: defaultValue !== undefined ? defaultValue : variable.defaultValue,
        description: description !== undefined ? description : variable.description,
        required: required !== undefined ? required : variable.required,
      },
    });
    
    return NextResponse.json(updatedVariable);
  } catch (error) {
    console.error('Error updating variable:', error);
    return NextResponse.json(
      { error: 'Failed to update variable' },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/:id/variables/:variableId - Delete a variable
export async function DELETE(
  request: NextRequest,
  context:any,
  // { params }: { params: RouteParams }
) {
  try {
    // const { searchParams } = new URL(request.url);
    // const templateId = searchParams.get("id") as string;
    // const variableId = searchParams.get("variableId") as string;
 
    const { id: templateId } = await context.params;
    const { variableId } = await context.params;

    // Check if variable exists
    const variable = await prisma.templateVariable.findFirst({
      where: {
        id: variableId,
        emailTemplateId: templateId,
      },
    });
    
    if (!variable) {
      return NextResponse.json(
        { error: 'Variable not found' },
        { status: 404 }
      );
    }
    
    // Delete the variable
    await prisma.templateVariable.delete({
      where: { id: variableId },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting variable:', error);
    return NextResponse.json(
      { error: 'Failed to delete variable' },
      { status: 500 }
    );
  }
}