// Domain entities (see aidlc-docs/construction/backend-sync-api/functional-design/domain-entities.md)

export interface User {
  userId: string;
  email: string;
  passwordHash: string;
  createdAt: number;
}

export interface Session {
  sessionId: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}

export interface LoopPoints {
  a: number;
  b: number;
  enabled: boolean;
}

export interface Memo {
  text: string;
  updatedAt: number;
}

export interface SongRecord {
  userId: string;
  songKey: string;
  loopPoints: LoopPoints | null;
  memo: Memo | null;
  updatedAt: number;
}
