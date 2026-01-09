import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, File, Loader2 } from 'lucide-react';

interface FileUploadProps {
  bucket: string;
  folder: string;
  onUpload: (files: { name: string; path: string; type: string }[]) => void;
  existingFiles?: { name: string; path: string }[];
  onRemove?: (path: string) => void;
  canRemove?: boolean;
  multiple?: boolean;
  accept?: string;
}

export default function FileUpload({
  bucket,
  folder,
  onUpload,
  existingFiles = [],
  onRemove,
  canRemove = true,
  multiple = true,
  accept = '*/*',
}: FileUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedFiles: { name: string; path: string; type: string }[] = [];

    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error } = await supabase.storage.from(bucket).upload(filePath, file);

      if (error) {
        toast({ variant: 'destructive', title: 'Erro no upload', description: error.message });
      } else {
        uploadedFiles.push({
          name: file.name,
          path: filePath,
          type: file.type,
        });
      }
    }

    if (uploadedFiles.length > 0) {
      onUpload(uploadedFiles);
      toast({ title: `${uploadedFiles.length} arquivo(s) enviado(s)` });
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = async (path: string) => {
    if (!onRemove) return;
    
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao remover', description: error.message });
    } else {
      onRemove(path);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {uploading ? 'Enviando...' : 'Selecionar Arquivos'}
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {existingFiles.length > 0 && (
        <div className="space-y-2">
          {existingFiles.map((file) => (
            <div key={file.path} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
              <File className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-sm truncate">{file.name}</span>
              {canRemove && onRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(file.path)}
                >
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
