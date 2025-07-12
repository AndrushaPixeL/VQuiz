import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UnifiedContentList, ContentItem } from '@/components/unified-content-list';
import { EnhancedQuestionEditor } from '@/components/enhanced-question-editor';
import { VisualSplashEditor } from '@/components/visual-splash-editor';
import { toast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Save, 
  Plus, 
  Eye, 
  Play, 
  ArrowLeft, 
  Settings,
  HelpCircle,
  Monitor,
  Trophy,
  Wand2
} from 'lucide-react';
import type { Question, SplashScreen, ResultsScreen } from '@shared/schema';

interface Quiz {
  id?: number;
  title: string;
  description: string;
  questions: Question[];
  splashScreens: SplashScreen[];
  resultsScreens: ResultsScreen[];
  isPublic: boolean;
  timeLimit: number;
  minPlayers: number;
  maxPlayers: number;
  useAudioNarration: boolean;
  aiVoice?: string;
  questionTemplate?: string;
}

type ContentType = 'question' | 'splash' | 'results';

export default function QuizConstructorUnified() {
  const [, setLocation] = useLocation();
  const [quiz, setQuiz] = useState<Quiz>({
    title: '',
    description: '',
    questions: [],
    splashScreens: [],
    resultsScreens: [],
    isPublic: false,
    timeLimit: 30,
    minPlayers: 2,
    maxPlayers: 20,
    useAudioNarration: false,
  });
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Convert quiz data to unified content list
  useEffect(() => {
    const items: ContentItem[] = [
      ...quiz.questions.map((q, index) => ({
        id: `question-${index}`,
        type: 'question' as const,
        title: q.text || `Вопрос ${index + 1}`,
        content: q,
        timeLimit: q.timeLimit
      })),
      ...quiz.splashScreens.map((s, index) => ({
        id: `splash-${index}`,
        type: 'splash' as const,
        title: s.title || `Заставка ${index + 1}`,
        content: s
      })),
      ...quiz.resultsScreens.map((r, index) => ({
        id: `results-${index}`,
        type: 'results' as const,
        title: r.title || `Результаты ${index + 1}`,
        content: r
      }))
    ];
    setContentItems(items);
  }, [quiz]);

  // Update quiz when content items change
  const updateQuizFromItems = (items: ContentItem[]) => {
    const questions = items.filter(item => item.type === 'question').map(item => item.content);
    const splashScreens = items.filter(item => item.type === 'splash').map(item => item.content);
    const resultsScreens = items.filter(item => item.type === 'results').map(item => item.content);
    
    setQuiz(prev => ({
      ...prev,
      questions,
      splashScreens,
      resultsScreens
    }));
  };

  const handleContentReorder = (newItems: ContentItem[]) => {
    setContentItems(newItems);
    updateQuizFromItems(newItems);
  };

  const handleContentEdit = (item: ContentItem) => {
    setEditingItem(item);
  };

  const handleContentDelete = (id: string) => {
    const newItems = contentItems.filter(item => item.id !== id);
    setContentItems(newItems);
    updateQuizFromItems(newItems);
  };

  const handleContentDuplicate = (item: ContentItem) => {
    const newItem: ContentItem = {
      ...item,
      id: `${item.type}-${Date.now()}`,
      title: `${item.title} (копия)`
    };
    const newItems = [...contentItems, newItem];
    setContentItems(newItems);
    updateQuizFromItems(newItems);
  };

  const addNewContent = (type: ContentType) => {
    let newContent: any;
    let title: string;

    switch (type) {
      case 'question':
        newContent = {
          id: Date.now().toString(),
          type: 'multiple_choice',
          text: '',
          answers: [
            { id: '1', text: '', isCorrect: false },
            { id: '2', text: '', isCorrect: false }
          ],
          timeLimit: 30,
          useAIVoice: false,
          visualElements: []
        };
        title = `Вопрос ${contentItems.filter(i => i.type === 'question').length + 1}`;
        break;
      case 'splash':
        newContent = {
          id: Date.now().toString(),
          title: '',
          subtitle: '',
          type: 'start',
          backgroundStyle: { type: 'color', value: '#6366f1' },
          visualElements: []
        };
        title = `Заставка ${contentItems.filter(i => i.type === 'splash').length + 1}`;
        break;
      case 'results':
        newContent = {
          id: Date.now().toString(),
          title: 'Результаты',
          showLeaderboard: true,
          showStats: true,
          backgroundStyle: { type: 'color', value: '#10b981' }
        };
        title = `Результаты ${contentItems.filter(i => i.type === 'results').length + 1}`;
        break;
    }

    const newItem: ContentItem = {
      id: `${type}-${Date.now()}`,
      type,
      title,
      content: newContent
    };

    const newItems = [...contentItems, newItem];
    setContentItems(newItems);
    updateQuizFromItems(newItems);
    setEditingItem(newItem);
  };

  const saveContent = (updatedContent: any) => {
    if (!editingItem) return;

    const updatedItem = {
      ...editingItem,
      content: updatedContent,
      title: updatedContent.text || updatedContent.title || editingItem.title,
      timeLimit: updatedContent.timeLimit
    };

    const newItems = contentItems.map(item => 
      item.id === editingItem.id ? updatedItem : item
    );
    
    setContentItems(newItems);
    updateQuizFromItems(newItems);
    setEditingItem(null);
  };

  const saveQuizMutation = useMutation({
    mutationFn: async (quizData: Quiz) => {
      return apiRequest('/api/quizzes', {
        method: 'POST',
        body: JSON.stringify({
          title: quizData.title,
          description: quizData.description,
          questions: quizData.questions,
          isPublic: quizData.isPublic
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Квиз сохранен",
        description: "Ваш квиз успешно сохранен"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/quizzes'] });
      setLocation('/');
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить квиз",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    if (!quiz.title.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название квиза",
        variant: "destructive"
      });
      return;
    }

    if (quiz.questions.length === 0) {
      toast({
        title: "Ошибка", 
        description: "Добавьте хотя бы один вопрос",
        variant: "destructive"
      });
      return;
    }

    saveQuizMutation.mutate(quiz);
  };

  const handlePreview = () => {
    if (quiz.questions.length === 0) {
      toast({
        title: "Ошибка",
        description: "Добавьте вопросы для предварительного просмотра",
        variant: "destructive"
      });
      return;
    }
    
    localStorage.setItem('previewQuiz', JSON.stringify(quiz));
    window.open('/preview', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Конструктор квизов
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Создайте интерактивный квиз с вопросами, заставками и результатами
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowSettings(true)}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Настройки
            </Button>
            <Button
              variant="outline"
              onClick={handlePreview}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              Предпросмотр
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveQuizMutation.isPending}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {saveQuizMutation.isPending ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Content List */}
          <div className="col-span-4">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Содержание квиза
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addNewContent('question')}
                      title="Добавить вопрос"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addNewContent('splash')}
                      title="Добавить заставку"
                    >
                      <Monitor className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addNewContent('results')}
                      title="Добавить результаты"
                    >
                      <Trophy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UnifiedContentList
                  items={contentItems}
                  onReorder={handleContentReorder}
                  onEdit={handleContentEdit}
                  onDelete={handleContentDelete}
                  onDuplicate={handleContentDuplicate}
                />
              </CardContent>
            </Card>
          </div>

          {/* Editor Panel */}
          <div className="col-span-8">
            {editingItem ? (
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Редактирование: {editingItem.title}
                    <Button
                      variant="ghost"
                      onClick={() => setEditingItem(null)}
                    >
                      ×
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {editingItem.type === 'question' && (
                    <EnhancedQuestionEditor
                      question={editingItem.content}
                      onChange={saveContent}
                      onSave={() => setEditingItem(null)}
                    />
                  )}
                  {editingItem.type === 'splash' && (
                    <VisualSplashEditor
                      splashScreen={editingItem.content}
                      onChange={saveContent}
                    />
                  )}
                  {editingItem.type === 'results' && (
                    <div className="p-6">
                      <p className="text-gray-500">Редактор результатов будет добавлен</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Wand2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">Выберите элемент для редактирования</h3>
                  <p className="text-gray-600 mb-6">
                    Добавьте вопросы, заставки или экраны результатов, затем нажмите на них для редактирования
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={() => addNewContent('question')}
                      className="gap-2"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Добавить вопрос
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => addNewContent('splash')}
                      className="gap-2"
                    >
                      <Monitor className="w-4 h-4" />
                      Добавить заставку
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => addNewContent('results')}
                      className="gap-2"
                    >
                      <Trophy className="w-4 h-4" />
                      Добавить результаты
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Настройки квиза</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Название</Label>
                <Input
                  id="title"
                  value={quiz.title}
                  onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Введите название квиза"
                />
              </div>
              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={quiz.description}
                  onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Краткое описание квиза"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minPlayers">Мин. игроков</Label>
                  <Input
                    id="minPlayers"
                    type="number"
                    min="1"
                    value={quiz.minPlayers}
                    onChange={(e) => setQuiz(prev => ({ ...prev, minPlayers: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxPlayers">Макс. игроков</Label>
                  <Input
                    id="maxPlayers"
                    type="number"
                    min="1"
                    value={quiz.maxPlayers}
                    onChange={(e) => setQuiz(prev => ({ ...prev, maxPlayers: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowSettings(false)}>
                  Отмена
                </Button>
                <Button onClick={() => setShowSettings(false)}>
                  Сохранить
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}