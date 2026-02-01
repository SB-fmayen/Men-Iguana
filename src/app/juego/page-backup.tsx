'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { MenuHeader } from '@/components/organisms/menu-header';
import { Footer } from '@/components/organisms/footer';
import { PageTransition } from '@/components/atoms/page-transition';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useToast } from '@/hooks/use-toast';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const PROMOTION_PIECES = [
  { key: 'q', label: 'Dama' },
  { key: 'r', label: 'Torre' },
  { key: 'b', label: 'Alfil' },
  { key: 'n', label: 'Caballo' },
];

type PendingPromotion = {
  from: string;
  to: string;
};

export default function JuegoPageBackup() {
  const { auth, firestore, user, isUserLoading } = useFirebase();
  const { toast } = useToast();
  const [fen, setFen] = useState(INITIAL_FEN);
  const [gameStatus, setGameStatus] = useState('Tu turno');
  const [result, setResult] = useState<'white' | 'black' | 'draw' | null>(null);
  const [points, setPoints] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);
  const gameRef = useRef(new Chess());

  const pieceValues = useMemo(
    () => ({ p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }),
    []
  );

  const evaluateBoard = useCallback(
    (game: Chess) => {
      let score = 0;
      const board = game.board();
      for (const row of board) {
        for (const piece of row) {
          if (!piece) continue;
          const value = pieceValues[piece.type as keyof typeof pieceValues] ?? 0;
          score += piece.color === 'w' ? value : -value;
        }
      }
      return score;
    },
    [pieceValues]
  );

  const updateStatusFromGame = useCallback((game: Chess) => {
    if (game.isGameOver()) {
      if (game.isCheckmate()) {
        const winner = game.turn() === 'w' ? 'black' : 'white';
        setResult(winner);
        setGameStatus(winner === 'white' ? '¡Ganaste!' : 'La máquina ganó');
        setPoints(winner === 'white' ? 100 : 0);
      } else {
        setResult('draw');
        setGameStatus('Empate');
        setPoints(50);
      }
      return;
    }

    const turn = game.turn() === 'w' ? 'Tu turno' : 'Turno de la máquina';
    const check = game.isCheck() ? ' (Jaque)' : '';
    setGameStatus(`${turn}${check}`);
  }, []);

  const isPromotionMove = useCallback((from: string, to: string) => {
    const game = gameRef.current;
    const piece = game.get(from as Square);
    if (!piece || piece.type !== 'p') return false;
    const targetRank = to[1];
    return (piece.color === 'w' && targetRank === '8') || (piece.color === 'b' && targetRank === '1');
  }, []);

  const pickBestAiMove = useCallback(
    (game: Chess) => {
      const moves = game.moves();
      if (moves.length === 0) return null;
      const aiColor = game.turn();
      let bestMove = moves[0];
      let bestScore = aiColor === 'w' ? -Infinity : Infinity;

      for (const move of moves) {
        const clone = new Chess(game.fen());
        clone.move(move);
        let score = evaluateBoard(clone);
        if (clone.isCheckmate()) {
          score = aiColor === 'w' ? 9999 : -9999;
        }

        if (aiColor === 'w') {
          if (score > bestScore) {
            bestScore = score;
            bestMove = move;
          }
        } else {
          if (score < bestScore) {
            bestScore = score;
            bestMove = move;
          }
        }
      }

      return bestMove;
    },
    [evaluateBoard]
  );

  const applyMove = useCallback((move: string | { from: string; to: string; promotion?: string }) => {
    const game = gameRef.current;
    const resultMove = game.move(move as any, { sloppy: true });

    if (!resultMove) {
      toast({
        title: 'Movimiento inválido',
        description: typeof move === 'string' ? move : `${move.from}-${move.to}`,
      });
      return false;
    }

    setFen(game.fen());
    setMoveHistory(game.history());
    updateStatusFromGame(game);
    return true;
  }, [toast, updateStatusFromGame]);

  const handleAiMove = useCallback(() => {
    const game = gameRef.current;
    if (game.isGameOver()) return;

    setIsAiThinking(true);
    setTimeout(() => {
      const aiGame = new Chess(game.fen());
      const aiMove = pickBestAiMove(aiGame);

      if (aiMove) {
        game.move(aiMove);
        setFen(game.fen());
        setMoveHistory(game.history());
        updateStatusFromGame(game);
      }

      setIsAiThinking(false);
    }, 400);
  }, [pickBestAiMove, updateStatusFromGame]);

  const handleMove = (move: string) => {
    if (!gameStarted) {
      toast({ title: 'Inicia el juego primero' });
      return;
    }

    if (isAiThinking || result) {
      return;
    }

    if (/^[a-h][1-8][a-h][1-8]$/.test(move) && isPromotionMove(move.slice(0, 2), move.slice(2, 4))) {
      setPendingPromotion({ from: move.slice(0, 2), to: move.slice(2, 4) });
      return;
    }

    try {
      const didMove = applyMove(move);
      if (!didMove) return;
      if (!gameRef.current.isGameOver()) {
        handleAiMove();
      }

    } catch (error) {
      toast({ title: 'Error', description: String(error) });
    }
  };

  const handleResetGame = () => {
    gameRef.current = new Chess();
    setFen(INITIAL_FEN);
    setResult(null);
    setPoints(0);
    setIsAiThinking(false);
    setMoveHistory([]);
    setGameStatus('Tu turno');
    setGameStarted(true);
    setPendingPromotion(null);
  };

  const handleUndo = () => {
    if (!gameStarted || isAiThinking) return;
    const game = gameRef.current;
    if (game.history().length === 0) return;
    game.undo();
    if (game.history().length > 0) {
      game.undo();
    }
    setFen(game.fen());
    setMoveHistory(game.history());
    setResult(null);
    setPoints(0);
    updateStatusFromGame(game);
  };

  const handlePieceDrop = (from: string, to: string) => {
    if (!gameStarted) {
      toast({ title: 'Inicia el juego primero' });
      return false;
    }
    if (isAiThinking || result) return false;

    if (isPromotionMove(from, to)) {
      setPendingPromotion({ from, to });
      return true;
    }

    const didMove = applyMove({ from, to });
    if (didMove && !gameRef.current.isGameOver()) {
      handleAiMove();
    }
    return didMove;
  };

  const handleSelectPromotion = (piece: string) => {
    if (!pendingPromotion) return;
    const didMove = applyMove({
      from: pendingPromotion.from,
      to: pendingPromotion.to,
      promotion: piece,
    });
    setPendingPromotion(null);
    if (didMove && !gameRef.current.isGameOver()) {
      handleAiMove();
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      if (user?.email) {
        await setDoc(doc(firestore, 'chessPlayers', user.uid), {
          email: user.email,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
    } catch (error) {
      alert('Error al iniciar sesión');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      alert('Error al cerrar sesión');
    }
  };

  return (
    <PageTransition>
      <div className="bg-background min-h-screen">
        <MenuHeader />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
              Ajedrez - Versión de Prueba
            </h1>

            <div className="mb-8 text-center">
              {isUserLoading ? (
                <p>Cargando...</p>
              ) : user ? (
                <div>
                  <p className="mb-2">Sesión activa: {user.email}</p>
                  <Button onClick={handleLogout}>Cerrar sesión</Button>
                </div>
              ) : (
                <Button onClick={handleGoogleLogin}>Iniciar sesión</Button>
              )}
            </div>

            <div className="border rounded p-6">
              <h2 className="text-2xl font-bold mb-4">{gameStatus}</h2>
              <p className="mb-2"><strong>FEN:</strong> {fen}</p>
              <p className="mb-4"><strong>Puntos:</strong> {points}</p>

              <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_260px] mb-6">
                <div className="rounded-lg border bg-white p-3">
                  <Chessboard
                    position={fen}
                    onPieceDrop={handlePieceDrop}
                    arePiecesDraggable={gameStarted && !isAiThinking && !result}
                    customBoardStyle={{ borderRadius: '12px' }}
                  />
                  {pendingPromotion && (
                    <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
                      <p className="font-semibold mb-2">Elige la promoción</p>
                      <div className="flex gap-2 flex-wrap">
                        {PROMOTION_PIECES.map((option) => (
                          <Button
                            key={option.key}
                            onClick={() => handleSelectPromotion(option.key)}
                            variant="outline"
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border bg-white p-4">
                  <p className="text-sm font-semibold mb-3">Historial</p>
                  {moveHistory.length === 0 ? (
                    <p className="text-sm text-gray-600">Sin movimientos aún.</p>
                  ) : (
                    <ol className="space-y-1 max-h-80 overflow-auto text-sm">
                      {moveHistory.map((move, index) => (
                        <li key={`${move}-${index}`} className="flex gap-2">
                          <span className="w-6 text-gray-500">{index + 1}.</span>
                          <span className="font-medium text-gray-900">{move}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                  <div className="mt-4 flex flex-col gap-2">
                    <Button onClick={handleUndo} variant="outline" disabled={!gameStarted || isAiThinking}>
                      Deshacer
                    </Button>
                    <Button onClick={handleResetGame} variant="secondary">
                      Reiniciar partida
                    </Button>
                  </div>
                </div>
              </div>

              {!gameStarted ? (
                <Button onClick={handleResetGame} className="w-full">
                  Iniciar Juego
                </Button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Ej: e2e4 o e4"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value;
                        handleMove(value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className="w-full border p-2 rounded"
                  />
                  <p className="text-sm text-gray-600">
                    Escribe un movimiento (ej: e2e4) y presiona Enter
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button onClick={handleResetGame} className="w-full" variant="outline">
                      Nueva Partida
                    </Button>
                    {isAiThinking && (
                      <p className="text-sm text-orange-600">La máquina está pensando...</p>
                    )}
                  </div>

                  {result && (
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded mt-4">
                      <p className="font-bold">
                        {result === 'white'
                          ? '¡Ganaste! 100 pts'
                          : result === 'draw'
                            ? 'Empate: 50 pts'
                            : 'Perdiste'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
}
