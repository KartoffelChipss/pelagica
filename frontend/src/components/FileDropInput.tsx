import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from './ui/button';

interface FileDropInputProps {
    onChange: (file: File | null) => void;
    accept?: string;
    disabled?: boolean;
    value?: File | null;
}

const FileDropInput = ({
    onChange,
    accept = 'image/*',
    disabled = false,
    value,
}: FileDropInputProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCounter = useRef(0);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        dragCounter.current += 1;
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        dragCounter.current -= 1;
        if (dragCounter.current <= 0) {
            dragCounter.current = 0;
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current = 0;
        setIsDragging(false);

        if (disabled) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            const file = files[0];
            if (accept && !file.type.match(accept.replace('*', '.*'))) return;
            onChange(file);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onChange(files[0]);
        }
    };

    const handleClick = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleClick}
            className={`
                relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
                ${isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-muted-foreground/25 hover:border-muted-foreground/50'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled}
            />

            {value ? (
                <div className="flex flex-col items-center gap-0">
                    {value.type.startsWith('image/') && (
                        <img
                            src={URL.createObjectURL(value)}
                            alt="Preview"
                            className="max-h-48 rounded-lg object-contain"
                        />
                    )}
                    <div className="flex items-center gap-2 mt-2">
                        <p className="text-sm font-medium">{value.name}</p>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={handleClear}
                            disabled={disabled}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {(value.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                </div>
            ) : (
                <>
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-base font-medium mb-2">
                        {isDragging ? 'Drop file here' : 'Drag and drop an image'}
                    </p>
                    <p className="text-sm text-muted-foreground">or click to select a file</p>
                </>
            )}
        </div>
    );
};

export default FileDropInput;
