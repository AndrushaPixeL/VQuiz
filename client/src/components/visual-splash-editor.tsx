import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  Type, 
  Image, 
  Video,
  Square, 
  Save,
  Trash2,
  Copy,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
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

interface VisualSplashEditorProps {
  splashScreen: SplashScreen;
  onChange: (splashScreen: SplashScreen) => void;
  className?: string;
}

export function VisualSplashEditor({ splashScreen, onChange, className }: VisualSplashEditorProps) {
  const [elements, setElements] = useState<VisualElement[]>(splashScreen.visualElements || []);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [backgroundStyle, setBackgroundStyle] = useState(
    splashScreen.background || { type: 'color', value: '#6366f1' }
  );
  const canvasRef = useRef<HTMLDivElement>(null);

  const addElement = (type: VisualElement['type']) => {
    const newElement: VisualElement = {
      id: Date.now().toString(),
      type,
      x: 100,
      y: 100,
      width: type === 'text' ? 300 : 200,
      height: type === 'text' ? 60 : 150,
      rotation: 0,
      content: type === 'text' ? 'Заголовок заставки' : '',
      styles: {
        fontSize: type === 'text' ? 32 : 16,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: type === 'shape' ? '#ef4444' : 'transparent',
        borderRadius: 8,
        borderWidth: 0,
        borderColor: '#000000',
        textAlign: 'center',
        opacity: 1
      }
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    updateSplashScreen(newElements);
  };

  const updateElement = (id: string, updates: Partial<VisualElement>) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
    updateSplashScreen(newElements);
  };

  const deleteElement = (id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    updateSplashScreen(newElements);
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const updateSplashScreen = (newElements?: VisualElement[]) => {
    onChange({
      ...splashScreen,
      visualElements: newElements || elements,
      background: backgroundStyle
    });
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    setSelectedElement(elementId);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    updateElement(selectedElement, { x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const selectedElementData = elements.find(el => el.id === selectedElement);

  const renderElement = (element: VisualElement) => {
    const baseStyles = {
      position: 'absolute' as const,
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      transform: `rotate(${element.rotation}deg)`,
      cursor: 'move',
      border: selectedElement === element.id ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.2)',
      borderRadius: element.styles.borderRadius,
      backgroundColor: element.styles.backgroundColor,
      opacity: element.styles.opacity,
      borderWidth: element.styles.borderWidth,
      borderColor: element.styles.borderColor,
      borderStyle: 'solid'
    };

    switch (element.type) {
      case 'text':
        return (
          <div
            key={element.id}
            style={{
              ...baseStyles,
              fontSize: element.styles.fontSize,
              fontFamily: element.styles.fontFamily,
              fontWeight: element.styles.fontWeight,
              color: element.styles.color,
              textAlign: element.styles.textAlign as any,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            {element.content}
          </div>
        );
      case 'image':
        return (
          <div
            key={element.id}
            style={baseStyles}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            {element.content ? (
              <img 
                src={element.content} 
                alt="Элемент" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
                Изображение
              </div>
            )}
          </div>
        );
      case 'video':
        return (
          <div
            key={element.id}
            style={baseStyles}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            {element.content ? (
              <video 
                src={element.content} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                controls={false}
                muted
                loop
                autoPlay
              />
            ) : (
              <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white">
                Видео
              </div>
            )}
          </div>
        );
      case 'shape':
        return (
          <div
            key={element.id}
            style={baseStyles}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            <div className="w-full h-full" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("flex h-[600px]", className)}>
      {/* Tools Panel */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold mb-4">Инструменты заставки</h3>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={() => addElement('text')}>
              <Type className="w-4 h-4 mr-2" />
              Текст
            </Button>
            <Button variant="outline" size="sm" onClick={() => addElement('image')}>
              <Image className="w-4 h-4 mr-2" />
              Картинка
            </Button>
            <Button variant="outline" size="sm" onClick={() => addElement('video')}>
              <Video className="w-4 h-4 mr-2" />
              Видео
            </Button>
            <Button variant="outline" size="sm" onClick={() => addElement('shape')}>
              <Square className="w-4 h-4 mr-2" />
              Фигура
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Tabs defaultValue="properties" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="properties">Свойства</TabsTrigger>
              <TabsTrigger value="background">Фон</TabsTrigger>
              <TabsTrigger value="elements">Элементы</TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="space-y-4">
              {selectedElementData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Выбранный элемент</h4>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => deleteElement(selectedElementData.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {selectedElementData.type === 'text' && (
                    <>
                      <div>
                        <Label>Текст</Label>
                        <Input
                          value={selectedElementData.content}
                          onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Размер шрифта</Label>
                        <Slider
                          value={[selectedElementData.styles.fontSize]}
                          onValueChange={([value]) => updateElement(selectedElementData.id, { 
                            styles: { ...selectedElementData.styles, fontSize: value }
                          })}
                          min={12}
                          max={96}
                          step={1}
                        />
                      </div>
                      <div>
                        <Label>Цвет текста</Label>
                        <Input
                          type="color"
                          value={selectedElementData.styles.color}
                          onChange={(e) => updateElement(selectedElementData.id, {
                            styles: { ...selectedElementData.styles, color: e.target.value }
                          })}
                        />
                      </div>
                    </>
                  )}

                  {(selectedElementData.type === 'image' || selectedElementData.type === 'video') && (
                    <div>
                      <Label>URL</Label>
                      <Input
                        value={selectedElementData.content}
                        onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                        placeholder="Введите URL"
                      />
                    </div>
                  )}

                  <div>
                    <Label>Цвет фона</Label>
                    <Input
                      type="color"
                      value={selectedElementData.styles.backgroundColor}
                      onChange={(e) => updateElement(selectedElementData.id, {
                        styles: { ...selectedElementData.styles, backgroundColor: e.target.value }
                      })}
                    />
                  </div>

                  <div>
                    <Label>Прозрачность</Label>
                    <Slider
                      value={[selectedElementData.styles.opacity]}
                      onValueChange={([value]) => updateElement(selectedElementData.id, {
                        styles: { ...selectedElementData.styles, opacity: value }
                      })}
                      min={0}
                      max={1}
                      step={0.1}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Выберите элемент для редактирования</p>
              )}
            </TabsContent>

            <TabsContent value="background" className="space-y-4">
              <div>
                <Label>Тип фона</Label>
                <Select
                  value={backgroundStyle.type}
                  onValueChange={(value) => {
                    const newBackground = { ...backgroundStyle, type: value };
                    setBackgroundStyle(newBackground);
                    updateSplashScreen();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="color">Цвет</SelectItem>
                    <SelectItem value="image">Изображение</SelectItem>
                    <SelectItem value="video">Видео</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {backgroundStyle.type === 'color' && (
                <div>
                  <Label>Цвет</Label>
                  <Input
                    type="color"
                    value={backgroundStyle.value}
                    onChange={(e) => {
                      const newBackground = { ...backgroundStyle, value: e.target.value };
                      setBackgroundStyle(newBackground);
                      updateSplashScreen();
                    }}
                  />
                </div>
              )}

              {backgroundStyle.type === 'image' && (
                <div>
                  <Label>URL изображения</Label>
                  <Input
                    value={backgroundStyle.value}
                    onChange={(e) => {
                      const newBackground = { ...backgroundStyle, value: e.target.value };
                      setBackgroundStyle(newBackground);
                      updateSplashScreen();
                    }}
                    placeholder="Введите URL изображения"
                  />
                </div>
              )}

              {backgroundStyle.type === 'video' && (
                <div>
                  <Label>URL видео</Label>
                  <Input
                    value={backgroundStyle.value}
                    onChange={(e) => {
                      const newBackground = { ...backgroundStyle, value: e.target.value };
                      setBackgroundStyle(newBackground);
                      updateSplashScreen();
                    }}
                    placeholder="Введите URL видео"
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="elements" className="space-y-2">
              <Label className="text-sm font-medium">Список элементов</Label>
              {elements.length === 0 ? (
                <p className="text-gray-500 text-sm">Нет элементов</p>
              ) : (
                <div className="space-y-2">
                  {elements.map((element) => (
                    <div 
                      key={element.id} 
                      className={cn(
                        "flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50",
                        selectedElement === element.id && "bg-blue-50 border-blue-300"
                      )}
                      onClick={() => setSelectedElement(element.id)}
                    >
                      <div className="flex items-center space-x-2">
                        {element.type === 'text' && <Type className="w-4 h-4" />}
                        {element.type === 'image' && <Image className="w-4 h-4" />}
                        {element.type === 'video' && <Video className="w-4 h-4" />}
                        {element.type === 'shape' && <Square className="w-4 h-4" />}
                        <span className="text-sm">
                          {element.type === 'text' ? element.content.slice(0, 20) + '...' : element.type}
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteElement(element.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        <div
          ref={canvasRef}
          className="w-full h-full relative"
          style={{
            background: backgroundStyle.type === 'color' ? backgroundStyle.value :
                       backgroundStyle.type === 'image' ? `url(${backgroundStyle.value})` :
                       backgroundStyle.type === 'video' ? '#000' : '#6366f1',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={() => setSelectedElement(null)}
        >
          {backgroundStyle.type === 'video' && backgroundStyle.value && (
            <video
              src={backgroundStyle.value}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              loop
              muted
            />
          )}
          
          {elements.map(renderElement)}
          
          {elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-white/70">
              <p className="text-xl">Добавьте элементы для создания заставки</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}