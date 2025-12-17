import { Schema, model, Document, Types } from "mongoose";

export interface IAuditLog extends Document {
    action: string;
    entityId: Types.ObjectId;
    entityType: string;
    userId: Types.ObjectId;
    details: any;
    createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
    {
        action: { type: String, required: true },
        entityId: { type: Schema.Types.ObjectId, required: true },
        entityType: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        details: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

export const AuditLog = model<IAuditLog>("AuditLog", AuditLogSchema);
