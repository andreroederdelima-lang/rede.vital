import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ImageCropModal from "@/components/ImageCropModal";

interface ImageUploadProps {
  label: string;
  value?: string; // URL da imagem atual
  onChange: (file: File | null, previewUrl: string | null) => void;
  maxSizeMB?: number;
  disabled?: boolean;
}

export default function ImageUpload({
  label,
  value,
  onChange,
  maxSizeMB = 5,
  disabled = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isValidating, setIsValidating] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Validar tipo
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato inválido", {
        description: "Apenas arquivos JPG, PNG ou WEBP são permitidos.",
      });
      return false;
    }

    // Validar tamanho
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error("Arquivo muito grande", {
        description: `O tamanho máximo permitido é ${maxSizeMB}MB.`,
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsValidating(true);

    // Validar arquivo
    if (!validateFile(file)) {
      setIsValidating(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Abrir modal de crop
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      setTempImageSrc(imageUrl);
      setTempFile(file);
      setShowCropModal(true);
      setIsValidating(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.info("Imagem removida");
  };

  const handleCropComplete = (croppedBlob: Blob, croppedUrl: string) => {
    // Converter blob para File
    const croppedFile = new File(
      [croppedBlob],
      tempFile?.name || "cropped-image.jpg",
      { type: "image/jpeg" }
    );
    
    setPreview(croppedUrl);
    onChange(croppedFile, croppedUrl);
    setShowCropModal(false);
    setTempImageSrc(null);
    setTempFile(null);
    
    toast.success("Imagem recortada", {
      description: "A imagem será enviada ao salvar o formulário.",
    });
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setTempImageSrc(null);
    setTempFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      <div className="flex items-start gap-4">
        {/* Preview */}
        {preview && (
          <div className="relative w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Remover imagem"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Upload Button */}
        {!preview && (
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              disabled={disabled || isValidating}
              className="hidden"
              id={`file-input-${label}`}
            />
            <label htmlFor={`file-input-${label}`}>
              <Button
                type="button"
                variant="outline"
                disabled={disabled || isValidating}
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Imagem
                  </>
                )}
              </Button>
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG ou WEBP. Máximo {maxSizeMB}MB.
            </p>
          </div>
        )}
      </div>
      
      {/* Modal de Crop */}
      {tempImageSrc && (
        <ImageCropModal
          open={showCropModal}
          imageSrc={tempImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
