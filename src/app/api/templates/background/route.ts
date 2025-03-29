// src/app/api/templates/[id]/background/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/templates/:id/background - Get background settings for a template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;
    
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
    
    // Get background settings
    const background = await prisma.emailTemplateBackground.findUnique({
      where: { emailTemplateId: templateId },
    });
    
    if (!background) {
      return NextResponse.json(
        { error: 'Background settings not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(background);
  } catch (error) {
    console.error('Error fetching background settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch background settings' },
      { status: 500 }
    );
  }
}

// PUT /api/templates/:id/background - Update background settings for a template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;
    const body = await request.json();
    const { 
      bodyBgColor, 
      containerBgColor, 
      headerBgColor, 
      contentBgColor, 
      footerBgColor, 
      maxWidth 
    } = body;
    
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
    
    // Check if background settings exist
    const existingBackground = await prisma.emailTemplateBackground.findUnique({
      where: { emailTemplateId: templateId },
    });
    
    let background;
    
    if (existingBackground) {
      // Update existing background settings
      background = await prisma.emailTemplateBackground.update({
        where: { emailTemplateId: templateId },
        data: {
          bodyBgColor: bodyBgColor || existingBackground.bodyBgColor,
          containerBgColor: containerBgColor || existingBackground.containerBgColor,
          headerBgColor: headerBgColor || existingBackground.headerBgColor,
          contentBgColor: contentBgColor || existingBackground.contentBgColor,
          footerBgColor: footerBgColor || existingBackground.footerBgColor,
          maxWidth: maxWidth || existingBackground.maxWidth,
        },
      });
    } else {
      // Create new background settings
      background = await prisma.emailTemplateBackground.create({
        data: {
          bodyBgColor: bodyBgColor || '#D9D9D9',
          containerBgColor: containerBgColor || '#FFFFFF',
          headerBgColor: headerBgColor || '#33A8DF',
          contentBgColor: contentBgColor || '#FFFFFF',
          footerBgColor: footerBgColor || '#33A8DF',
          maxWidth: maxWidth || '650px',
          emailTemplateId: templateId,
        },
      });
    }
    
    return NextResponse.json(background);
  } catch (error) {
    console.error('Error updating background settings:', error);
    return NextResponse.json(
      { error: 'Failed to update background settings' },
      { status: 500 }
    );
  }
}