import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Monitor, 
  Image, 
  Type, 
  Palette, 
  Move, 
  RotateCcw, 
  Save,
  Trash2,
  Plus,
  Eye,
  Maximize2,
  X
} from 'lucide-react';
import type { SplashScreen } from '@shared/schema';

interface VisualElement {
  id: string;
  type: 'text' | 'image' | 'video' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content: string;
  styles: {
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    color: string;
    backgroundColor: string;
    borderRadius: number;
    borderWidth: number;
    borderColor: string;
    textAlign: string;
    opacity: number;
  };
}

interface SplashScreenEditorProps {
  splashScreen: SplashScreen;
  onChange: (splashScreen: SplashScreen) => void;
  onSave?: () => void;
  onDelete?: () => void;
  className?: string;
}

const SPLASH_TYPES = [
  { value: 'start', label: 'Начальная заставка', color: 'bg-green-500' },
  { value: 'round', label: 'Заставка раунда', color: 'bg-blue-500' },
  { value: 'end', label: 'Финальная заставка', color: 'bg-purple-500' },
];

const BACKGROUND_PRESETS = [
  { type: 'color', value: '#1e40af', label: 'Синий' },
  { type: 'color', value: '#7c3aed', label: 'Фиолетовый' },
  { type: 'color', value: '#059669', label: 'Зеленый' },
  { type: 'color', value: '#dc2626', label: 'Красный' },
  { type: 'color', value: '#ea580c', label: 'Оранжевый' },
  { type: 'color', value: '#000000', label: 'Черный' },
];

