import { useEffect, useRef, useState } from 'react';
import { GameMessage, GameState, initialGameState } from '@/lib/game-types';

export function useWebSocket() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const message: GameMessage = JSON.parse(event.data);
      
      switch (message.type) {
        case 'joined_game':
          setGameState(prev => ({
            ...prev,
            gameCode: message.gameCode,
            player: message.player,
            quiz: message.quiz,
            isHost: message.player.isHost,
            status: 'waiting'
          }));
          break;

        case 'player_joined':
        case 'player_left':
        case 'player_answered':
          setGameState(prev => ({
            ...prev,
            players: message.players
          }));
          break;

        case 'game_started':
          setGameState(prev => ({
            ...prev,
            status: 'in_progress',
            currentQuestion: message.currentQuestion,
            totalQuestions: message.totalQuestions,
            currentQuestionData: message.question
          }));
          break;

        case 'new_question':
          setGameState(prev => ({
            ...prev,
            currentQuestion: message.currentQuestion,
            totalQuestions: message.totalQuestions,
            currentQuestionData: message.question,
            lastResults: null
          }));
          // Reset player answered state
          setGameState(prev => ({
            ...prev,
            players: prev.players.map(p => ({ ...p, hasAnswered: false }))
          }));
          break;

        case 'timer_update':
          setGameState(prev => ({
            ...prev,
            timeLeft: message.timeLeft
          }));
          break;

        case 'question_ended':
          setGameState(prev => ({
            ...prev,
            lastResults: {
              correctAnswer: message.correctAnswer,
              players: message.players
            }
          }));
          break;

        case 'game_finished':
          setGameState(prev => ({
            ...prev,
            status: 'finished',
            lastResults: {
              finalScores: message.players
            }
          }));
          break;

        case 'error':
          console.error('Game error:', message.message);
          break;
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const sendMessage = (message: GameMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const joinGame = (gameCode: string, player: any) => {
    sendMessage({
      type: 'join_game',
      gameCode,
      player
    });
  };

  const startGame = () => {
    sendMessage({
      type: 'start_game'
    });
  };

  const submitAnswer = (answer: string) => {
    sendMessage({
      type: 'submit_answer',
      answer
    });
  };

  const nextQuestion = () => {
    sendMessage({
      type: 'next_question'
    });
  };

  const resetGame = () => {
    setGameState(initialGameState);
  };

  return {
    gameState,
    isConnected,
    joinGame,
    startGame,
    submitAnswer,
    nextQuestion,
    resetGame
  };
}
