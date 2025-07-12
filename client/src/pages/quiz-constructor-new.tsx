import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { QuestionEditor } from '@/components/question-editor';
import { SplashScreenEditor } from '@/components/splash-screen-editor';
import { ResultsScreenEditor } from '@/components/results-screen-editor';
import { toast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Save, 
  Plus, 
  Eye, 
  Play, 
  ArrowLeft, 
  Trash2, 
  ArrowUp,
  ArrowDown,
  Copy,
  Settings,
  HelpCircle,
  Monitor,
  Trophy,
  FileText,
  Layout,
  Wand2,
  Sparkles
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

type EditorMode = 'question' | 'splash' | 'results' | null;

export default function QuizConstructor() {
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
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Загрузка настроек из localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('quizSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setQuiz(prev => ({ ...prev, ...settings }));
        localStorage.removeItem('quizSettings'); // Удаляем после использования
      } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
      }
    }
  }, []);

  const saveQuizMutation = useMutation({
    mutationFn: async (quizData: Quiz) => {
      const response = await apiRequest('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizData),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Квиз сохранен",
        description: "Ваш квиз успешно создан!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/quizzes'] });
      setLocation('/');
    },
    onError: (error) => {
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить квиз. Попробуйте еще раз.",
        variant: "destructive",
      });
    },
  });

  // Функции для работы с вопросами
  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'multiple_choice',
      text: '',
      answers: [
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false },
        { id: '3', text: '', isCorrect: false },
        { id: '4', text: '', isCorrect: false },
      ],
      timeLimit: 30,
      timerDelay: 0,
      useAIVoice: false,
    };
    setQuiz(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
    setEditorMode('question');
    setSelectedIndex(quiz.questions.length);
  };

  const updateQuestion = (index: number, question: Question) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === index ? question : q)
    }));
  };

  const deleteQuestion = (index: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
    setSelectedIndex(null);
    setEditorMode(null);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newQuestions = [...quiz.questions];
      [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]];
      setQuiz(prev => ({ ...prev, questions: newQuestions }));
      setSelectedIndex(index - 1);
    } else if (direction === 'down' && index < quiz.questions.length - 1) {
      const newQuestions = [...quiz.questions];
      [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
      setQuiz(prev => ({ ...prev, questions: newQuestions }));
      setSelectedIndex(index + 1);
    }
  };

  const duplicateQuestion = (index: number) => {
    const questionToCopy = quiz.questions[index];
    const newQuestion = {
      ...questionToCopy,
      id: Date.now().toString(),
      text: `${questionToCopy.text} (копия)`,
    };
    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions.slice(0, index + 1), newQuestion, ...prev.questions.slice(index + 1)]
    }));
  };

  const saveQuestionAsTemplate = (index: number) => {
    const question = quiz.questions[index];
    const templates = JSON.parse(localStorage.getItem('questionTemplates') || '[]');
    const template = {
      id: Date.now().toString(),
      name: `Шаблон: ${question.text.substring(0, 30)}...`,
      question: question,
      createdAt: new Date().toISOString(),
    };
    templates.push(template);
    localStorage.setItem('questionTemplates', JSON.stringify(templates));
    toast({
      title: "Шаблон сохранен",
      description: "Вопрос сохранен как шаблон для будущего использования.",
    });
  };

  // Функции для работы с заставками
  const addSplashScreen = (type: 'start' | 'round' | 'end') => {
    const newSplashScreen: SplashScreen = {
      id: Date.now().toString(),
      type,
      title: type === 'start' ? 'Добро пожаловать!' : 
             type === 'round' ? 'Раунд' : 'Финал',
      subtitle: type === 'start' ? 'Готовы к квизу?' : 
                type === 'round' ? 'Следующий раунд' : 'Подведение итогов',
      elements: [],
    };
    setQuiz(prev => ({ ...prev, splashScreens: [...prev.splashScreens, newSplashScreen] }));
    setEditorMode('splash');
    setSelectedIndex(quiz.splashScreens.length);
  };

  const updateSplashScreen = (index: number, splashScreen: SplashScreen) => {
    setQuiz(prev => ({
      ...prev,
      splashScreens: prev.splashScreens.map((s, i) => i === index ? splashScreen : s)
    }));
  };

  const deleteSplashScreen = (index: number) => {
    setQuiz(prev => ({
      ...prev,
      splashScreens: prev.splashScreens.filter((_, i) => i !== index)
    }));
    setSelectedIndex(null);
    setEditorMode(null);
  };

  // Функции для работы с результатами
  const addResultsScreen = () => {
    const newResultsScreen: ResultsScreen = {
      id: Date.now().toString(),
      title: 'Результаты',
      leaderboardStyle: {
        position: { x: 50, y: 50 },
        size: { width: 400, height: 500 },
        style: 'classic',
        colors: {
          background: '#1e40af',
          text: '#ffffff',
          accent: '#fbbf24',
        },
      },
      elements: [],
    };
    setQuiz(prev => ({ ...prev, resultsScreens: [...prev.resultsScreens, newResultsScreen] }));
    setEditorMode('results');
    setSelectedIndex(quiz.resultsScreens.length);
  };

  const updateResultsScreen = (index: number, resultsScreen: ResultsScreen) => {
    setQuiz(prev => ({
      ...prev,
      resultsScreens: prev.resultsScreens.map((r, i) => i === index ? resultsScreen : r)
    }));
  };

  const deleteResultsScreen = (index: number) => {
    setQuiz(prev => ({
      ...prev,
      resultsScreens: prev.resultsScreens.filter((_, i) => i !== index)
    }));
    setSelectedIndex(null);
    setEditorMode(null);
  };

  const handleSave = () => {
    if (!quiz.title.trim()) {
      toast({
        title: "Заполните название",
        description: "Квиз должен иметь название.",
        variant: "destructive",
      });
      return;
    }

    if (quiz.questions.length === 0) {
      toast({
        title: "Добавьте вопросы",
        description: "Квиз должен содержать хотя бы один вопрос.",
        variant: "destructive",
      });
      return;
    }

    saveQuizMutation.mutate(quiz);
  };

  const handleTestQuiz = () => {
    if (quiz.questions.length === 0) {
      toast({
        title: "Добавьте вопросы",
        description: "Для тестирования нужен хотя бы один вопрос.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('testQuiz', JSON.stringify(quiz));
    setLocation('/solo/test');
  };

  const renderEditor = () => {
    if (editorMode === 'question' && selectedIndex !== null && quiz.questions[selectedIndex]) {
      return (
        <QuestionEditor
          question={quiz.questions[selectedIndex]}
          onChange={(updatedQuestion) => updateQuestion(selectedIndex, updatedQuestion)}
          onDelete={() => deleteQuestion(selectedIndex)}
        />
      );
    }

    if (editorMode === 'splash' && selectedIndex !== null && quiz.splashScreens[selectedIndex]) {
      return (
        <SplashScreenEditor
          splashScreen={quiz.splashScreens[selectedIndex]}
          onChange={(updatedSplashScreen) => updateSplashScreen(selectedIndex, updatedSplashScreen)}
          onDelete={() => deleteSplashScreen(selectedIndex)}
        />
      );
    }

    if (editorMode === 'results' && selectedIndex !== null && quiz.resultsScreens[selectedIndex]) {
      return (
        <ResultsScreenEditor
          resultsScreen={quiz.resultsScreens[selectedIndex]}
          onChange={(updatedResultsScreen) => updateResultsScreen(selectedIndex, updatedResultsScreen)}
          onDelete={() => deleteResultsScreen(selectedIndex)}
        />
      );
    }

    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="text-center">
          <Wand2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Создайте содержимое для квиза
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Выберите тип контента для создания
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={addQuestion} className="gap-2">
              <HelpCircle className="w-4 h-4" />
              Создать вопрос
            </Button>
            <Button onClick={() => addSplashScreen('start')} variant="outline" className="gap-2">
              <Monitor className="w-4 h-4" />
              Создать заставку
            </Button>
            <Button onClick={addResultsScreen} variant="outline" className="gap-2">
              <Trophy className="w-4 h-4" />
              Создать результаты
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setLocation('/quiz-settings')}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Настройки
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {quiz.title || 'Редактор квиза'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Создайте увлекательный квиз с заставками и результатами
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleTestQuiz}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              Тест
            </Button>
            <Button
              onClick={handleSave}
              size="sm"
              className="gap-2"
              disabled={saveQuizMutation.isPending}
            >
              <Save className="w-4 h-4" />
              {saveQuizMutation.isPending ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Настройки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Название</Label>
                  <Input
                    id="title"
                    value={quiz.title}
                    onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Название квиза"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={quiz.description}
                    onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Описание квиза"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Templates and Content */}
            <Card className="mt-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  Шаблоны и контент
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="questions">
                    <AccordionTrigger className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        Вопросы
                        <Badge variant="secondary">
                          {quiz.questions.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-2">
                        {quiz.questions.map((question, index) => (
                          <div
                            key={question.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              editorMode === 'question' && selectedIndex === index
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => {
                              setEditorMode('question');
                              setSelectedIndex(index);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {index + 1}
                                </Badge>
                                <span className="text-sm font-medium truncate">
                                  {question.text || 'Новый вопрос'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveQuestion(index, 'up');
                                  }}
                                  size="sm"
                                  variant="ghost"
                                  disabled={index === 0}
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveQuestion(index, 'down');
                                  }}
                                  size="sm"
                                  variant="ghost"
                                  disabled={index === quiz.questions.length - 1}
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    duplicateQuestion(index);
                                  }}
                                  size="sm"
                                  variant="ghost"
                                  title="Дублировать"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    saveQuestionAsTemplate(index);
                                  }}
                                  size="sm"
                                  variant="ghost"
                                  title="Сохранить как шаблон"
                                >
                                  <Layout className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteQuestion(index);
                                  }}
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button
                          onClick={addQuestion}
                          variant="outline"
                          size="sm"
                          className="w-full gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Добавить вопрос
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="splash-screens">
                    <AccordionTrigger className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        Заставки
                        <Badge variant="secondary">
                          {quiz.splashScreens.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-2">
                        {quiz.splashScreens.map((splashScreen, index) => (
                          <div
                            key={splashScreen.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              editorMode === 'splash' && selectedIndex === index
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => {
                              setEditorMode('splash');
                              setSelectedIndex(index);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    splashScreen.type === 'start' ? 'bg-green-100 text-green-800' :
                                    splashScreen.type === 'round' ? 'bg-blue-100 text-blue-800' :
                                    'bg-purple-100 text-purple-800'
                                  }`}
                                >
                                  {splashScreen.type === 'start' ? 'Начало' :
                                   splashScreen.type === 'round' ? 'Раунд' : 'Финал'}
                                </Badge>
                                <span className="text-sm font-medium truncate">
                                  {splashScreen.title}
                                </span>
                              </div>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSplashScreen(index);
                                }}
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div className="space-y-1">
                          <Button
                            onClick={() => addSplashScreen('start')}
                            variant="outline"
                            size="sm"
                            className="w-full gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Начальная заставка
                          </Button>
                          <Button
                            onClick={() => addSplashScreen('round')}
                            variant="outline"
                            size="sm"
                            className="w-full gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Заставка раунда
                          </Button>
                          <Button
                            onClick={() => addSplashScreen('end')}
                            variant="outline"
                            size="sm"
                            className="w-full gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Финальная заставка
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="results">
                    <AccordionTrigger className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        Результаты
                        <Badge variant="secondary">
                          {quiz.resultsScreens.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-2">
                        {quiz.resultsScreens.map((resultsScreen, index) => (
                          <div
                            key={resultsScreen.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              editorMode === 'results' && selectedIndex === index
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => {
                              setEditorMode('results');
                              setSelectedIndex(index);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4" />
                                <span className="text-sm font-medium truncate">
                                  {resultsScreen.title}
                                </span>
                              </div>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteResultsScreen(index);
                                }}
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          onClick={addResultsScreen}
                          variant="outline"
                          size="sm"
                          className="w-full gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Добавить результаты
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Main Editor */}
          <div className="lg:col-span-3">
            {renderEditor()}
          </div>
        </div>
      </div>
    </div>
  );
}