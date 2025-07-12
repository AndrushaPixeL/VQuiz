import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause, SkipForward, Volume2, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface SoloPlayProps {
  quizId: string;
}

export default function SoloPlay() {
  const [, setLocation] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  // Get quiz ID from URL
  const quizId = window.location.pathname.split('/').pop();

  // Fetch quiz data
  const { data: quiz, isLoading } = useQuery({
    queryKey: [`/api/quizzes/${quizId}`],
    enabled: !!quizId,
  });

  const answerColors = [
    { bg: "bg-red-500", label: "A" },
    { bg: "bg-blue-500", label: "B" },
    { bg: "bg-green-500", label: "C" },
    { bg: "bg-yellow-500", label: "D" },
  ];

  useEffect(() => {
    if (!isPlaying || showResult || gameFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, showResult, gameFinished]);

  const handleAnswer = (answerId: string | null) => {
    if (!quiz || !quiz.questions) return;

    const currentQ = quiz.questions[currentQuestion];
    const correctAnswer = currentQ.answers.find((a: any) => a.isCorrect);
    const isCorrect = answerId === correctAnswer?.id;

    // Calculate score
    let points = 0;
    if (isCorrect) {
      const timeBonus = Math.max(0, timeLeft * 10);
      points = 1000 + timeBonus;
      setScore(prev => prev + points);
    }

    // Save result
    setResults(prev => [...prev, {
      question: currentQ.text,
      userAnswer: answerId,
      correctAnswer: correctAnswer?.id,
      isCorrect,
      points,
      timeLeft
    }]);

    setSelectedAnswer(answerId);
    setShowResult(true);
    setIsPlaying(false);
  };

  const nextQuestion = () => {
    if (!quiz || !quiz.questions) return;

    if (currentQuestion >= quiz.questions.length - 1) {
      setGameFinished(true);
      return;
    }

    setCurrentQuestion(prev => prev + 1);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(30);
    setIsPlaying(true);
  };

  const startGame = () => {
    setIsPlaying(true);
    setTimeLeft(30);
  };

  const restartGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(false);
    setGameFinished(false);
    setResults([]);
  };

  const playAudio = (text: string) => {
    // Placeholder for AI audio generation
    console.log("Playing AI audio for:", text);
    // Here you would integrate with TTS API
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка квиза...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Квиз не найден</p>
          <Button onClick={() => setLocation("/")}>
            <Home className="w-4 h-4 mr-2" />
            На главную
          </Button>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions?.[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  if (gameFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">Квиз завершен!</h1>
              <div className="text-6xl font-bold mb-2">{score}</div>
              <p className="text-xl">Итоговый счет</p>
            </div>

            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Результаты</h2>
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">Вопрос {index + 1}</p>
                        <p className="text-sm text-gray-600">{result.question}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={result.isCorrect ? "default" : "destructive"}>
                          {result.isCorrect ? "Правильно" : "Неверно"}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">+{result.points} очков</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center space-x-4">
              <Button onClick={restartGame} size="lg">
                <Play className="w-5 h-5 mr-2" />
                Повторить
              </Button>
              <Button variant="outline" onClick={() => setLocation("/")} size="lg">
                <Home className="w-5 h-5 mr-2" />
                На главную
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isPlaying && currentQuestion === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Button 
              variant="ghost" 
              className="mb-8 text-white hover:text-white hover:bg-white/10"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>

            <h1 className="text-4xl font-bold mb-4">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-xl mb-8 text-white/90">{quiz.description}</p>
            )}

            <div className="bg-white/10 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Информация о квизе</h2>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-white/70">Вопросов</p>
                  <p className="text-2xl font-bold">{quiz.questions.length}</p>
                </div>
                <div>
                  <p className="text-white/70">Время на вопрос</p>
                  <p className="text-2xl font-bold">30 сек</p>
                </div>
              </div>
            </div>

            <Button onClick={startGame} size="lg" className="bg-white text-purple-600 hover:bg-white/90">
              <Play className="w-5 h-5 mr-2" />
              Начать квиз
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="ghost" 
              className="text-white hover:text-white hover:bg-white/10"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Выйти
            </Button>
            <div className="text-center">
              <p className="text-lg">Вопрос {currentQuestion + 1} из {quiz.questions.length}</p>
              <Progress value={progress} className="w-48 mt-2" />
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{score} очков</p>
              <p className="text-sm text-white/70">Общий счет</p>
            </div>
          </div>

          {/* Question */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold">{timeLeft}</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-6">{currentQ?.text}</h1>
            
            <Button 
              variant="outline" 
              className="mb-6 text-white border-white hover:bg-white hover:text-purple-600"
              onClick={() => playAudio(currentQ?.text)}
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Озвучить вопрос
            </Button>

            {currentQ?.image && (
              <div className="mb-8">
                <img 
                  src={currentQ.image} 
                  alt="Question" 
                  className="max-w-md mx-auto rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>

          {/* Answers */}
          <div className="grid grid-cols-2 gap-6">
            {currentQ?.answers.map((answer: any, index: number) => {
              const color = answerColors[index % answerColors.length];
              const isSelected = selectedAnswer === answer.id;
              const isCorrect = showResult && answer.isCorrect;
              const isWrong = showResult && isSelected && !answer.isCorrect;

              return (
                <button
                  key={answer.id}
                  onClick={() => !showResult && handleAnswer(answer.id)}
                  disabled={showResult}
                  className={cn(
                    "p-6 rounded-xl text-left transition-all duration-300",
                    color.bg,
                    "hover:scale-105 active:scale-95",
                    isSelected && "ring-4 ring-white scale-105",
                    isCorrect && "ring-4 ring-green-400",
                    isWrong && "ring-4 ring-red-400",
                    showResult && "cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                      <span className="font-bold text-white">{color.label}</span>
                    </div>
                    <span className="text-lg font-medium text-white">{answer.text}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          {showResult && (
            <div className="text-center mt-8">
              <Button 
                onClick={nextQuestion}
                size="lg"
                className="bg-white text-purple-600 hover:bg-white/90"
              >
                {currentQuestion >= quiz.questions.length - 1 ? "Завершить квиз" : "Следующий вопрос"}
                <SkipForward className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}