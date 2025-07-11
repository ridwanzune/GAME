
export enum GameStatus {
  Menu,
  NameInput,
  Playing,
  Paused,
  Victory,
  GameOver,
  Credits,
  HighScores,
}

export enum Direction {
  Up,
  Down,
  Left,
  Right,
  None,
}

export interface Position {
  x: number;
  y: number;
}

export interface PlayerState extends Position {
  direction: Direction;
  speedBoost: number; // ticks remaining
}

export interface BotState extends Position {
  id: number;
  path: Position[];
  stunned: number; // ticks remaining
  luredTo?: Position;
  moveCounter: number;
}

export enum PowerUpType {
  Distraction,
  Speed,
  Trap,
  WallBreaker,
}

export interface PowerUp extends Position {
  id: number;
  type: PowerUpType;
}

export interface Trap extends Position {
  id: number;
  ticksRemaining: number;
}

export interface Cell {
  x: number;
  y: number;
  walls: {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
  };
  visited: boolean;
}

export interface HighScore {
  name: string;
  score: number;
}