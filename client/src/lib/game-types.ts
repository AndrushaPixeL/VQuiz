export interface GameMessage {
  type: 'join_game' | 'start_game' | 'submit_answer' | 'next_question' | 'player_joined' | 'player_left' | 'player_answered' | 'game_started' | 'new_question' | 'question_ended' | 'game_finished' | 'timer_update' | 'joined_game' | 'error';
  [key: string]: any;
}

export interface GameState {
  gameCode: string | null;
  quiz: any;
  players: any[];
  currentQuestion: number;
  totalQuestions: number;
  timeLeft: number;
  status: 'waiting' | 'in_progress' | 'finished';
  player: any;
  isHost: boolean;
  currentQuestionData: any;
  lastResults: any;
}

export const initialGameState: GameState = {
  gameCode: null,
  quiz: null,
  players: [],
  currentQuestion: 0,
  totalQuestions: 0,
  timeLeft: 0,
  status: 'waiting',
  player: null,
  isHost: false,
  currentQuestionData: null,
  lastResults: null,
};
