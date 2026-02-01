'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MenuHeader } from '@/components/organisms/menu-header';
import { Footer } from '@/components/organisms/footer';
import { PageTransition } from '@/components/atoms/page-transition';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const PROMOTION_PIECES = [
  { key: 'q', label: 'Dama' },
  { key: 'r', label: 'Torre' },
  { key: 'b', label: 'Alfil' },
  { key: 'n', label: 'Caballo' },
];

const PIECE_UNICODE: { [key: string]: string } = {
  'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔',
  'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚',
};

type PendingPromotion = {
  from: string;
  to: string;
};

export default function JuegoPage() {
  const { auth, firestore, user, isUserLoading } = useFirebase();
  const [fen, setFen] = useState(INITIAL_FEN);
  const [gameStatus, setGameStatus] = useState('Tu turno');
  const [result, setResult] = useState<'white' | 'black' | 'draw' | null>(null);
  const [points, setPoints] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlayTimeout, setAutoPlayTimeout] = useState<NodeJS.Timeout | null>(null);
  const gameRef = useRef(new Chess());

  const provider = useMemo(() => new GoogleAuthProvider(), []);

  useEffect(() => {
    if (!user) {
      setSaveOk(false);
      setSaveError(null);
      setIsSaving(false);
      return;
    }

    const saveUserEmail = async () => {
      if (!user?.email) return;
      setIsSaving(true);
      setSaveError(null);
      try {
        await setDoc(
          doc(firestore, 'chessPlayers', user.uid),
          {
            email: user.email,
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
        setSaveOk(true);
      } catch (error) {
        setSaveError('No se pudo guardar el correo.');
      } finally {
        setIsSaving(false);
      }
    };

    if (user?.email) {
      saveUserEmail();
    }
  }, [user, firestore]);

  const getBoardArray = (fenStr: string) => {
    const board = Array(8).fill(null).map(() => Array(8).fill(''));
    const rows = fenStr.split(' ')[0].split('/');
    
    rows.forEach((row, rowIdx) => {
      let colIdx = 0;
      for (const char of row) {
        if (/\d/.test(char)) {
          colIdx += parseInt(char);
        } else {
          board[rowIdx][colIdx] = char;
          colIdx++;
        }
      }
    });
    return board;
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 3000);
  };

  const getSquareName = (row: number, col: number) => {
    return String.fromCharCode(97 + col) + (8 - row);
  };

  const makeAutoMove = (currentFen: string, isWhite: boolean) => {
    const autoGame = new Chess(currentFen);
    const moves = autoGame.moves();
    
    if (moves.length === 0) return null;
    
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    const result = autoGame.move(randomMove);
    
    return { fen: autoGame.fen(), isGameOver: autoGame.isGameOver(), move: result };
  };

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

  const isPromotionMove = useCallback((game: Chess, from: string, to: string) => {
    const piece = game.get(from as Square);
    if (!piece || piece.type !== 'p') return false;
    const targetRank = to[1];
    return (piece.color === 'w' && targetRank === '8') || (piece.color === 'b' && targetRank === '1');
  }, []);

  const evaluateBoard = useCallback((game: Chess) => {
    const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    let score = 0;
    const board = game.board();
    for (const row of board) {
      for (const piece of row) {
        if (!piece) continue;
        const value = values[piece.type] ?? 0;
        score += piece.color === 'w' ? value : -value;
      }
    }
    return score;
  }, []);

  const pickBestAiMove = useCallback((game: Chess) => {
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
  }, [evaluateBoard]);

  const applyMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
    const game = gameRef.current;
    const resultMove = game.move(move);

    if (!resultMove) {
      showError('Movimiento no válido');
      return false;
    }

    setFen(game.fen());
    setMoveHistory(game.history());
    updateStatusFromGame(game);
    return true;
  }, [updateStatusFromGame]);

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

  const playAutoGame = (startingFen: string) => {
    let currentFen = startingFen;
    let isWhiteTurn = true;

    const autoLoop = () => {
      const moveResult = makeAutoMove(currentFen, isWhiteTurn);
      
      if (!moveResult) {
        setGameStatus('Juego automático terminado');
        setAutoPlay(false);
        return;
      }

      currentFen = moveResult.fen;
      setFen(currentFen);
      console.log('[AUTO]', moveResult.move?.san);

      if (moveResult.isGameOver) {
        const endGame = new Chess(currentFen);
        const winner = endGame.turn() === 'w' ? 'black' : 'white';
        setResult(winner);
        setGameStatus(winner === 'white' ? '¡Blancas ganan!' : '¡Negras ganan!');
        setAutoPlay(false);
        return;
      }

      isWhiteTurn = !isWhiteTurn;
      const status = isWhiteTurn ? 'Turno blancas' : 'Turno negras';
      setGameStatus(`${status} (Automático)`);

      const nextTimeout = setTimeout(autoLoop, 800);
      setAutoPlayTimeout(nextTimeout);
    };

    autoLoop();
  };

  const handleSquareClick = (row: number, col: number) => {
    if (!gameStarted || autoPlay) return;

    const game = gameRef.current;
    const square = getSquareName(row, col);

    if (selectedSquare === null) {
      // Seleccionar pieza
      if (game.turn() !== 'w') {
        return;
      }

      const piece = game.get(square as Square);
      if (!piece || piece.color !== 'w') {
        return;
      }

      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setValidMoves(moves.map((m: any) => m.to));
    } else {
      // Mover pieza
      try {
        if (isPromotionMove(game, selectedSquare, square)) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }

        const didMove = applyMove({ from: selectedSquare, to: square, promotion: 'q' });
        setSelectedSquare(null);
        setValidMoves([]);
        if (!didMove) return;

        if (!gameRef.current.isGameOver()) {
          handleAiMove();
        }
      } catch (error) {
        showError('Error al procesar el movimiento');
        setSelectedSquare(null);
        setValidMoves([]);
      }
    }
  };

  const handleResetGame = () => {
    if (autoPlayTimeout) clearTimeout(autoPlayTimeout);
    gameRef.current = new Chess();
    setFen(INITIAL_FEN);
    setResult(null);
    setPoints(0);
    setMoveHistory([]);
    setGameStatus('Tu turno');
    setGameStarted(true);
    setSelectedSquare(null);
    setValidMoves([]);
    setAutoPlay(false);
    setPendingPromotion(null);
    setIsAiThinking(false);
  };

  const handleStartAutoPlay = () => {
    if (autoPlayTimeout) clearTimeout(autoPlayTimeout);
    const newFen = INITIAL_FEN;
    setFen(newFen);
    setResult(null);
    setPoints(0);
    setGameStarted(true);
    setSelectedSquare(null);
    setValidMoves([]);
    setAutoPlay(true);
    setGameStatus('Blancas vs Negras (Automático)');
    setMoveHistory([]);
    setPendingPromotion(null);
    setIsAiThinking(false);
    playAutoGame(newFen);
  };

  const handleUndo = () => {
    if (!gameStarted || autoPlay || isAiThinking) return;
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

  const handleSelectPromotion = (piece: string) => {
    if (!pendingPromotion) return;
    const didMove = applyMove({
      from: pendingPromotion.from,
      to: pendingPromotion.to,
      promotion: piece,
    });
    setPendingPromotion(null);
    setSelectedSquare(null);
    setValidMoves([]);
    if (didMove && !gameRef.current.isGameOver()) {
      handleAiMove();
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      setSaveError('No se pudo iniciar sesión con Google.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSaveOk(false);
    } catch (error) {
      setSaveError('No se pudo cerrar sesión.');
    }
  };

  const board = getBoardArray(fen);

  const captured = useMemo(() => {
    const history = gameRef.current.history({ verbose: true }) as Array<{
      captured?: string;
      color: 'w' | 'b';
    }>;

    const capturedByWhite: string[] = [];
    const capturedByBlack: string[] = [];

    for (const move of history) {
      if (!move.captured) continue;
      if (move.color === 'w') {
        capturedByWhite.push(move.captured);
      } else {
        capturedByBlack.push(move.captured);
      }
    }

    return { capturedByWhite, capturedByBlack };
  }, [fen]);

  return (
    <PageTransition>
      <div className="bg-background min-h-screen">
        <MenuHeader />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto px-1 sm:px-0">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">
              Juego de Ajedrez
            </h1>
            <p className="text-sm sm:text-lg text-gray-600 mb-6 sm:mb-8 text-center">
              Inicia sesión con Google para registrar tu correo y poder reclamar
              el vale al llegar a 100 pts.
            </p>

            <div className="mb-8 text-center">
              {isUserLoading ? (
                <p className="text-gray-600">Cargando sesión...</p>
              ) : user ? (
                <div className="space-y-3">
                  <p className="text-gray-800 font-semibold">
                    Sesión activa: {user.email}
                  </p>
                  {isSaving && (
                    <p className="text-gray-500 text-sm">Guardando correo...</p>
                  )}
                  {saveOk && !isSaving && (
                    <p className="text-green-600 text-sm">Correo registrado.</p>
                  )}
                  {saveError && (
                    <p className="text-red-600 text-sm">{saveError}</p>
                  )}
                  <Button
                    variant="outline"
                    className="font-bold"
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </Button>
                </div>
              ) : (
                <Button
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
                  onClick={handleGoogleLogin}
                >
                  Continuar con Google
                </Button>
              )}
            </div>

            <div className="rounded-2xl border-2 border-black shadow-[6px_6px_0_#000] bg-white p-2 sm:p-3 md:p-6 w-full overflow-hidden">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{gameStatus}</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-3">{gameStatus}</p>
              <div className="mb-4 text-xs sm:text-sm font-bold text-gray-700">Puntos: {points}</div>

              {errorMessage && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded text-red-700 font-semibold">
                  {errorMessage}
                </div>
              )}

              {!gameStarted ? (
                <div className="text-center py-8 sm:py-12 space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">¿Listo para jugar?</h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-6">Elige cómo deseas jugar</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm sm:text-base px-4 sm:px-8 py-4 sm:py-6"
                      onClick={handleResetGame}
                    >
                      Jugar contra IA
                    </Button>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base px-4 sm:px-8 py-4 sm:py-6"
                      onClick={handleStartAutoPlay}
                    >
                      Ver juego automático
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-[1fr_auto] mb-4">
                    <div className="rounded-lg border bg-white p-2 sm:p-3 order-2 sm:order-1">
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-2">Capturas</p>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-lg sm:text-xl">
                        <span className="text-xs font-semibold text-gray-500">B:</span>
                        {captured.capturedByWhite.length === 0 ? (
                          <span className="text-xs text-gray-500">—</span>
                        ) : (
                          captured.capturedByWhite.map((piece, index) => (
                            <span key={`w-${piece}-${index}`} className="text-lg sm:text-xl">{PIECE_UNICODE[piece]}</span>
                          ))
                        )}
                        <span className="text-xs font-semibold text-gray-500 ml-2">N:</span>
                        {captured.capturedByBlack.length === 0 ? (
                          <span className="text-xs text-gray-500">—</span>
                        ) : (
                          captured.capturedByBlack.map((piece, index) => (
                            <span key={`b-${piece}-${index}`} className="text-lg sm:text-xl">{PIECE_UNICODE[piece]}</span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="rounded-lg border bg-white p-2 sm:p-4 h-fit order-1 sm:order-2">
                      <div className="flex sm:flex-col gap-2">
                        <Button onClick={handleUndo} variant="outline" disabled={!gameStarted || autoPlay || isAiThinking} className="flex-1 sm:flex-none text-xs sm:text-sm py-1 sm:py-2">
                          Deshacer
                        </Button>
                        <Button onClick={() => {
                          if (autoPlayTimeout) clearTimeout(autoPlayTimeout);
                          gameRef.current = new Chess();
                          setFen(INITIAL_FEN);
                          setResult(null);
                          setPoints(0);
                          setMoveHistory([]);
                          setGameStatus('Tu turno');
                          setGameStarted(false);
                          setSelectedSquare(null);
                          setValidMoves([]);
                          setAutoPlay(false);
                          setPendingPromotion(null);
                          setIsAiThinking(false);
                        }} variant="outline" className="font-bold flex-1 sm:flex-none text-xs sm:text-sm py-1 sm:py-2">
                          Atrás
                        </Button>
                      </div>
                      {isAiThinking && (
                        <p className="text-xs text-orange-600 mt-2 sm:mt-2">Pensando...</p>
                      )}
                    </div>
                  </div>

                  {/* TABLERO TÁCTIL */}
                  <div className={`inline-block border-2 border-gray-800 mb-4 rounded ${autoPlay ? 'opacity-75' : ''}`}>
                    {board.map((row, rowIdx) => (
                      <div key={rowIdx} className="flex">
                        {row.map((piece, colIdx) => {
                          const square = getSquareName(rowIdx, colIdx);
                          const isLight = (rowIdx + colIdx) % 2 === 0;
                          const isSelected = selectedSquare === square;
                          const isValidMove = validMoves.includes(square);

                          return (
                            <div
                              key={`${rowIdx}-${colIdx}`}
                              onClick={() => !autoPlay && handleSquareClick(rowIdx, colIdx)}
                              className={`relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold transition-all flex-shrink-0
                                ${isLight ? 'bg-amber-100' : 'bg-amber-700'}
                                ${isSelected ? 'ring-2 sm:ring-4 ring-yellow-400' : ''}
                                ${autoPlay ? 'cursor-not-allowed' : 'cursor-pointer'}
                              `}
                            >
                              {isValidMove && (
                                <span className="absolute h-3 w-3 rounded-full bg-green-500/80" />
                              )}
                              {piece ? PIECE_UNICODE[piece] : ''}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {pendingPromotion && (
                    <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
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

                  {!autoPlay && (
                    <p className="text-xs sm:text-sm text-gray-600 mt-2">
                      Toca pieza blanca → luego cuadro verde para mover.
                    </p>
                  )}

                  <div className="mt-6 space-y-4">
                    {result && (
                      <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded">
                        <p className="font-bold text-orange-700">
                          {result === 'white'
                            ? '¡Felicidades! Llegaste a 100 pts.'
                            : result === 'draw'
                              ? 'Empate: 50 pts.'
                              : 'Sigue intentando para llegar a 100 pts.'}
                        </p>
                        {result === 'white' && user && (
                          <p className="text-sm text-orange-700 mt-2">
                            Muestra tu correo ({user.email}) en el restaurante para reclamar el vale de Shuko.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="rounded-2xl border-2 border-dashed border-gray-300 p-3 sm:p-6 text-left mt-6 sm:mt-8">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">Cómo funciona el juego</h2>
              <ul className="list-disc pl-5 text-xs sm:text-base text-gray-600 space-y-1 sm:space-y-2">
                <li><strong>Inicia sesión</strong> con tu cuenta de Google</li>
                <li><strong>Haz clic en "Iniciar juego"</strong> para empezar</li>
                <li><strong>Haz clic en una pieza blanca</strong> para seleccionar (aparece anillo amarillo)</li>
                <li><strong>Haz clic en un cuadro verde</strong> para mover la pieza</li>
                <li><strong>La máquina responde automáticamente</strong> después de tu turno</li>
                <li><strong>Gana la partida</strong> para obtener 100 pts (empate = 50 pts)</li>
                <li><strong>Reclama tu premio:</strong> Al llegar a 100 pts, muestra tu correo registrado en el restaurante para recibir tu vale de Shuko gratis</li>
              </ul>
              <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                Solo guardamos tu correo para verificar el premio. ¡Buena suerte!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-6 sm:mt-10">
              <Link href="/">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-base">
                  Volver al inicio
                </Button>
              </Link>
              <Link href="/menu">
                <Button variant="outline" className="font-bold text-xs sm:text-base">
                  Ver menú
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
}
