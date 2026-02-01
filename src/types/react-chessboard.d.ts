declare module 'react-chessboard' {
  import * as React from 'react';

  export type Piece =
    | 'wP'
    | 'wN'
    | 'wB'
    | 'wR'
    | 'wQ'
    | 'wK'
    | 'bP'
    | 'bN'
    | 'bB'
    | 'bR'
    | 'bQ'
    | 'bK';

  export interface ChessboardProps {
    id?: string;
    position?: string;
    boardWidth?: number;
    arePiecesDraggable?: boolean;
    animationDuration?: number;
    onPieceDrop?: (sourceSquare: string, targetSquare: string, piece: Piece) => boolean;
    customBoardStyle?: React.CSSProperties;
    customDarkSquareStyle?: React.CSSProperties;
    customLightSquareStyle?: React.CSSProperties;
  }

  export const Chessboard: React.FC<ChessboardProps>;
}
