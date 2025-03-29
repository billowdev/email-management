// src/app/api/templates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PrismaClient, Prisma } from '@prisma/client';

// Define the type for variable input
type VariableInput = {
  key: string;
  name: string;
  type: string;
  defaultValue?: string | null;
  description?: string | null;
  required?: boolean;
};

// GET /api/templates - Get all templates
export async function GET(request: NextRequest) {
  try {
    const templates = await prisma.emailTemplate.findMany({
      include: {
        variables: true,
        previewData: true,
      },
    });
    
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create a new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, defaultContent, variables, previewData, userId, folderId } = body;
    
    // Create the template with transaction to ensure all related data is created together
    const template = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create the template
      const newTemplate = await tx.emailTemplate.create({
        data: {
          name,
          description,
          defaultContent,
          userId,
          foldererId: folderId,
        },
      });
      
      // Create the variables
      if (variables && variables.length > 0) {
        await Promise.all(
          variables.map((variable: VariableInput) => 
            tx.templateVariable.create({
              data: {
                key: variable.key,
                name: variable.name,
                type: variable.type,
                defaultValue: variable.defaultValue || null,
                description: variable.description || null,
                required: variable.required || false,
                emailTemplateId: newTemplate.id,
              },
            })
          )
        );
      }
      
      // Create preview data if provided
      if (previewData) {
        await tx.previewData.create({
          data: {
            name: 'Default Preview',
            data: previewData,
            emailTemplateId: newTemplate.id,
          },
        });
      }
      
      // Return the created template with all its related data
      return tx.emailTemplate.findUnique({
        where: { id: newTemplate.id },
        include: {
          variables: true,
          previewData: true,
        },
      });
    });
    
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}