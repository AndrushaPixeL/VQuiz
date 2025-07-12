import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionEditor } from "@/components/question-editor";
import { Brain, X, Save, Eye, Plus, ListEnd, CheckCircle, Image, Volume2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Quiz, Question } from "@shared/schema";

const questionTemplates = [
  {
    id: 'multiple_choice',
    title: 'Множественный выбор',
    icon: ListEnd,
    color: 'text-blue-600',
    description: '4 варианта ответа',
    template: {
      type: 'multiple_choice' as const,
      text: '',
      answers: [
        { id: 'a', text: '', isCorrect: false },
        { id: 'b', text: '', isCorrect: false },
        { id: 'c', text: '', isCorrect: true },
        { id: 'd', text: '', isCorrect: false },
      ],
      timeLimit: 30,
    }
  },
  {
    id: 'true_false',
    title: 'Правда/Ложь',
    icon: CheckCircle,
    color: 'text-green-600',
    description: '2 варианта ответа',
    template: {
      type: 'true_false' as const,
      text: '',
      answers: [
        { id: 'true', text: 'Правда', isCorrect: true },
        { id: 'false', text: 'Ложь', isCorrect: false },
      ],
      timeLimit: 30,
    }
  },
  {
    id: 'image_question',
    title: 'Вопрос с изображением',
    icon: Image,
    color: 'text-purple-600',
    description: 'С картинкой',
    template: {
      type: 'image_question' as const,
      text: '',
      image: '',
      answers: [
        { id: 'a', text: '', isCorrect: false },
        { id: 'b', text: '', isCorrect: false },
        { id: 'c', text: '', isCorrect: true },
        { id: 'd', text: '', isCorrect: false },
      ],
      timeLimit: 30,
    }
  },
  {
    id: 'audio_question',
    title: 'Аудио вопрос',
    icon: Volume2,
    color: 'text-orange-600',
    description: 'С озвучкой',
    template: {
      type: 'audio_question' as const,
      text: '',
      audio: '',
      answers: [
        { id: 'a', text: '', isCorrect: false },
        { id: 'b', text: '', isCorrect: false },
        { id: 'c', text: '', isCorrect: true },
        { id: 'd', text: '', isCorrect: false },
      ],
      timeLimit: 30,
    }
  },
];

export default function QuizConstructor() {
  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState<Partial<Quiz>>({
    title: '',
    description: '',
    isPublic: false,
    timeLimit: 30,
    minPlayers: 2,
    maxPlayers: 20,
    useAudioNarration: false,
    questions: [],
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const { data: existingQuiz, isLoading } = useQuery({
    queryKey: ['/api/quizzes', id],
    enabled: !!id,
  });

  useEffect(() => {
    if (existingQuiz) {
      setQuiz(existingQuiz);
    }
  }, [existingQuiz]);

  const saveMutation = useMutation({
    mutationFn: async (quizData: any) => {
      const url = id ? `/api/quizzes/${id}` : '/api/quizzes';
      const method = id ? 'PUT' : 'POST';
      const response = await apiRequest(method, url, quizData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: id ? "Квиз обновлен" : "Квиз создан",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/quizzes'] });
      setLocation('/');
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить квиз",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!quiz.title || !quiz.questions || quiz.questions.length === 0) {
      toast({
        title: "Ошибка валидации",
        description: "Добавьте название и хотя бы один вопрос",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate(quiz);
  };

  const addQuestion = (template: any) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      ...template,
    };
    
    const newQuestions = [...(quiz.questions || []), newQuestion];
    setQuiz({ ...quiz, questions: newQuestions });
    setCurrentQuestionIndex(newQuestions.length - 1);
  };

  const updateQuestion = (index: number, question: Question) => {
    const newQuestions = [...(quiz.questions || [])];
    newQuestions[index] = question;
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const deleteQuestion = (index: number) => {
    const newQuestions = [...(quiz.questions || [])];
    newQuestions.splice(index, 1);
    setQuiz({ ...quiz, questions: newQuestions });
    
    if (currentQuestionIndex >= newQuestions.length) {
      setCurrentQuestionIndex(Math.max(0, newQuestions.length - 1));
    }
  };

  const currentQuestion = quiz.questions?.[currentQuestionIndex];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Загрузка квиза...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Конструктор квиза</h2>
            <Button variant="ghost" size="sm" onClick={() => setLocation('/')}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Input
            placeholder="Название квиза"
            value={quiz.title}
            onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
          />
        </div>
        
        {/* Question Templates */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Шаблоны вопросов</h3>
            <div className="space-y-2">
              {questionTemplates.map((template) => {
                const IconComponent = template.icon;
                return (
                  <div
                    key={template.id}
                    className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => addQuestion(template.template)}
                  >
                    <div className="flex items-center">
                      <IconComponent className={`w-5 h-5 ${template.color} mr-3`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{template.title}</p>
                        <p className="text-xs text-gray-500">{template.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Settings */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Настройки квиза</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="timeLimit">Время на ответ (сек)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  value={quiz.timeLimit}
                  onChange={(e) => setQuiz({ ...quiz, timeLimit: parseInt(e.target.value) || 30 })}
                />
              </div>
              <div>
                <Label htmlFor="minPlayers">Мин. игроков</Label>
                <Input
                  id="minPlayers"
                  type="number"
                  value={quiz.minPlayers}
                  onChange={(e) => setQuiz({ ...quiz, minPlayers: parseInt(e.target.value) || 2 })}
                />
              </div>
              <div>
                <Label htmlFor="maxPlayers">Макс. игроков</Label>
                <Input
                  id="maxPlayers"
                  type="number"
                  value={quiz.maxPlayers}
                  onChange={(e) => setQuiz({ ...quiz, maxPlayers: parseInt(e.target.value) || 20 })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useAudioNarration"
                  checked={quiz.useAudioNarration}
                  onCheckedChange={(checked) => setQuiz({ ...quiz, useAudioNarration: !!checked })}
                />
                <Label htmlFor="useAudioNarration">Озвучка ИИ</Label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1" disabled={saveMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button variant="outline" className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              Предпросмотр
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Editor Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {quiz.questions?.map((_, index) => (
                <Button
                  key={index}
                  variant={currentQuestionIndex === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentQuestionIndex(index)}
                >
                  Вопрос {index + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addQuestion(questionTemplates[0].template)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить вопрос
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Вопросов: {quiz.questions?.length || 0}
              </span>
            </div>
          </div>
        </div>
        
        {/* Question Editor */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {currentQuestion ? (
              <QuestionEditor
                question={currentQuestion}
                onChange={(question) => updateQuestion(currentQuestionIndex, question)}
                onDelete={() => deleteQuestion(currentQuestionIndex)}
              />
            ) : (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Добавьте первый вопрос</h3>
                <p className="text-gray-600 mb-4">Выберите шаблон вопроса из левой панели</p>
                <Button onClick={() => addQuestion(questionTemplates[0].template)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить вопрос
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