export function SplashScreenEditor({ 
  splashScreen, 
  onChange, 
  onSave, 
  onDelete,
  className 
}: SplashScreenEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const updateSplashScreen = (updates: Partial<SplashScreen>) => {
    onChange({ ...splashScreen, ...updates });
  };

  const updateElement = (elementId: string, updates: any) => {
    const updatedElements = splashScreen.elements.map(element =>
      element.id === elementId ? { ...element, ...updates } : element
    );
    updateSplashScreen({ elements: updatedElements });
  };

  const addElement = (type: 'text' | 'image' | 'video') => {
    const newElement = {
      id: Date.now().toString(),
      type,
      x: 50,
      y: 50,
      width: type === 'text' ? 200 : 150,
      height: type === 'text' ? 50 : 100,
      content: type === 'text' ? 'Новый текст' : '',
      styles: type === 'text' ? {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
      } : {},
    };
    updateSplashScreen({ elements: [...splashScreen.elements, newElement] });
  };

  const deleteElement = (elementId: string) => {
    const updatedElements = splashScreen.elements.filter(element => element.id !== elementId);
    updateSplashScreen({ elements: updatedElements });
    setSelectedElement(null);
  };

  const currentType = SPLASH_TYPES.find(t => t.value === splashScreen.type);

  if (isPreviewMode) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div 
          className="relative w-full h-full flex items-center justify-center"
          style={{
            backgroundColor: splashScreen.background?.type === 'color' 
              ? splashScreen.background.value 
              : '#1e40af',
            backgroundImage: splashScreen.background?.type === 'image' 
              ? `url(${splashScreen.background.value})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Заголовок */}
          <div className="text-center space-y-4">
            <h1 className="text-6xl font-bold text-white mb-2">
              {splashScreen.title}
            </h1>
            {splashScreen.subtitle && (
              <p className="text-2xl text-white/90">
                {splashScreen.subtitle}
              </p>
            )}
          </div>

          {/* Элементы */}
          {splashScreen.elements.map((element) => (
            <div
              key={element.id}
              className="absolute"
              style={{
                left: `${element.x}px`,
                top: `${element.y}px`,
                width: `${element.width}px`,
                height: `${element.height}px`,
                ...element.styles,
              }}
            >
              {element.type === 'text' && (
                <div className="w-full h-full flex items-center justify-center">
                  {element.content}
                </div>
              )}
              {element.type === 'image' && element.content && (
                <img 
                  src={element.content} 
                  alt="" 
                  className="w-full h-full object-cover rounded"
                />
              )}
            </div>
          ))}

          {/* Кнопка продолжить для хоста */}
          <div className="absolute bottom-8 right-8">
            <Button size="lg" className="bg-white text-black hover:bg-gray-100">
              Продолжить
            </Button>
          </div>

          {/* Кнопка выхода из превью */}
          <Button
            onClick={() => setIsPreviewMode(false)}
            size="sm"
            variant="outline"
            className="absolute top-4 right-4 bg-white/10 text-white border-white/20 hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Редактор заставки
              <Badge className={`${currentType?.color} text-white`}>
                {currentType?.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsPreviewMode(true)}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                Превью
              </Button>
              {onSave && (
                <Button onClick={onSave} size="sm" className="gap-2">
                  <Save className="w-4 h-4" />
                  Сохранить
                </Button>
              )}
              {onDelete && (
                <Button onClick={onDelete} size="sm" variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Удалить
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="content">Содержание</TabsTrigger>
              <TabsTrigger value="design">Дизайн</TabsTrigger>
              <TabsTrigger value="elements">Элементы</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Тип заставки</Label>
                  <Select 
                    value={splashScreen.type} 
                    onValueChange={(value: 'start' | 'round' | 'end') => 
                      updateSplashScreen({ type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SPLASH_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Заголовок</Label>
                  <Input
                    id="title"
                    value={splashScreen.title}
                    onChange={(e) => updateSplashScreen({ title: e.target.value })}
                    placeholder="Введите заголовок"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subtitle">Подзаголовок</Label>
                <Input
                  id="subtitle"
                  value={splashScreen.subtitle || ''}
                  onChange={(e) => updateSplashScreen({ subtitle: e.target.value })}
                  placeholder="Дополнительный текст (необязательно)"
                />
              </div>
            </TabsContent>

            <TabsContent value="design" className="space-y-4">
              <div>
                <Label>Фон</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {BACKGROUND_PRESETS.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => updateSplashScreen({ 
                        background: { type: 'color', value: preset.value } 
                      })}
                      className="w-full h-12 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors"
                      style={{ backgroundColor: preset.value }}
                      title={preset.label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="custom-color">Свой цвет</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="custom-color"
                    type="color"
                    value={splashScreen.background?.value || '#1e40af'}
                    onChange={(e) => updateSplashScreen({ 
                      background: { type: 'color', value: e.target.value } 
                    })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={splashScreen.background?.value || '#1e40af'}
                    onChange={(e) => updateSplashScreen({ 
                      background: { type: 'color', value: e.target.value } 
                    })}
                    placeholder="#1e40af"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bg-image">Изображение фона</Label>
                <Input
                  id="bg-image"
                  type="url"
                  value={splashScreen.background?.type === 'image' ? splashScreen.background.value : ''}
                  onChange={(e) => updateSplashScreen({ 
                    background: { type: 'image', value: e.target.value } 
                  })}
                  placeholder="URL изображения"
                />
              </div>
            </TabsContent>

            <TabsContent value="elements" className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => addElement('text')}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <Type className="w-4 h-4" />
                  Текст
                </Button>
                <Button
                  onClick={() => addElement('image')}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <Image className="w-4 h-4" />
                  Изображение
                </Button>
              </div>

              <div className="space-y-2">
                {splashScreen.elements.map((element) => (
                  <div
                    key={element.id}
                    className={`p-3 rounded border cursor-pointer transition-colors ${
                      selectedElement === element.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedElement(element.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {element.type === 'text' && <Type className="w-4 h-4" />}
                        {element.type === 'image' && <Image className="w-4 h-4" />}
                        <span className="font-medium">
                          {element.type === 'text' ? element.content : `Изображение ${element.id}`}
                        </span>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteElement(element.id);
                        }}
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {selectedElement === element.id && (
                      <div className="mt-3 space-y-2 border-t pt-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label>X</Label>
                            <Input
                              type="number"
                              value={element.x}
                              onChange={(e) => updateElement(element.id, { x: Number(e.target.value) })}
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label>Y</Label>
                            <Input
                              type="number"
                              value={element.y}
                              onChange={(e) => updateElement(element.id, { y: Number(e.target.value) })}
                              className="h-8"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label>Ширина</Label>
                            <Input
                              type="number"
                              value={element.width}
                              onChange={(e) => updateElement(element.id, { width: Number(e.target.value) })}
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label>Высота</Label>
                            <Input
                              type="number"
                              value={element.height}
                              onChange={(e) => updateElement(element.id, { height: Number(e.target.value) })}
                              className="h-8"
                            />
                          </div>
                        </div>
                        {element.type === 'text' && (
                          <div>
                            <Label>Содержание</Label>
                            <Input
                              value={element.content}
                              onChange={(e) => updateElement(element.id, { content: e.target.value })}
                              className="h-8"
                            />
                          </div>
                        )}
                        {element.type === 'image' && (
                          <div>
                            <Label>URL изображения</Label>
                            <Input
                              value={element.content}
                              onChange={(e) => updateElement(element.id, { content: e.target.value })}
                              placeholder="https://example.com/image.jpg"
                              className="h-8"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}