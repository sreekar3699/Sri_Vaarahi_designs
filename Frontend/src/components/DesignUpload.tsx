import { useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, FileImage, X } from 'lucide-react';

export default function DesignUpload({ onUpload }: { onUpload?: (dataUrl: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done'>('idle');
  const [fileName, setFileName] = useState('');

  const handleFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    setFileName(file.name);
    setStatus('uploading');
    setProgress(0);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      // Simulate progress
      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * 25 + 10;
        if (p >= 100) {
          p = 100;
          clearInterval(interval);
          setProgress(100);
          setPreview(dataUrl);
          setStatus('done');
          onUpload?.(dataUrl);
        } else {
          setProgress(p);
        }
      }, 120);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setPreview(null);
    setProgress(0);
    setStatus('idle');
    setFileName('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {status === 'idle' && (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="cursor-pointer border-2 border-dashed border-forest-300 rounded-2xl p-8 text-center hover:border-gold-500 hover:bg-cream-100 transition-all duration-300 group"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-cream-100 group-hover:bg-gold-300/20 flex items-center justify-center transition-colors">
              <UploadCloud className="w-7 h-7 text-forest-600 group-hover:text-gold-600 transition-colors" />
            </div>
            <div>
              <p className="font-medium text-forest-800">Click to upload your custom design</p>
              <p className="text-sm text-forest-500 mt-1">PNG, JPG up to 5MB</p>
            </div>
          </div>
        </div>
      )}

      {status === 'uploading' && (
        <div className="border-2 border-forest-200 rounded-2xl p-6 bg-cream-50">
          <div className="flex items-center gap-3 mb-3">
            <FileImage className="w-6 h-6 text-forest-600" />
            <span className="text-sm font-medium text-forest-800 truncate">{fileName}</span>
          </div>
          <div className="h-2 bg-forest-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-forest-500 to-gold-500 rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-forest-500 mt-2">Uploading... {Math.round(progress)}%</p>
        </div>
      )}

      {status === 'done' && preview && (
        <div className="border-2 border-forest-200 rounded-2xl p-5 bg-cream-50 animate-slide-up">
          <div className="flex items-start gap-4">
            <img
              src={preview}
              alt="Design preview"
              className="w-20 h-20 rounded-lg object-cover border border-forest-200"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-forest-700">
                <CheckCircle2 className="w-5 h-5 text-forest-600" />
                <span className="font-medium text-sm">Design uploaded successfully!</span>
              </div>
              <p className="text-xs text-forest-500 mt-1 truncate">{fileName}</p>
              <button
                onClick={reset}
                className="mt-3 text-xs text-forest-600 hover:text-forest-800 underline underline-offset-2"
              >
                Upload a different file
              </button>
            </div>
            <button onClick={reset} className="text-forest-400 hover:text-forest-800 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
