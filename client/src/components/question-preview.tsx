import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Maximize2, Minimize2, Play, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'image_question' | 'audio_question';
  text: string;
  image?: string;
  audio?: string;
  answers: { id: string; text: string; isCorrect: boolean }[];
  timeLimit: number;
}

interface QuestionPreviewProps {
  question: Question;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onClose?: () => void;
  className?: string;
}

export function QuestionPreview({ 
  question, 
  isFullscreen = false, 
  onToggleFullscreen,
  onClose,
  className 
}: QuestionPreviewProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(question.timeLimit);

  const answerColors = [
    { bg: "bg-red-500", label: "A" },
    { bg: "bg-blue-500", label: "B" },
    { bg: "bg-green-500", label: "C" },
    { bg: "bg-yellow-500", label: "D" },
  ];

  const handlePlayAudio = () => {
    // Placeholder for AI audio generation
    console.log("Playing AI-generated audio for:", question.text);
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
        {/* Fullscreen Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Предпросмотр вопроса</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePlayAudio}>
              <Volume2 className="w-4 h-4 mr-2" />
              Озвучить ИИ
            </Button>
            <Button variant="outline" size="sm" onClick={onToggleFullscreen}>
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Fullscreen Content */}
        <div className="flex-1 gradient-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          <div className="relative z-10 h-full flex flex-col justify-center items-center text-white p-8">
            <div className="text-center max-w-4xl w-full">
              <h1 className="text-5xl font-bold mb-12">{question.text}</h1>
              
              {question.image && (
                <div className="mb-8">
                  <img 
                    src={question.image} 
                    alt="Question" 
                    className="max-w-md mx-auto rounded-lg shadow-lg"
                  />
                </div>
              )}

              {/* Answer Options */}
              <div className="grid grid-cols-2 gap-6 mt-12">
                {question.answers.map((answer, index) => (
                  <button
                    key={answer.id}
                    onClick={() => setSelectedAnswer(answer.id)}
                    className={cn(
                      "bg-opacity-90 rounded-xl p-6 text-center transition-all hover:scale-105",
                      answerColors[index % answerColors.length].bg,
                      selectedAnswer === answer.id && "ring-4 ring-white scale-105"
                    )}
                  >
                    <div className="text-2xl font-bold mb-2">
                      {answerColors[index % answerColors.length].label}
                    </div>
                    <div className="text-lg">{answer.text}</div>
                  </button>
                ))}
              </div>

              {/* Timer */}
              <div className="mt-12">
                <div className="w-24 h-24 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold">{timeLeft}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("mt-6", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Предпросмотр</h3>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePlayAudio}>
              <Volume2 className="w-4 h-4 mr-2" />
              Озвучить
            </Button>
            <Button variant="outline" size="sm" onClick={onToggleFullscreen}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 text-white min-h-[300px] flex flex-col justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">{question.text}</h2>
            
            {question.image && (
              <div className="mb-6">
                <img 
                  src={question.image} 
                  alt="Question" 
                  className="max-w-xs mx-auto rounded-lg"
                />
              </div>
            )}

            {/* Compact Answer Options */}
            <div className="grid grid-cols-2 gap-3">
              {question.answers.map((answer, index) => (
                <button
                  key={answer.id}
                  onClick={() => setSelectedAnswer(answer.id)}
                  className={cn(
                    "rounded-lg p-3 text-sm transition-all",
                    answerColors[index % answerColors.length].bg,
                    selectedAnswer === answer.id && "ring-2 ring-white"
                  )}
                >
                  <div className="font-bold mb-1">
                    {answerColors[index % answerColors.length].label}
                  </div>
                  <div>{answer.text}</div>
                </button>
              ))}
            </div>

            {/* Timer */}
            <div className="mt-6">
              <div className="w-16 h-16 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold">{timeLeft}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}