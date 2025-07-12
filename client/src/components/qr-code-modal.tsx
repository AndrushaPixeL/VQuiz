import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Brain, QrCode } from "lucide-react";

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  onJoin: (code: string) => void;
}

export function QRCodeModal({ open, onClose, onJoin }: QRCodeModalProps) {
  const [joinCode, setJoinCode] = useState("");

  const handleJoin = () => {
    if (joinCode.trim()) {
      onJoin(joinCode.trim().toUpperCase());
      setJoinCode("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-6 h-6 text-primary" />
            Подключение к игре
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <p className="text-gray-600">Отсканируйте QR-код или введите код игры</p>
          
          {/* QR Code Placeholder */}
          <div className="bg-gray-100 rounded-xl p-8">
            <div className="w-32 h-32 bg-white rounded-lg mx-auto flex items-center justify-center">
              <QrCode className="w-16 h-16 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mt-2">QR-код для игры</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Или введите код:</p>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Введите код"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="text-center"
                onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
              />
              <Button onClick={handleJoin} disabled={!joinCode.trim()}>
                →
              </Button>
            </div>
          </div>
          
          <Button variant="ghost" onClick={onClose} className="w-full">
            Отмена
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
