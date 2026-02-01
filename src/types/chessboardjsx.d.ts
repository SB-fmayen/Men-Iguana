declare module 'chessboardjsx' {
  import * as React from 'react';

  export type ChessboardDrop = {
    sourceSquare: string;
    targetSquare: string;
    piece?: string;
  };

  export interface ChessboardProps {
    position?: string;
    width?: number;
    onDrop?: (data: ChessboardDrop) => void;
    draggable?: boolean;
    transitionDuration?: number;
    boardStyle?: React.CSSProperties;
    darkSquareStyle?: React.CSSProperties;
    lightSquareStyle?: React.CSSProperties;
  }

  const Chessboard: React.FC<ChessboardProps>;
  export default Chessboard;
}
