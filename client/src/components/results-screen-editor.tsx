import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Eye, 
  Save, 
  Trash2, 
  Palette, 
  Move, 
  Type, 
  Image,
  X,
  Crown,
  Medal,
  Award
} from 'lucide-react';
import type { ResultsScreen } from '@shared/schema';

interface ResultsScreenEditorProps {
  resultsScreen: ResultsScreen;
  onChange: (resultsScreen: ResultsScreen) => void;
  onSave?: () => void;
  onDelete?: () => void;
  className?: string;
}

const LEADERBOARD_STYLES = [
  { value: 'classic', label: 'Классический', icon: Trophy },
  { value: 'modern', label: 'Современный', icon: Crown },
  { value: 'minimal', label: 'Минимальный', icon: Medal },
];

const BACKGROUND_PRESETS = [
  { type: 'color', value: '#1e40af', label: 'Синий' },
  { type: 'color', value: '#7c3aed', label: 'Фиолетовый' },
  { type: 'color', value: '#059669', label: 'Зеленый' },
  { type: 'color', value: '#dc2626', label: 'Красный' },
  { type: 'color', value: '#ea580c', label: 'Оранжевый' },
  { type: 'color', value: '#000000', label: 'Черный' },
];

// Пример данных для превью
const SAMPLE_RESULTS = [
  { name: 'Алексей', score: 95, rank: 1 },
  { name: 'Мария', score: 87, rank: 2 },
  { name: 'Иван', score: 82, rank: 3 },
  { name: 'Елена', score: 78, rank: 4 },
  { name: 'Дмитрий', score: 71, rank: 5 },
];

