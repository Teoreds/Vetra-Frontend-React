import { Paperclip } from "lucide-react";
import { FileUpload } from "@/shared/ui/file-upload";
import { formatDate } from "@/shared/lib/utils";
import { useOrderAttachments } from "../hooks/use-order-attachments";
import type { AttachmentOut } from "../types/order.types";

interface AttachmentsTabProps {
  orderGuid: string;
}

export function AttachmentsTab({ orderGuid }: AttachmentsTabProps) {
  const { data: attachments = [] } = useOrderAttachments(orderGuid);

  function handleFileSelect(_file: File) {
    // TODO: implement upload via attachments API
  }

  return (
    <div className="space-y-6">
      <h3 className="text-[15px] font-semibold">Attachments</h3>
      <FileUpload onFileSelect={handleFileSelect} />
      <AttachmentsList attachments={attachments} />
    </div>
  );
}

function AttachmentsList({ attachments }: { attachments: AttachmentOut[] }) {
  if (attachments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No attachments uploaded yet.</p>
    );
  }

  return (
    <ul className="divide-y divide-border/50 rounded-xl border border-border/60 bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      {attachments.map((att) => (
        <li key={att.guid} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
            <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-medium">{att.filename}</p>
            <p className="text-[11px] text-muted-foreground">{att.content_type}</p>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {formatDate(att.created_at)}
          </span>
        </li>
      ))}
    </ul>
  );
}
