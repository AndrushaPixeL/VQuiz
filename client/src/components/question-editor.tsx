import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuestionPreview } from "./question-preview";
import { VisualQuestionEditor } from "./visual-question-editor";
import { Upload, Mic, Bot, X, Eye, Palette, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'image_question' | 'audio_question';
  text: string;
  image?: string;
  audio?: string;
  answers: Answer[];
  timeLimit: number;
}

interface QuestionEditorProps {
  question: Question;
  onChange: (question: Question) => void;
  onDelete?: () => void;
  className?: string;
}

const answerColors = [
  { bg: "bg-red-100", text: "text-red-600", label: "A" },
  { bg: "bg-blue-100", text: "text-blue-600", label: "B" },
  { bg: "bg-green-100", text: "text-green-600", label: "C" },
  { bg: "bg-yellow-100", text: "text-yellow-600", label: "D" },
];

export function QuestionEditor({ question, onChange, onDelete, className }: QuestionEditorProps) {
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  
  const updateQuestion = (updates: Partial<Question>) => {
    onChange({ ...question, ...updates });
  };

  const updateAnswer = (index: number, updates: Partial<Answer>) => {
    const newAnswers = [...question.answers];
    newAnswers[index] = { ...newAnswers[index], ...updates };
    updateQuestion({ answers: newAnswers });
  };

  const setCorrectAnswer = (index: number) => {
    const newAnswers = question.answers.map((answer, i) => ({
      ...answer,
      isCorrect: i === index
    }));
    updateQuestion({ answers: newAnswers });
  };

  const handleFileUpload = (type: 'image' | 'video' | 'audio') => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'image' ? 'image/*' : 
                   type === 'video' ? 'video/*' : 
                   'audio/*';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        updateQuestion({ 
          [type]: url,
          type: type === 'image' ? 'image_question' : 
                type === 'video' ? 'video_question' : 
                'audio_question'
        });
      }
    };
    
    input.click();
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Tabs defaultValue="form" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="form">Форма</TabsTrigger>
          <TabsTrigger value="visual">Визуальный редактор</TabsTrigger>
          <TabsTrigger value="preview">Предпросмотр</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-6">
          {/* Question Content */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Содержание вопроса</CardTitle>
              {onDelete && (
                <Button variant="ghost" size="sm" onClick={onDelete}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="question-text">Текст вопроса</Label>
                <Textarea
                  id="question-text"
                  value={question.text}
                  onChange={(e) => updateQuestion({ text: e.target.value })}
                  placeholder="Введите ваш вопрос здесь..."
                  rows={3}
                />
              </div>

              {/* Media Upload */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Фон/Изображение</Label>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer"
                    onClick={() => handleFileUpload('image')}
                  >
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Изображение</p>
                  </div>
                </div>
                
                <div>
                  <Label>Видео фон</Label>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer"
                    onClick={() => handleFileUpload('video')}
                  >
                    <Video className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Видео</p>
                  </div>
                </div>
                
                <div>
                  <Label>Аудио</Label>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer"
                    onClick={() => handleFileUpload('audio')}
                  >
                    <Mic className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Аудио</p>
                  </div>
                </div>
              </div>

              {/* AI Audio Generation */}
              <div>
                <Label>Озвучка ИИ</Label>
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm">
                    <Bot className="w-4 h-4 mr-2" />
                    Озвучить вопрос
                  </Button>
                  <Button variant="outline" size="sm">
                    <Bot className="w-4 h-4 mr-2" />
                    Озвучить ответы
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Answer Options */}
          <Card>
            <CardHeader>
              <CardTitle>Варианты ответов</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={question.answers.findIndex(a => a.isCorrect).toString()}
                onValueChange={(value) => setCorrectAnswer(parseInt(value))}
              >
                <div className="space-y-3">
                  {question.answers.map((answer, index) => {
                    const color = answerColors[index % answerColors.length];
                    return (
                      <div key={answer.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color.bg)}>
                          <span className={cn("font-medium", color.text)}>{color.label}</span>
                        </div>
                        <Input
                          placeholder={`Вариант ответа ${color.label}`}
                          value={answer.text}
                          onChange={(e) => updateAnswer(index, { text: e.target.value })}
                          className="flex-1"
                        />
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={index.toString()} id={`answer-${index}`} />
                          <Label htmlFor={`answer-${index}`} className="text-sm text-gray-600">
                            Правильный
                          </Label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visual">
          <VisualQuestionEditor
            question={question}
            onChange={onChange}
          />
        </TabsContent>

        <TabsContent value="preview">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Предпросмотр вопроса</h3>
              <Button
                variant="outline"
                onClick={() => setIsPreviewFullscreen(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Полноэкранный режим
              </Button>
            </div>
            <QuestionPreview
              question={question}
              isFullscreen={false}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Embedded Preview */}
      <QuestionPreview
        question={question}
        isFullscreen={false}
      />

      {/* Fullscreen Preview */}
      {isPreviewFullscreen && (
        <QuestionPreview
          question={question}
          isFullscreen={true}
          onToggleFullscreen={() => setIsPreviewFullscreen(false)}
          onClose={() => setIsPreviewFullscreen(false)}
        />
      )}
    </div>
  );
}
