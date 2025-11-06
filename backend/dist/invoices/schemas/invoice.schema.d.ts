/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import { Document, Types } from 'mongoose';
export type InvoiceDocument = Invoice & Document;
export declare enum InvoiceStatus {
    DRAFT = "draft",
    SENT = "sent",
    PAID = "paid"
}
export declare class InvoiceItem {
    description: string;
    amount: number;
}
export declare const InvoiceItemSchema: import("mongoose").Schema<InvoiceItem, import("mongoose").Model<InvoiceItem, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, InvoiceItem>;
export declare class Invoice {
    invoiceNumber: string;
    client: Types.ObjectId;
    transactions: Types.ObjectId[];
    items: InvoiceItem[];
    total: number;
    status: InvoiceStatus;
    date: Date;
    createdAt: Date;
}
export declare const InvoiceSchema: import("mongoose").Schema<Invoice, import("mongoose").Model<Invoice, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Invoice>;
