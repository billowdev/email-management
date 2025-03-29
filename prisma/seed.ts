// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Since VariableType isn't exported directly, we need to define it manually
// to match the enum in the schema
type VariableType = 'TEXT' | 'DATE' | 'NUMBER' | 'EMAIL' | 'URL' | 'BOOLEAN';

async function main() {
  console.log('Starting seed...');

  // Create default welcome email template
  const welcomeEmailTemplate = await prisma.emailTemplate.create({
    data: {
      name: 'Welcome Email',
      description: 'Default welcome email for new users',
      defaultContent: `
        <h2>Welcome to {{.companyName}}!</h2>
        <p>Hello {{.firstName}},</p>
        <p>Thank you for joining us. We're excited to have you on board!</p>
        <p>You can log in to your account using <a href="{{.loginLink}}">this link</a>.</p>
        <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
        <p>Best regards,<br>The {{.companyName}} Team</p>
      `,
      isSystem: true,
      variables: {
        create: [
          {
            key: 'firstName',
            name: 'First Name',
            type: 'TEXT' as VariableType,
            defaultValue: 'John',
            required: true
          },
          {
            key: 'lastName',
            name: 'Last Name',
            type: 'TEXT' as VariableType,
            defaultValue: 'Doe',
            required: true
          },
          {
            key: 'companyName',
            name: 'Company Name',
            type: 'TEXT' as VariableType,
            defaultValue: 'Acme Inc',
            required: true
          },
          {
            key: 'loginLink',
            name: 'Login Link',
            type: 'URL' as VariableType,
            defaultValue: 'https://example.com/login',
            required: true
          }
        ]
      },
      previewData: {
        create: {
          name: 'Default Preview',
          data: {
            firstName: 'John',
            lastName: 'Doe',
            companyName: 'Acme Inc',
            loginLink: 'https://example.com/login'
          }
        }
      }
    }
  });

  // Create default order confirmation email template
  const orderConfirmationTemplate = await prisma.emailTemplate.create({
    data: {
      name: 'Order Confirmation',
      description: 'Default order confirmation email',
      defaultContent: `
        <h2>Order Confirmation</h2>
        <p>Dear {{.firstName}},</p>
        <p>Thank you for your order! We're processing it now.</p>
        <p><strong>Order #{{.orderNumber}}</strong> placed on {{.orderDate}}</p>
        <p>Your items will be shipped to:</p>
        <p>{{.deliveryAddress}}</p>
        <p>We'll send you another email when your package ships.</p>
        <p>Thank you for shopping with us!</p>
      `,
      isSystem: true,
      variables: {
        create: [
          {
            key: 'firstName',
            name: 'First Name',
            type: 'TEXT' as VariableType,
            defaultValue: 'John',
            required: true
          },
          {
            key: 'orderNumber',
            name: 'Order Number',
            type: 'TEXT' as VariableType,
            defaultValue: '12345',
            required: true
          },
          {
            key: 'orderDate',
            name: 'Order Date',
            type: 'DATE' as VariableType,
            defaultValue: new Date().toISOString().split('T')[0],
            required: true
          },
          {
            key: 'totalAmount',
            name: 'Total Amount',
            type: 'NUMBER' as VariableType,
            defaultValue: '149.99',
            required: true
          },
          {
            key: 'deliveryAddress',
            name: 'Delivery Address',
            type: 'TEXT' as VariableType,
            defaultValue: '123 Main St, Anytown, ST 12345',
            required: true
          }
        ]
      },
      previewData: {
        create: {
          name: 'Default Preview',
          data: {
            firstName: 'John',
            orderNumber: '12345',
            orderDate: new Date().toISOString().split('T')[0],
            totalAmount: '149.99',
            deliveryAddress: '123 Main St, Anytown, ST 12345'
          }
        }
      }
    }
  });

  // Create password reset email template
  const passwordResetTemplate = await prisma.emailTemplate.create({
    data: {
      name: 'Password Reset',
      description: 'Email for password reset requests',
      defaultContent: `
        <h2>Password Reset Request</h2>
        <p>Hello {{.firstName}},</p>
        <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
        <p>To reset your password, click on the link below:</p>
        <p><a href="{{.resetLink}}">Reset Your Password</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Thank you,<br>The {{.companyName}} Team</p>
      `,
      isSystem: true,
      variables: {
        create: [
          {
            key: 'firstName',
            name: 'First Name',
            type: 'TEXT' as VariableType,
            defaultValue: 'John',
            required: true
          },
          {
            key: 'resetLink',
            name: 'Reset Link',
            type: 'URL' as VariableType,
            defaultValue: 'https://example.com/reset-password?token=abc123',
            required: true
          },
          {
            key: 'companyName',
            name: 'Company Name',
            type: 'TEXT' as VariableType,
            defaultValue: 'Acme Inc',
            required: true
          }
        ]
      },
      previewData: {
        create: {
          name: 'Default Preview',
          data: {
            firstName: 'John',
            resetLink: 'https://example.com/reset-password?token=abc123',
            companyName: 'Acme Inc'
          }
        }
      }
    }
  });

  // Create shipping notification email template
  const shippingNotificationTemplate = await prisma.emailTemplate.create({
    data: {
      name: 'Shipping Notification',
      description: 'Email for when an order has shipped',
      defaultContent: `
        <h2>Your Order Has Shipped!</h2>
        <p>Dear {{.firstName}},</p>
        <p>Great news! Your order #{{.orderNumber}} has shipped and is on its way to you.</p>
        <p><strong>Tracking Information:</strong></p>
        <p>Tracking Number: {{.trackingNumber}}<br>
        Carrier: {{.carrier}}</p>
        <p>You can track your package here: <a href="{{.trackingLink}}">Track Package</a></p>
        <p>Expected delivery date: {{.deliveryDate}}</p>
        <p>Thank you for your business!</p>
        <p>Best regards,<br>The {{.companyName}} Team</p>
      `,
      isSystem: true,
      variables: {
        create: [
          {
            key: 'firstName',
            name: 'First Name',
            type: 'TEXT' as VariableType,
            defaultValue: 'John',
            required: true
          },
          {
            key: 'orderNumber',
            name: 'Order Number',
            type: 'TEXT' as VariableType,
            defaultValue: '12345',
            required: true
          },
          {
            key: 'trackingNumber',
            name: 'Tracking Number',
            type: 'TEXT' as VariableType,
            defaultValue: '1Z999AA10123456784',
            required: true
          },
          {
            key: 'carrier',
            name: 'Carrier',
            type: 'TEXT' as VariableType,
            defaultValue: 'UPS',
            required: true
          },
          {
            key: 'trackingLink',
            name: 'Tracking Link',
            type: 'URL' as VariableType,
            defaultValue: 'https://www.ups.com/track?tracknum=1Z999AA10123456784',
            required: true
          },
          {
            key: 'deliveryDate',
            name: 'Expected Delivery Date',
            type: 'DATE' as VariableType,
            defaultValue: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            required: true
          },
          {
            key: 'companyName',
            name: 'Company Name',
            type: 'TEXT' as VariableType,
            defaultValue: 'Acme Inc',
            required: true
          }
        ]
      },
      previewData: {
        create: {
          name: 'Default Preview',
          data: {
            firstName: 'John',
            orderNumber: '12345',
            trackingNumber: '1Z999AA10123456784',
            carrier: 'UPS',
            trackingLink: 'https://www.ups.com/track?tracknum=1Z999AA10123456784',
            deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            companyName: 'Acme Inc'
          }
        }
      }
    }
  });

  // Create a template folder
  const marketingFolder = await prisma.templateFolder.create({
    data: {
      name: 'Marketing Templates',
      description: 'Email templates for marketing campaigns'
    }
  });

  // Create newsletter template in the marketing folder
  const newsletterTemplate = await prisma.emailTemplate.create({
    data: {
      name: 'Monthly Newsletter',
      description: 'Standard monthly newsletter template',
      defaultContent: `
        <h2>{{.companyName}} Newsletter - {{.month}} {{.year}}</h2>
        <p>Hello {{.firstName}},</p>
        <h3>This Month's Highlights</h3>
        <p>{{.highlight1}}</p>
        <h3>Featured Products</h3>
        <p>{{.featuredContent}}</p>
        <h3>Upcoming Events</h3>
        <p>{{.events}}</p>
        <p>You are receiving this email because you subscribed to our newsletter. 
        <a href="{{.unsubscribeLink}}">Unsubscribe here</a>.</p>
        <p>Best regards,<br>The {{.companyName}} Team</p>
      `,
      isSystem: false,
      foldererId: marketingFolder.id,
      variables: {
        create: [
          {
            key: 'firstName',
            name: 'First Name',
            type: 'TEXT' as VariableType,
            defaultValue: 'Valued Customer',
            required: true
          },
          {
            key: 'companyName',
            name: 'Company Name',
            type: 'TEXT' as VariableType,
            defaultValue: 'Acme Inc',
            required: true
          },
          {
            key: 'month',
            name: 'Month',
            type: 'TEXT' as VariableType,
            defaultValue: new Date().toLocaleString('default', { month: 'long' }),
            required: true
          },
          {
            key: 'year',
            name: 'Year',
            type: 'TEXT' as VariableType,
            defaultValue: new Date().getFullYear().toString(),
            required: true
          },
          {
            key: 'highlight1',
            name: 'Main Highlight',
            type: 'TEXT' as VariableType,
            defaultValue: 'We\'ve launched our new product line! Check it out on our website.',
            required: true
          },
          {
            key: 'featuredContent',
            name: 'Featured Products Content',
            type: 'TEXT' as VariableType,
            defaultValue: 'Our bestselling product this month is our new widget. Get yours before they sell out!',
            required: true
          },
          {
            key: 'events',
            name: 'Events Information',
            type: 'TEXT' as VariableType,
            defaultValue: 'Join us for our webinar on product innovations next Tuesday at 2 PM EST.',
            required: true
          },
          {
            key: 'unsubscribeLink',
            name: 'Unsubscribe Link',
            type: 'URL' as VariableType,
            defaultValue: 'https://example.com/unsubscribe?email={{.email}}',
            required: true
          }
        ]
      },
      previewData: {
        create: {
          name: 'Default Preview',
          data: {
            firstName: 'Valued Customer',
            companyName: 'Acme Inc',
            month: new Date().toLocaleString('default', { month: 'long' }),
            year: new Date().getFullYear().toString(),
            highlight1: 'We\'ve launched our new product line! Check it out on our website.',
            featuredContent: 'Our bestselling product this month is our new widget. Get yours before they sell out!',
            events: 'Join us for our webinar on product innovations next Tuesday at 2 PM EST.',
            unsubscribeLink: 'https://example.com/unsubscribe?email=customer@example.com'
          }
        }
      }
    }
  });

  // Create a sample user
  const user = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User'
    }
  });

  // Create a template owned by the user
  const userTemplate = await prisma.emailTemplate.create({
    data: {
      name: 'Custom Thank You',
      description: 'My custom thank you email',
      defaultContent: `
        <h2>Thank You!</h2>
        <p>Dear {{.recipientName}},</p>
        <p>{{.customMessage}}</p>
        <p>Sincerely,<br>{{.senderName}}</p>
      `,
      isSystem: false,
      userId: user.id,
      variables: {
        create: [
          {
            key: 'recipientName',
            name: 'Recipient Name',
            type: 'TEXT' as VariableType,
            defaultValue: 'Valued Customer',
            required: true
          },
          {
            key: 'customMessage',
            name: 'Custom Message',
            type: 'TEXT' as VariableType,
            defaultValue: 'Thank you for your continued support. We truly appreciate your business.',
            required: true
          },
          {
            key: 'senderName',
            name: 'Sender Name',
            type: 'TEXT' as VariableType,
            defaultValue: 'The Team',
            required: true
          }
        ]
      },
      previewData: {
        create: {
          name: 'Default Preview',
          data: {
            recipientName: 'Valued Customer',
            customMessage: 'Thank you for your continued support. We truly appreciate your business.',
            senderName: 'The Team'
          }
        }
      }
    }
  });

  // Create a saved template version
  const savedTemplate = await prisma.savedEmailTemplate.create({
    data: {
      name: 'Welcome Email - March Campaign',
      content: welcomeEmailTemplate.defaultContent.replace('{{.companyName}}', 'Acme Inc'),
      variableValues: {
        firstName: 'Jane',
        lastName: 'Smith',
        companyName: 'Acme Inc',
        loginLink: 'https://acme.example.com/login'
      },
      userId: user.id
    }
  });

  // Create a sent email record
  await prisma.sentEmail.create({
    data: {
      recipient: 'customer@example.com',
      subject: 'Welcome to Acme Inc!',
      content: savedTemplate.content.replace('{{.firstName}}', 'Jane'),
      status: 'SENT',
      userId: user.id,
      templateId: savedTemplate.id
    }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error in seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });