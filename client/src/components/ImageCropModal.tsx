import { useState, useRef } from "react";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ImageCropModalProps {
  open: boolean;
  imageSrc: string;
  onCropComplete: (croppedImageBlob: Blob, croppedImageUrl: string) => void;
  onCancel: () => void;
}

type AspectRatioOption = "free" | "1:1" | "4:3" | "16:9" | "3:4" | "9:16";

const ASPECT_RATIOS: Record<AspectRatioOption, number | undefined> = {
  free: undefined,
  "1:1": 1,
  "4:3": 4 / 3,
  "16:9": 16 / 9,
  "3:4": 3 / 4,
  "9:16": 9 / 16,
};

export default function ImageCropModal({
  open,
  imageSrc,
  onCropComplete,
  onCancel,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>("free");
  const imgRef = useRef<HTMLImageElement>(null);

  const handleAspectRatioChange = (value: AspectRatioOption) => {
    setAspectRatio(value);
    const ratio = ASPECT_RATIOS[value];
    
    if (ratio) {
      // Ajustar crop para nova proporção
      setCrop({
        unit: "%",
        width: 90,
        height: ratio > 1 ? 90 / ratio : 90 * ratio,
        x: 5,
        y: 5,
      });
    }
  };

  const getCroppedImg = async (): Promise<{ blob: Blob; url: string }> => {
    const image = imgRef.current;
    const crop = completedCrop;

    if (!image || !crop) {
      throw new Error("Crop area not defined");
    }

    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = crop.width;
    canvas.height = crop.height;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("No 2d context");
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          const url = URL.createObjectURL(blob);
          resolve({ blob, url });
        },
        "image/jpeg",
        0.95
      );
    });
  };

  const handleConfirm = async () => {
    try {
      const { blob, url } = await getCroppedImg();
      onCropComplete(blob, url);
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recortar Imagem</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Seletor de Proporção */}
          <div>
            <Label htmlFor="aspect-ratio">Proporção</Label>
            <Select value={aspectRatio} onValueChange={handleAspectRatioChange}>
              <SelectTrigger id="aspect-ratio">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Livre</SelectItem>
                <SelectItem value="1:1">Quadrado (1:1)</SelectItem>
                <SelectItem value="4:3">Paisagem (4:3)</SelectItem>
                <SelectItem value="16:9">Paisagem Larga (16:9)</SelectItem>
                <SelectItem value="3:4">Retrato (3:4)</SelectItem>
                <SelectItem value="9:16">Retrato Alto (9:16)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Área de Crop */}
          <div className="flex justify-center bg-gray-100 rounded-lg p-4">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={ASPECT_RATIOS[aspectRatio]}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                style={{ maxHeight: "60vh", maxWidth: "100%" }}
              />
            </ReactCrop>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Arraste as bordas para ajustar o recorte. Use o seletor acima para escolher uma proporção específica.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!completedCrop}>
            Confirmar Recorte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
