// src/app/api/templates/[id]/header-footer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/templates/:id/header-footer - Get header/footer settings
export async function GET(request: NextRequest, context: any) {
  try {
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
    
    // Get header/footer settings
    const headerFooter = await prisma.emailTemplateHeaderFooter.findUnique({
      where: { emailTemplateId: templateId },
    });
    
    if (!headerFooter) {
      return NextResponse.json(
        { error: 'Header/footer settings not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(headerFooter.settings);
  } catch (error) {
    console.error('Error fetching header/footer settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch header/footer settings' },
      { status: 500 }
    );
  }
}

// PUT /api/templates/:id/header-footer - Update header/footer settings
export async function PUT(request: NextRequest, context: any) {
  try {
    const { id: templateId } = await context.params;
    const settings = await request.json();
    
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
    
    // Check if header/footer settings exist
    const existingHeaderFooter = await prisma.emailTemplateHeaderFooter.findUnique({
      where: { emailTemplateId: templateId },
    });
    
    let headerFooter;
    
    if (existingHeaderFooter) {
      // Update existing settings
      headerFooter = await prisma.emailTemplateHeaderFooter.update({
        where: { id: existingHeaderFooter.id },
        data: {
          settings: settings
        },
      });
    } else {
      // Create new settings
      headerFooter = await prisma.emailTemplateHeaderFooter.create({
        data: {
          emailTemplateId: templateId,
          settings: settings
        },
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating header/footer settings:', error);
    return NextResponse.json(
      { error: 'Failed to update header/footer settings' },
      { status: 500 }
    );
  }
}