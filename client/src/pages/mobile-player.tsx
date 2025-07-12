import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarSelector, AvatarDisplay } from "@/components/avatar-selector";
import { useWebSocket } from "@/hooks/use-websocket";
import { X, Check, Clock, Users, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobilePlayer() {
  const { gameCode } = useParams<{ gameCode: string }>();
  const [, setLocation] = useLocation();
  const { gameState, isConnected, joinGame, submitAnswer, resetGame } = useWebSocket();
  
  const [setupComplete, setSetupComplete] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("user");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    if (!gameCode) {
      setLocation('/');
      return;
    }

    // Reset game state when component mounts
    resetGame();
  }, [gameCode, setLocation, resetGame]);

  useEffect(() => {
    // Reset answer state when new question starts
    if (gameState.currentQuestionData) {
      setHasAnswered(false);
      setSelectedAnswer(null);
    }
  }, [gameState.currentQuestionData]);

  const handleJoinGame = () => {
    if (!playerName.trim()) {
      alert('Введите ваше имя');
      return;
    }

    const player = {
      id: Date.now().toString(),
      name: playerName.trim(),
      avatar: selectedAvatar,
      score: 0,
      isHost: false,
      hasAnswered: false,
    };

    joinGame(gameCode!, player);
    setSetupComplete(true);
  };

  const handleSelectAnswer = (answer: string) => {
    if (hasAnswered) return;
    
    setSelectedAnswer(answer);
    setHasAnswered(true);
    submitAnswer(answer);
  };

  const handleLeaveGame = () => {
    setLocation('/');
  };

  if (!gameCode || !isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Подключение к игре...</p>
        </div>
      </div>
    );
  }

  // Setup screen
  if (!setupComplete) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Добро пожаловать!</CardTitle>
            <p className="text-center text-gray-600">Настройте свой профиль для игры</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Выберите аватар
              </label>
              <AvatarSelector
                selected={selectedAvatar}
                onSelect={setSelectedAvatar}
              />
            </div>
            
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ваше имя
              </label>
              <Input
                placeholder="Введите ваше имя"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
              />
            </div>
            
            {/* Join Button */}
            <Button onClick={handleJoinGame} className="w-full">
              Присоединиться к игре
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = gameState.currentQuestionData;
  const isWaiting = gameState.status === 'waiting';
  const isInProgress = gameState.status === 'in_progress';
  const isFinished = gameState.status === 'finished';

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Mobile Header */}
      <div className="bg-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AvatarDisplay avatar={selectedAvatar} />
          <div>
            <p className="font-semibold text-gray-900">{playerName}</p>
            <p className="text-sm text-gray-600">
              Очки: {gameState.player?.score || 0}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLeaveGame}>
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-white p-6">
          <div className="text-center w-full">
            {isWaiting && (
              <>
                <h2 className="text-2xl font-bold mb-4">Ожидание начала игры</h2>
                <div className="mb-6">
                  <Hash className="w-12 h-12 mx-auto mb-2 text-white/80" />
                  <p className="text-lg">Код игры: <span className="font-bold">{gameCode}</span></p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-white/90 mb-2">Игроки в лобби: {gameState.players.length}</p>
                  <p className="text-white/80 text-sm">Ожидание хоста...</p>
                </div>
              </>
            )}

            {isInProgress && currentQuestion && (
              <>
                <h2 className="text-2xl font-bold mb-8">{currentQuestion.text}</h2>
                
                {/* Timer */}
                <div className="w-20 h-20 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-8">
                  <span className="text-2xl font-bold">{gameState.timeLeft}</span>
                </div>
                
                {/* Mobile Answer Options */}
                <div className="space-y-4 w-full max-w-sm mx-auto">
                  {currentQuestion.answers.map((answer: any, index: number) => {
                    const colors = ['answer-red', 'answer-blue', 'answer-green', 'answer-yellow'];
                    const labels = ['A', 'B', 'C', 'D'];
                    const isSelected = selectedAnswer === answer.id;
                    
                    return (
                      <button
                        key={answer.id}
                        onClick={() => handleSelectAnswer(answer.id)}
                        disabled={hasAnswered}
                        className={cn(
                          "w-full rounded-xl p-4 text-center transition-all relative",
                          colors[index % colors.length],
                          hasAnswered && isSelected && "ring-4 ring-white",
                          hasAnswered && !isSelected && "opacity-50"
                        )}
                      >
                        <div className="text-xl font-bold mb-1">{labels[index]}</div>
                        <div className="text-lg">{answer.text}</div>
                        {hasAnswered && isSelected && (
                          <Check className="w-6 h-6 absolute top-2 right-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {hasAnswered && (
                  <div className="mt-6 bg-green-500/20 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center justify-center">
                      <Check className="w-5 h-5 mr-2" />
                      <span>Ответ отправлен!</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {isFinished && (
              <>
                <h2 className="text-3xl font-bold mb-8">Игра завершена!</h2>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                  <p className="text-xl mb-4">Ваш результат:</p>
                  <p className="text-3xl font-bold mb-4">{gameState.player?.score || 0} очков</p>
                  {gameState.lastResults?.finalScores && (
                    <div className="text-sm">
                      <p className="mb-2">Топ-3:</p>
                      {gameState.lastResults.finalScores.slice(0, 3).map((player: any, index: number) => (
                        <div key={player.id} className="mb-1">
                          {index + 1}. {player.name} - {player.score}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleLeaveGame}
                  className="bg-white text-primary hover:bg-gray-100 mt-6"
                >
                  Выйти из игры
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="bg-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <p className="text-xs text-gray-600">Вопрос</p>
            <p className="text-sm font-semibold">
              {gameState.currentQuestion}/{gameState.totalQuestions}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600">Игроки</p>
            <p className="text-sm font-semibold">{gameState.players.length}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={cn(
            "w-3 h-3 rounded-full",
            hasAnswered ? "bg-green-500 animate-pulse" : "bg-gray-300"
          )} />
          <span className="text-sm text-gray-600">
            {hasAnswered ? "Ответил" : "Ожидание"}
          </span>
        </div>
      </div>
    </div>
  );
}
