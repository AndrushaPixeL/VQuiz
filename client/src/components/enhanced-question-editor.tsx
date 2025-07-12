import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Type, 
  Image, 
  Video,
  Square, 
  Plus,
  Trash2,
  Copy,
  Upload,
  Play,
  Clock,
  Volume2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Question } from '@shared/schema';

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

interface EnhancedQuestionEditorProps {
  question: Question;
  onChange: (question: Question) => void;
  onSave?: () => void;
  className?: string;
}

export function EnhancedQuestionEditor({ 
  question, 
  onChange, 
  onSave, 
  className 
}: EnhancedQuestionEditorProps) {
  const [editorMode, setEditorMode] = useState<'form' | 'visual'>('form');
  const [elements, setElements] = useState<VisualElement[]>(question.visualElements || []);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [backgroundStyle, setBackgroundStyle] = useState(
    question.background || { type: 'color', value: '#6366f1' }
  );
  const [savedTemplates, setSavedTemplates] = useState(() => {
    const saved = localStorage.getItem('saved-question-templates');
    return saved ? JSON.parse(saved) : [];
  });
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateQuestion = (updates: Partial<Question>) => {
    onChange({ ...question, ...updates });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, elementId?: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    
    if (elementId) {
      updateElement(elementId, { content: url });
    } else {
      setBackgroundStyle({ ...backgroundStyle, value: url });
      updateQuestion({ background: { ...backgroundStyle, value: url } });
    }
  };

  const addElement = (type: VisualElement['type']) => {
    const newElement: VisualElement = {
      id: Date.now().toString(),
      type,
      x: 100,
      y: 100,
      width: type === 'text' ? 200 : type === 'answer-button' ? 180 : 150,
      height: type === 'text' ? 50 : type === 'answer-button' ? 60 : 100,
      rotation: 0,
      content: type === 'text' ? 'Новый текст' : 
               type === 'answer-button' ? 'Вариант ответа' : '',
      styles: {
        fontSize: type === 'answer-button' ? 18 : 24,
        fontFamily: 'Arial',
        fontWeight: type === 'answer-button' ? 'normal' : 'bold',
        color: '#ffffff',
        backgroundColor: type === 'answer-button' ? '#3b82f6' : 'transparent',
        borderRadius: type === 'answer-button' ? 8 : 4,
        borderWidth: type === 'answer-button' ? 2 : 0,
        borderColor: '#1e40af',
        textAlign: 'center',
        opacity: 1
      },
      isCorrectAnswer: type === 'answer-button' ? false : undefined
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    updateQuestion({
      ...question,
      visualElements: newElements,
      background: backgroundStyle
    });
  };

  const updateElement = (id: string, updates: Partial<VisualElement>) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
    updateQuestion({
      ...question,
      visualElements: newElements,
      background: backgroundStyle
    });
  };

  const deleteElement = (id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    updateQuestion({ ...question, visualElements: newElements });
    if (selectedElement === id) {
      setSelectedElement(null);
    }
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
      const newElements = [...elements, newElement];
      setElements(newElements);
      updateQuestion({ ...question, visualElements: newElements });
    }
  };

  const saveAsTemplate = () => {
    const template = {
      id: Date.now().toString(),
      name: `Шаблон ${savedTemplates.length + 1}`,
      elements: elements,
      background: backgroundStyle,
      createdAt: new Date(),
      isPersonal: true
    };
    
    const newTemplates = [template, ...savedTemplates];
    setSavedTemplates(newTemplates);
    localStorage.setItem('saved-question-templates', JSON.stringify(newTemplates));
  };

  const applyTemplate = (template: any) => {
    setElements(template.elements || []);
    setBackgroundStyle(template.background || { type: 'color', value: '#6366f1' });
    updateQuestion({
      ...question,
      visualElements: template.elements || [],
      background: template.background
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
    setIsResizing(false);
  };

  const handleResize = (elementId: string, direction: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setSelectedElement(elementId);
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

    const isSelected = selectedElement === element.id;

    return (
      <div key={element.id} style={{ position: 'relative' }}>
        <div
          style={baseStyles}
          onMouseDown={(e) => handleMouseDown(e, element.id)}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedElement(element.id);
          }}
        >
          {element.type === 'text' && (
            <div
              style={{
                width: '100%',
                height: '100%',
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
            >
              {element.content}
            </div>
          )}
          
          {element.type === 'image' && (
            element.content ? (
              <img 
                src={element.content} 
                alt="Элемент" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
                Изображение
              </div>
            )
          )}

          {element.type === 'video' && (
            element.content ? (
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
            )
          )}

          {element.type === 'answer-button' && (
            <div
              style={{
                width: '100%',
                height: '100%',
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
            >
              {element.content || 'Вариант ответа'}
            </div>
          )}

          {element.type === 'shape' && (
            <div className="w-full h-full" />
          )}
        </div>

        {/* Resize handles */}
        {isSelected && (
          <>
            <div
              className="absolute w-3 h-3 bg-blue-500 cursor-nw-resize"
              style={{ left: element.x - 6, top: element.y - 6 }}
              onMouseDown={(e) => handleResize(element.id, 'nw', e)}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 cursor-ne-resize"
              style={{ left: element.x + element.width - 6, top: element.y - 6 }}
              onMouseDown={(e) => handleResize(element.id, 'ne', e)}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 cursor-sw-resize"
              style={{ left: element.x - 6, top: element.y + element.height - 6 }}
              onMouseDown={(e) => handleResize(element.id, 'sw', e)}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 cursor-se-resize"
              style={{ left: element.x + element.width - 6, top: element.y + element.height - 6 }}
              onMouseDown={(e) => handleResize(element.id, 'se', e)}
            />
          </>
        )}
      </div>
    );
  };

  const testVoice = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(question.text);
      utterance.lang = 'ru-RU';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={cn("h-[600px]", className)}>
      {/* Left Panel */}
      <div className="flex h-full">
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Редактор вопроса</h3>
              {onSave && (
                <Button size="sm" onClick={onSave}>
                  Сохранить
                </Button>
              )}
            </div>
            
            {/* Editor Mode Toggle */}
            <div className="flex mb-4">
              <Button
                variant={editorMode === 'form' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEditorMode('form')}
                className="flex-1 mr-1"
              >
                Форма
              </Button>
              <Button
                variant={editorMode === 'visual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEditorMode('visual')}
                className="flex-1 ml-1"
              >
                Визуальный
              </Button>
            </div>

            {/* Time and Voice Settings */}
            <div className="space-y-3 mb-4">
              <div>
                <Label className="text-sm">Время на ответ (сек)</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <Slider
                    value={[question.timeLimit]}
                    onValueChange={([value]) => updateQuestion({ timeLimit: value })}
                    min={5}
                    max={300}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-sm w-8">{question.timeLimit}с</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Озвучка вопроса</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={question.useAIVoice || false}
                    onCheckedChange={(checked) => updateQuestion({ useAIVoice: checked })}
                  />
                  {question.useAIVoice && (
                    <Button size="sm" variant="outline" onClick={testVoice}>
                      <Play className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {editorMode === 'visual' && (
              <div className="grid grid-cols-2 gap-2">
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
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {editorMode === 'form' ? (
              <div className="space-y-4">
                <div>
                  <Label>Текст вопроса</Label>
                  <Textarea
                    value={question.text}
                    onChange={(e) => updateQuestion({ text: e.target.value })}
                    placeholder="Введите текст вопроса"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Тип вопроса</Label>
                  <Select
                    value={question.type}
                    onValueChange={(value) => updateQuestion({ type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple_choice">Множественный выбор</SelectItem>
                      <SelectItem value="true_false">Правда/Ложь</SelectItem>
                      <SelectItem value="visual_question">Визуальный вопрос</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {question.type === 'multiple_choice' && (
                  <div>
                    <Label>Варианты ответов</Label>
                    <div className="space-y-2 mt-2">
                      {question.answers.map((answer, index) => (
                        <div key={answer.id} className="flex items-center space-x-2">
                          <Input
                            value={answer.text}
                            onChange={(e) => {
                              const newAnswers = [...question.answers];
                              newAnswers[index] = { ...answer, text: e.target.value };
                              updateQuestion({ answers: newAnswers });
                            }}
                            placeholder={`Вариант ${index + 1}`}
                          />
                          <Switch
                            checked={answer.isCorrect}
                            onCheckedChange={(checked) => {
                              const newAnswers = [...question.answers];
                              newAnswers[index] = { ...answer, isCorrect: checked };
                              updateQuestion({ answers: newAnswers });
                            }}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const newAnswers = question.answers.filter((_, i) => i !== index);
                              updateQuestion({ answers: newAnswers });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newAnswer = {
                            id: Date.now().toString(),
                            text: '',
                            isCorrect: false
                          };
                          updateQuestion({ answers: [...question.answers, newAnswer] });
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Добавить вариант
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Tabs defaultValue="properties" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="properties">Свойства</TabsTrigger>
                  <TabsTrigger value="elements">Элементы</TabsTrigger>
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
                        <div className="space-y-2">
                          <Label>Файл</Label>
                          <div className="flex gap-2">
                            <Input
                              value={selectedElementData.content}
                              onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                              placeholder="URL или выберите файл"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = selectedElementData.type === 'image' ? 'image/*' : 'video/*';
                                input.onchange = (e) => handleFileUpload(e as any, selectedElementData.id);
                                input.click();
                              }}
                            >
                              <Upload className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      <div>
                        <Label>Цвет фона</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="color"
                            value={selectedElementData.styles.backgroundColor}
                            onChange={(e) => updateElement(selectedElementData.id, {
                              styles: { ...selectedElementData.styles, backgroundColor: e.target.value }
                            })}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateElement(selectedElementData.id, {
                              styles: { ...selectedElementData.styles, backgroundColor: 'transparent' }
                            })}
                          >
                            Прозрачный
                          </Button>
                        </div>
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
                            {element.type === 'answer-button' && <Square className="w-4 h-4" />}
                            <span className="text-sm">
                              {element.type === 'text' || element.type === 'answer-button' 
                                ? element.content.slice(0, 20) + '...' 
                                : element.type}
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

                <TabsContent value="templates" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Шаблоны</Label>
                    <Button size="sm" variant="outline" onClick={saveAsTemplate}>
                      <Plus className="w-3 h-3 mr-1" />
                      Сохранить
                    </Button>
                  </div>
                  
                  {/* Personal templates first */}
                  {savedTemplates.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Мои шаблоны</h4>
                      <div className="space-y-2">
                        {savedTemplates.map((template: any) => (
                          <div key={template.id} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">{template.name}</span>
                            <Button size="sm" variant="outline" onClick={() => applyTemplate(template)}>
                              Применить
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>

        {/* Canvas */}
        {editorMode === 'visual' && (
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
              onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedElement(null);
            }
          }}
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
                  <p className="text-xl">Добавьте элементы для создания визуального вопроса</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        accept="image/*,video/*"
      />
    </div>
  );
}