export function ResultsScreenEditor({ 
  resultsScreen, 
  onChange, 
  onSave, 
  onDelete,
  className 
}: ResultsScreenEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const updateResultsScreen = (updates: Partial<ResultsScreen>) => {
    onChange({ ...resultsScreen, ...updates });
  };

  const updateLeaderboardStyle = (updates: Partial<ResultsScreen['leaderboardStyle']>) => {
    updateResultsScreen({
      leaderboardStyle: { ...resultsScreen.leaderboardStyle, ...updates }
    });
  };

  const updateElement = (elementId: string, updates: any) => {
    const updatedElements = resultsScreen.elements.map(element =>
      element.id === elementId ? { ...element, ...updates } : element
    );
    updateResultsScreen({ elements: updatedElements });
  };

  const addElement = (type: 'text' | 'image' | 'video') => {
    const newElement = {
      id: Date.now().toString(),
      type,
      x: 100,
      y: 100,
      width: type === 'text' ? 200 : 150,
      height: type === 'text' ? 50 : 100,
      content: type === 'text' ? 'Новый текст' : '',
      styles: type === 'text' ? {
        fontSize: 18,
        fontWeight: 'normal',
        color: '#ffffff',
        textAlign: 'center',
      } : {},
    };
    updateResultsScreen({ elements: [...resultsScreen.elements, newElement] });
  };

  const deleteElement = (elementId: string) => {
    const updatedElements = resultsScreen.elements.filter(element => element.id !== elementId);
    updateResultsScreen({ elements: updatedElements });
    setSelectedElement(null);
  };

  const renderLeaderboard = () => {
    const { leaderboardStyle } = resultsScreen;
    
    return (
      <div
        className="absolute rounded-lg shadow-lg overflow-hidden"
        style={{
          left: `${leaderboardStyle.position.x}px`,
          top: `${leaderboardStyle.position.y}px`,
          width: `${leaderboardStyle.size.width}px`,
          height: `${leaderboardStyle.size.height}px`,
          backgroundColor: leaderboardStyle.colors.background,
          color: leaderboardStyle.colors.text,
        }}
      >
        <div className="p-4">
          <h3 className="text-xl font-bold mb-4 text-center">
            {resultsScreen.title}
          </h3>
          
          <div className="space-y-2">
            {SAMPLE_RESULTS.map((player, index) => (
              <div
                key={player.name}
                className={`flex items-center justify-between p-3 rounded ${
                  index === 0 ? 'bg-yellow-500/20' : 
                  index === 1 ? 'bg-gray-400/20' : 
                  index === 2 ? 'bg-orange-600/20' : 
                  'bg-gray-200/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10">
                    {index === 0 && <Crown className="w-4 h-4 text-yellow-400" />}
                    {index === 1 && <Medal className="w-4 h-4 text-gray-400" />}
                    {index === 2 && <Award className="w-4 h-4 text-orange-600" />}
                    {index > 2 && <span className="text-sm font-bold">{player.rank}</span>}
                  </div>
                  <span className="font-medium">{player.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{player.score}</div>
                  <div className="text-sm opacity-75">очков</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isPreviewMode) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div 
          className="relative w-full h-full"
          style={{
            backgroundColor: resultsScreen.background?.type === 'color' 
              ? resultsScreen.background.value 
              : '#1e40af',
            backgroundImage: resultsScreen.background?.type === 'image' 
              ? `url(${resultsScreen.background.value})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Таблица лидеров */}
          {renderLeaderboard()}

          {/* Дополнительные элементы */}
          {resultsScreen.elements.map((element) => (
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
              <Trophy className="w-5 h-5" />
              Редактор результатов
              <Badge className="bg-yellow-500 text-black">
                Таблица лидеров
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
          <Tabs defaultValue="leaderboard" className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="leaderboard">Лидеры</TabsTrigger>
              <TabsTrigger value="design">Дизайн</TabsTrigger>
              <TabsTrigger value="elements">Элементы</TabsTrigger>
            </TabsList>

            <TabsContent value="leaderboard" className="space-y-4">
              <div>
                <Label htmlFor="title">Заголовок</Label>
                <Input
                  id="title"
                  value={resultsScreen.title}
                  onChange={(e) => updateResultsScreen({ title: e.target.value })}
                  placeholder="Результаты квиза"
                />
              </div>

              <div>
                <Label>Стиль таблицы</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {LEADERBOARD_STYLES.map((style) => {
                    const Icon = style.icon;
                    return (
                      <button
                        key={style.value}
                        onClick={() => updateLeaderboardStyle({ style: style.value as any })}
                        className={`p-3 rounded border-2 transition-colors ${
                          resultsScreen.leaderboardStyle.style === style.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-1" />
                        <div className="text-xs">{style.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Позиция X</Label>
                  <Input
                    type="number"
                    value={resultsScreen.leaderboardStyle.position.x}
                    onChange={(e) => updateLeaderboardStyle({ 
                      position: { 
                        ...resultsScreen.leaderboardStyle.position, 
                        x: Number(e.target.value) 
                      } 
                    })}
                  />
                </div>
                <div>
                  <Label>Позиция Y</Label>
                  <Input
                    type="number"
                    value={resultsScreen.leaderboardStyle.position.y}
                    onChange={(e) => updateLeaderboardStyle({ 
                      position: { 
                        ...resultsScreen.leaderboardStyle.position, 
                        y: Number(e.target.value) 
                      } 
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ширина</Label>
                  <Input
                    type="number"
                    value={resultsScreen.leaderboardStyle.size.width}
                    onChange={(e) => updateLeaderboardStyle({ 
                      size: { 
                        ...resultsScreen.leaderboardStyle.size, 
                        width: Number(e.target.value) 
                      } 
                    })}
                  />
                </div>
                <div>
                  <Label>Высота</Label>
                  <Input
                    type="number"
                    value={resultsScreen.leaderboardStyle.size.height}
                    onChange={(e) => updateLeaderboardStyle({ 
                      size: { 
                        ...resultsScreen.leaderboardStyle.size, 
                        height: Number(e.target.value) 
                      } 
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Цвет фона</Label>
                  <Input
                    type="color"
                    value={resultsScreen.leaderboardStyle.colors.background}
                    onChange={(e) => updateLeaderboardStyle({ 
                      colors: { 
                        ...resultsScreen.leaderboardStyle.colors, 
                        background: e.target.value 
                      } 
                    })}
                  />
                </div>
                <div>
                  <Label>Цвет текста</Label>
                  <Input
                    type="color"
                    value={resultsScreen.leaderboardStyle.colors.text}
                    onChange={(e) => updateLeaderboardStyle({ 
                      colors: { 
                        ...resultsScreen.leaderboardStyle.colors, 
                        text: e.target.value 
                      } 
                    })}
                  />
                </div>
                <div>
                  <Label>Акцентный цвет</Label>
                  <Input
                    type="color"
                    value={resultsScreen.leaderboardStyle.colors.accent}
                    onChange={(e) => updateLeaderboardStyle({ 
                      colors: { 
                        ...resultsScreen.leaderboardStyle.colors, 
                        accent: e.target.value 
                      } 
                    })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="design" className="space-y-4">
              <div>
                <Label>Фон экрана</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {BACKGROUND_PRESETS.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => updateResultsScreen({ 
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
                    value={resultsScreen.background?.value || '#1e40af'}
                    onChange={(e) => updateResultsScreen({ 
                      background: { type: 'color', value: e.target.value } 
                    })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={resultsScreen.background?.value || '#1e40af'}
                    onChange={(e) => updateResultsScreen({ 
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
                  value={resultsScreen.background?.type === 'image' ? resultsScreen.background.value : ''}
                  onChange={(e) => updateResultsScreen({ 
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
                {resultsScreen.elements.map((element) => (
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