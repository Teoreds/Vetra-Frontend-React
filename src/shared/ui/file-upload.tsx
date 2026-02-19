import { useRef, useState, type DragEvent } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  accept,
  maxSizeMB = 10,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.size <= maxSizeMB * 1024 * 1024) {
      onFileSelect(file);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/70 bg-muted/30 p-10 transition-all duration-150 hover:border-primary/40 hover:bg-primary/[0.02]",
        isDragging && "border-primary bg-primary/5 scale-[1.01]",
        className,
      )}
    >
      <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
      <p className="text-sm font-medium">Click or drag file to upload</p>
      <p className="mt-1 text-xs text-muted-foreground">Max {maxSizeMB}MB</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
