// types/email-templates.ts
export interface EmailTemplate {
	id: string;
	name: string;
	variables: string[];
	defaultContent: string;
	description?: string;
  }
  
  export interface CustomVariable {
	id: string;
	name: string;
	key: string;
	type: VariableType;
	defaultValue: string;
	description?: string;
  }
  
  export type VariableType = 'text' | 'date' | 'number' | 'email' | 'url' | 'boolean';
  
  export interface PreviewData {
	[key: string]: string;
  }
  
  export const defaultTemplates: EmailTemplate[] = [
	{ 
	  id: 'welcome-email',
	  name: 'Welcome Email',
	  variables: ['firstName', 'lastName', 'companyName', 'loginLink'],
	  defaultContent: `
		<h2>Welcome to {{.companyName}}!</h2>
		<p>Hello {{.firstName}},</p>
		<p>Thank you for joining us. We're excited to have you on board!</p>
		<p>You can log in to your account using <a href="{{.loginLink}}">this link</a>.</p>
		<p>If you have any questions, please don't hesitate to reach out to our support team.</p>
		<p>Best regards,<br>The {{.companyName}} Team</p>
	  `
	},
	{ 
	  id: 'order-confirmation',
	  name: 'Order Confirmation',
	  variables: ['firstName', 'orderNumber', 'orderDate', 'totalAmount', 'deliveryAddress'],
	  defaultContent: `
		<h2>Order Confirmation</h2>
		<p>Dear {{.firstName}},</p>
		<p>Thank you for your order! We're processing it now.</p>
		<p><strong>Order #{{.orderNumber}}</strong> placed on {{.orderDate}}</p>
		<p>Your items will be shipped to:</p>
		<p>{{.deliveryAddress}}</p>
		<p>We'll send you another email when your package ships.</p>
		<p>Thank you for shopping with us!</p>
	  `
	},
  ];
  
  export const defaultPreviewData: PreviewData = {
	firstName: 'Akkarapon',
	lastName: 'Phikulsri',
	companyName: 'Billowdev',
	email: 'akkarapon@billowdev.com',
	loginLink: 'https://www.billowdev.com',
	orderNumber: '12345',
	orderDate: 'March 28, 2025',
	totalAmount: '149.99',
	deliveryAddress: '999 Wisit, Mueng, Buengkan 38000'
  };


  export interface BackgroundSettings {
	bodyBgColor: string;
	containerBgColor: string;
	headerBgColor: string;
	contentBgColor: string;
	footerBgColor: string;
	maxWidth: string;
  }
  
  // You can place this at the end of your existing email-templates.ts file
  export const DEFAULT_BACKGROUND_SETTINGS: BackgroundSettings = {
	bodyBgColor: '#D9D9D9',
	containerBgColor: '#FFFFFF',
	headerBgColor: '#33A8DF',
	contentBgColor: '#FFFFFF',
	footerBgColor: '#33A8DF',
	maxWidth: '650px'
  };