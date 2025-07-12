import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Type, 
  Image, 
  Square, 
  Circle, 
  Move, 
  Palette, 
  Upload,
  Video,
  Save,
  Trash2,
  Copy,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VisualElement {
  id: string;
  type: 'text' | 'image' | 'video' | 'shape' | 'answer-button';
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
  isCorrectAnswer?: boolean;
}

interface VisualQuestionEditorProps {
  question: any;
  onChange: (question: any) => void;
  className?: string;
}

export function VisualQuestionEditor({ question, onChange, className }: VisualQuestionEditorProps) {
  const [elements, setElements] = useState<VisualElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [backgroundStyle, setBackgroundStyle] = useState({
    type: 'color',
    value: '#6366f1',
    image: '',
    video: ''
  });
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addElement = (type: VisualElement['type']) => {
    const newElement: VisualElement = {
      id: Date.now().toString(),
      type,
      x: 100,
      y: 100,
      width: type === 'text' ? 200 : 150,
      height: type === 'text' ? 50 : 100,
      rotation: 0,
      content: type === 'text' ? 'Новый текст' : '',
      styles: {
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        color: '#ffffff',
        backgroundColor: type === 'answer-button' ? '#ef4444' : 'transparent',
        borderRadius: 8,
        borderWidth: 0,
        borderColor: '#000000',
        textAlign: 'center',
        opacity: 1
      },
      isCorrectAnswer: false
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<VisualElement>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    setSelectedElement(null);
  };

  const duplicateElement = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: Date.now().toString(),
        x: element.x + 20,
        y: element.y + 20
      };
      setElements([...elements, newElement]);
    }
  };

  const saveAsTemplate = () => {
    const template = {
      id: Date.now().toString(),
      name: `Шаблон ${savedTemplates.length + 1}`,
      elements,
      backgroundStyle,
      createdAt: new Date()
    };
    setSavedTemplates([...savedTemplates, template]);
  };

  const loadTemplate = (template: any) => {
    setElements(template.elements);
    setBackgroundStyle(template.backgroundStyle);
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    setSelectedElement(elementId);
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedElement || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    updateElement(selectedElement, { x, y });
  }, [isDragging, selectedElement]);

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
      border: selectedElement === element.id ? '2px solid #3b82f6' : 'none',
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
              padding: '8px'
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
            className="bg-gray-200 flex items-center justify-center"
          >
            {element.content ? (
              <img src={element.content} alt="" className="w-full h-full object-cover" />
            ) : (
              <Image className="w-8 h-8 text-gray-400" />
            )}
          </div>
        );
      case 'video':
        return (
          <div
            key={element.id}
            style={baseStyles}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            className="bg-gray-200 flex items-center justify-center"
          >
            {element.content ? (
              <video src={element.content} className="w-full h-full object-cover" />
            ) : (
              <Video className="w-8 h-8 text-gray-400" />
            )}
          </div>
        );
      case 'answer-button':
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
              padding: '8px',
              border: element.isCorrectAnswer ? '3px solid #10b981' : '2px solid #6b7280'
            }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            {element.content || 'Вариант ответа'}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("flex h-screen", className)}>
      {/* Tools Panel */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold mb-4">Инструменты</h3>
          
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
            <Button variant="outline" size="sm" onClick={() => addElement('answer-button')}>
              <Square className="w-4 h-4 mr-2" />
              Ответ
            </Button>
          </div>

          <div className="flex gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={saveAsTemplate}>
              <Save className="w-4 h-4 mr-2" />
              Сохранить шаблон
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Tabs defaultValue="properties" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="properties">Свойства</TabsTrigger>
              <TabsTrigger value="background">Фон</TabsTrigger>
              <TabsTrigger value="templates">Шаблоны</TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="space-y-4">
              {selectedElementData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Выбранный элемент</h4>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => duplicateElement(selectedElementData.id)}>
                        <Copy className="w-4 h-4" />
                      </Button>
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
                          min={8}
                          max={72}
                          step={1}
                        />
                      </div>
                      <div>
                        <Label>Шрифт</Label>
                        <Select
                          value={selectedElementData.styles.fontFamily}
                          onValueChange={(value) => updateElement(selectedElementData.id, {
                            styles: { ...selectedElementData.styles, fontFamily: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            <SelectItem value="Helvetica">Helvetica</SelectItem>
                            <SelectItem value="Georgia">Georgia</SelectItem>
                          </SelectContent>
                        </Select>
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

                  {selectedElementData.type === 'answer-button' && (
                    <>
                      <div>
                        <Label>Текст ответа</Label>
                        <Input
                          value={selectedElementData.content}
                          onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedElementData.isCorrectAnswer}
                          onChange={(e) => updateElement(selectedElementData.id, { isCorrectAnswer: e.target.checked })}
                        />
                        <Label>Правильный ответ</Label>
                      </div>
                    </>
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

                  <div>
                    <Label>Скругление углов</Label>
                    <Slider
                      value={[selectedElementData.styles.borderRadius]}
                      onValueChange={([value]) => updateElement(selectedElementData.id, {
                        styles: { ...selectedElementData.styles, borderRadius: value }
                      })}
                      min={0}
                      max={50}
                      step={1}
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
                  onValueChange={(value) => setBackgroundStyle({ ...backgroundStyle, type: value })}
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
                    onChange={(e) => setBackgroundStyle({ ...backgroundStyle, value: e.target.value })}
                  />
                </div>
              )}

              {backgroundStyle.type === 'image' && (
                <div>
                  <Label>URL изображения</Label>
                  <Input
                    value={backgroundStyle.image}
                    onChange={(e) => setBackgroundStyle({ ...backgroundStyle, image: e.target.value })}
                    placeholder="Введите URL изображения"
                  />
                </div>
              )}

              {backgroundStyle.type === 'video' && (
                <div>
                  <Label>URL видео</Label>
                  <Input
                    value={backgroundStyle.video}
                    onChange={(e) => setBackgroundStyle({ ...backgroundStyle, video: e.target.value })}
                    placeholder="Введите URL видео"
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Мои шаблоны</h4>
                {savedTemplates.length === 0 ? (
                  <p className="text-gray-500 text-sm">Нет сохраненных шаблонов</p>
                ) : (
                  <div className="space-y-2">
                    {savedTemplates.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{template.name}</span>
                        <Button size="sm" variant="outline" onClick={() => loadTemplate(template)}>
                          Загрузить
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                       backgroundStyle.type === 'image' ? `url(${backgroundStyle.image})` :
                       backgroundStyle.type === 'video' ? '#000' : '#6366f1',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {backgroundStyle.type === 'video' && backgroundStyle.video && (
            <video
              src={backgroundStyle.video}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              loop
              muted
            />
          )}
          
          {elements.map(renderElement)}
          
          {elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-white/50">
              <p>Добавьте элементы с помощью панели инструментов</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}