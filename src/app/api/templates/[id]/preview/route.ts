// src/app/api/templates/[id]/preview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/templates/:id/preview - Get preview data for a template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;
    
    const previewData = await prisma.previewData.findFirst({
      where: { emailTemplateId: templateId },
      orderBy: { updatedAt: 'desc' },
    });
    
    if (!previewData) {
      return NextResponse.json(
        { error: 'Preview data not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(previewData);
  } catch (error) {
    console.error('Error fetching preview data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preview data' },
      { status: 500 }
    );
  }
}

// PUT /api/templates/:id/preview - Update preview data for a template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;
    const body = await request.json();
    const { data, name } = body;
    
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
    
    // Check if preview data exists
    const existingPreviewData = await prisma.previewData.findFirst({
      where: { emailTemplateId: templateId },
    });
    
    let previewData;
    
    if (existingPreviewData) {
      // Update existing preview data
      previewData = await prisma.previewData.update({
        where: { id: existingPreviewData.id },
        data: {
          name: name || existingPreviewData.name,
          data: data || existingPreviewData.data,
        },
      });
    } else {
      // Create new preview data
      previewData = await prisma.previewData.create({
        data: {
          name: name || 'Default Preview',
          data: data || {},
          emailTemplateId: templateId,
        },
      });
    }
    
    return NextResponse.json(previewData);
  } catch (error) {
    console.error('Error updating preview data:', error);
    return NextResponse.json(
      { error: 'Failed to update preview data' },
      { status: 500 }
    );
  }
}