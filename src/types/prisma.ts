import { Prisma } from '@prisma/client'


export type VariableType = 'TEXT' | 'DATE' | 'NUMBER' | 'EMAIL' | 'URL' | 'BOOLEAN';
export type EmailStatus = 'DRAFT' | 'SENT' | 'FAILED' | 'DELIVERED' | 'OPENED';

