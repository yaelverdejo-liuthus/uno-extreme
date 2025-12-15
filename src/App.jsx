import React, { useState, useEffect, useRef } from 'react';
import { Play, Users, Skull, RefreshCw, Trophy, Zap, Flame, ShieldAlert, AlertTriangle } from 'lucide-react';

// --- CONFIGURACIÓN Y UTILIDADES ---

const COLORS = ['red', 'blue', 'green', 'yellow'];
const SPECIAL_COLOR = 'black';

// Tipos de cartas
const TYPES = {
  NUMBER: 'number',
  SKIP: 'skip',     // Salto
  REVERSE: 'reverse', // Reverso
  DRAW2: 'draw2',   // +2
  WILD: 'wild',     // Comodín Color
  WILD4: 'wild4',   // Comodín +4
  // Modo Imposible
  DRAW6: 'draw6',   // +6
  WILD10: 'wild10', // Comodín +10
  MINUS4: 'minus4'  // Elimina 4 cartas propias
};

// Generador de ID Único Robustecido
// Usamos un contador global y timestamp para evitar colisiones de Math.random()
let globalIdCounter = 0;
const getUniqueId = () => {
  globalIdCounter++;
  return `card-${Date.now()}-${globalIdCounter}-${Math.random().toString(36).substr(2, 9)}`;
};

// Generador de Baraja
const generateDeck = (mode) => {
  let deck = [];
  const isImpossible = mode === 'IMPOSSIBLE';

  // Cartas numéricas y de acción básicas
  COLORS.forEach(color => {
    // 0 una vez
    deck.push({ id: getUniqueId(), color, value: 0, type: TYPES.NUMBER, points: 0 });
    // 1-9 dos veces
    for (let i = 1; i <= 9; i++) {
      deck.push({ id: getUniqueId(), color, value: i, type: TYPES.NUMBER, points: i });
      deck.push({ id: getUniqueId(), color, value: i, type: TYPES.NUMBER, points: i });
    }
    // Acciones (2 de cada una)
    for (let i = 0; i < 2; i++) {
      deck.push({ id: getUniqueId(), color, value: '🚫', type: TYPES.SKIP, points: 20 });
      deck.push({ id: getUniqueId(), color, value: '⇄', type: TYPES.REVERSE, points: 20 });
      
      if (isImpossible) {
        deck.push({ id: getUniqueId(), color, value: '+6', type: TYPES.DRAW6, points: 50 }); // Reemplaza +2
      } else {
        deck.push({ id: getUniqueId(), color, value: '+2', type: TYPES.DRAW2, points: 20 });
      }
    }
  });

  // Comodines (4 de cada uno)
  for (let i = 0; i < 4; i++) {
    deck.push({ id: getUniqueId(), color: SPECIAL_COLOR, value: '🌈', type: TYPES.WILD, points: 50 });
    
    if (isImpossible) {
      deck.push({ id: getUniqueId(), color: SPECIAL_COLOR, value: '+10', type: TYPES.WILD10, points: 100 }); // Reemplaza +4
      // Carta especial -4 (Exclusiva Imposible: Elimina 4 cartas de tu mano)
      deck.push({ id: getUniqueId(), color: SPECIAL_COLOR, value: '-4', type: TYPES.MINUS4, points: 50 });
    } else {
      deck.push({ id: getUniqueId(), color: SPECIAL_COLOR, value: '+4', type: TYPES.WILD4, points: 50 });
    }
  }

  return deck.sort(() => Math.random() - 0.5);
};

// --- COMPONENTES VISUALES ---

const Card = ({ card, onClick, isPlayable, hidden, small = false }) => {
  if (hidden) {
    return (
      <div className={`
        relative rounded-xl border-2 border-white/20 shadow-xl 
        bg-gradient-to-br from-gray-800 to-black
        flex items-center justify-center select-none transition-all duration-300
        ${small ? 'w-10 h-14' : 'w-24 h-36 md:w-32 md:h-48'}
      `}>
        <div className="w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <span className="absolute font-bold text-white/30 text-2xl">UNO</span>
      </div>
    );
  }

  const getBaseColor = (c) => {
    switch(c) {
      case 'red': return 'from-red-500 to-red-700 shadow-red-500/50';
      case 'blue': return 'from-blue-500 to-blue-700 shadow-blue-500/50';
      case 'green': return 'from-green-500 to-green-700 shadow-green-500/50';
      case 'yellow': return 'from-yellow-400 to-yellow-600 shadow-yellow-500/50';
      case 'black': return 'from-slate-800 to-black shadow-purple-500/50 border-purple-400/50';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const isAction = [TYPES.SKIP, TYPES.REVERSE, TYPES.DRAW2, TYPES.DRAW6, TYPES.MINUS4, TYPES.WILD, TYPES.WILD4, TYPES.WILD10].includes(card.type);

  return (
    <div 
      onClick={isPlayable ? onClick : undefined}
      className={`
        relative rounded-xl border-4 border-white select-none transition-all duration-200
        bg-gradient-to-br ${getBaseColor(card.color)}
        flex items-center justify-center shadow-lg
        ${small ? 'w-12 h-16 text-xl' : 'w-20 h-32 md:w-28 md:h-44 hover:-translate-y-4 hover:scale-110 cursor-pointer'}
        ${isPlayable ? 'ring-4 ring-white/50 animate-pulse' : 'opacity-100'}
        ${card.type === TYPES.MINUS4 ? 'animate-bounce border-red-500' : ''}
      `}
    >
      {/* Círculo central */}
      <div className={`
        absolute w-[85%] h-[60%] bg-white rounded-[50%] rotate-[-45deg] 
        flex items-center justify-center shadow-inner
      `}>
        <span className={`
          font-black text-4xl md:text-6xl drop-shadow-md
          ${card.color === 'red' ? 'text-red-600' : 
            card.color === 'blue' ? 'text-blue-600' : 
            card.color === 'green' ? 'text-green-600' : 
            card.color === 'yellow' ? 'text-yellow-500' : 'text-black'}
        `}>
          {isAction && card.type === TYPES.SKIP ? <Skull size={32} /> : 
           isAction && card.type === TYPES.REVERSE ? <RefreshCw size={32} /> : 
           isAction && card.type === TYPES.MINUS4 ? <Zap size={32} className="text-red-600" /> :
           card.value}
        </span>
      </div>
      
      {/* Iconos pequeños en esquinas */}
      <span className="absolute top-2 left-2 text-white font-bold text-sm md:text-lg">{card.value}</span>
      <span className="absolute bottom-2 right-2 text-white font-bold text-sm md:text-lg rotate-180">{card.value}</span>
    </div>
  );
};

// --- LOGICA PRINCIPAL (APP) ---

export default function App() {
  // Estados del juego
  const [mode, setMode] = useState(null); // '2P', '3P', 'IMPOSSIBLE'
  const [gameState, setGameState] = useState('MENU'); // 'MENU', 'PLAYING', 'GAME_OVER'
  const [deck, setDeck] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [players, setPlayers] = useState([]); // [{id, name, hand, isBot}]
  const [turnIndex, setTurnIndex] = useState(0);
  const [turnCount, setTurnCount] = useState(0); // Contador global de turnos para forzar updates
  const [direction, setDirection] = useState(1); // 1 horario, -1 antihorario
  const [currentColor, setCurrentColor] = useState('');
  const [winner, setWinner] = useState(null);
  const [unoCalled, setUnoCalled] = useState(false); // Para el jugador humano
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingCard, setPendingCard] = useState(null); // Carta wild que espera selección de color
  const [message, setMessage] = useState("¡Bienvenido!");
  const [animationClass, setAnimationClass] = useState("");

  // Inicializar Juego
  const startGame = (selectedMode) => {
    const newDeck = generateDeck(selectedMode);
    
    // Crear jugadores
    // Usamos JSON.parse/stringify para asegurar copias profundas iniciales y evitar referencias cruzadas
    const p1 = { id: 0, name: 'Tú', hand: [], isBot: false };
    const p2 = { id: 1, name: selectedMode === 'IMPOSSIBLE' ? 'Terminator' : 'Bot 1', hand: [], isBot: true };
    let newPlayers = [p1, p2];

    if (selectedMode === '3P' || selectedMode === 'IMPOSSIBLE') {
      newPlayers.push({ id: 2, name: selectedMode === 'IMPOSSIBLE' ? 'Destroyer' : 'Bot 2', hand: [], isBot: true });
    }

    // Repartir 7 cartas
    newPlayers.forEach(p => {
      p.hand = newDeck.splice(0, 7);
    });

    // Carta inicial (no puede ser comodín +4/+10 o -4 al inicio para simplificar)
    let initialCard = newDeck.shift();
    while ([TYPES.WILD4, TYPES.WILD10, TYPES.MINUS4].includes(initialCard.type)) {
      newDeck.push(initialCard);
      initialCard = newDeck.shift();
    }

    setDeck(newDeck);
    setDiscardPile([initialCard]);
    setCurrentColor(initialCard.color === 'black' ? 'red' : initialCard.color); // Si sale wild normal, rojo por defecto
    setPlayers(newPlayers);
    setTurnIndex(0);
    setTurnCount(0);
    setDirection(1);
    setMode(selectedMode);
    setWinner(null);
    setUnoCalled(false);
    setMessage(`¡Comienza el juego! Modo: ${selectedMode}`);
    setGameState('PLAYING');
  };

  // Efecto: Turno de la IA
  // Depende de turnCount para asegurar que el bot juegue incluso si el índice de turno no cambia (ej: +2 en 1v1)
  useEffect(() => {
    if (gameState === 'PLAYING' && players[turnIndex]?.isBot && !winner && !showColorPicker) {
      const timer = setTimeout(() => {
        botPlay();
      }, mode === 'IMPOSSIBLE' ? 1000 : 1500); // En modo imposible son más rápidos
      return () => clearTimeout(timer);
    }
  }, [turnCount, gameState, winner, showColorPicker, players, turnIndex, discardPile]);

  // Funciones Auxiliares
  const getNextPlayerIndex = (skip = false) => {
    let next = turnIndex + (direction * (skip ? 2 : 1));
    if (next >= players.length) next %= players.length;
    if (next < 0) next += players.length;
    // Manejo extra para modulo negativo en JS
    return (next + players.length) % players.length;
  };

  const drawCards = (playerIdx, count) => {
    const player = players[playerIdx];
    let drawPile = [...deck];
    let discarded = [...discardPile];
    
    // Si no hay cartas, barajar descarte
    if (drawPile.length < count) {
      // Guardar la carta superior para que se quede en descarte
      const topCard = discarded.pop();
      // El resto se baraja
      const newDeck = discarded.sort(() => Math.random() - 0.5);
      drawPile = [...drawPile, ...newDeck];
      // Restaurar pila de descarte solo con la topCard
      discarded = [topCard];
      setDiscardPile(discarded);
    }

    const drawn = [];
    for(let i=0; i<count; i++) {
      if(drawPile.length > 0) drawn.push(drawPile.shift());
    }

    setDeck(drawPile);
    
    // Actualizar mano del jugador de forma inmutable
    setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        newPlayers[playerIdx] = {
            ...newPlayers[playerIdx],
            hand: [...newPlayers[playerIdx].hand, ...drawn]
        };
        return newPlayers;
    });
    
    return drawn;
  };

  // Lógica del Bot
  const botPlay = () => {
    const bot = players[turnIndex];
    const topCard = discardPile[discardPile.length - 1];
    
    // 1. Filtrar jugables
    const playable = bot.hand.filter(c => 
      c.color === currentColor || 
      c.color === 'black' || 
      (c.value === topCard.value && c.color !== 'black') // Match number/symbol
    );

    // Lógica Imposible vs Normal
    let chosenCard = null;
    let chosenColor = 'red';

    if (mode === 'IMPOSSIBLE') {
      // Priorizar ataques fuertes: +10, +6, Skip
      const attacks = playable.filter(c => [TYPES.WILD10, TYPES.DRAW6, TYPES.SKIP, TYPES.MINUS4].includes(c.type));
      if (attacks.length > 0) {
        chosenCard = attacks[0];
      } else if (playable.length > 0) {
        // Jugar la que tenga más copias del mismo color para vaciar mano
        chosenCard = playable[0]; 
      }
      
      // Elegir color inteligentemente (el que más tenga el bot)
      const counts = { red:0, blue:0, green:0, yellow:0 };
      bot.hand.forEach(c => { if(c.color !== 'black') counts[c.color]++; });
      chosenColor = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

    } else {
      // Lógica normal
      chosenCard = playable.length > 0 ? playable[0] : null;
      chosenColor = ['red', 'blue', 'green', 'yellow'][Math.floor(Math.random() * 4)];
    }

    // Manejo de UNO para bots
    if (bot.hand.length === 2 && chosenCard) {
      // Probabilidad de olvidar decir UNO en normal (10%), Imposible nunca olvida
      const forgets = mode !== 'IMPOSSIBLE' && Math.random() < 0.1;
      if (!forgets) {
        setMessage(`${bot.name} grita: ¡UNO!`);
      } else {
        // Si olvida, penalidad inmediata (simulada)
        setTimeout(() => {
            setMessage(`${bot.name} olvidó decir UNO. +3 Cartas.`);
            drawCards(turnIndex, 3);
        }, 500);
      }
    }

    if (chosenCard) {
      handleMove(bot.id, chosenCard, chosenColor);
    } else {
      // Robar
      setMessage(`${bot.name} roba una carta.`);
      const drawn = drawCards(turnIndex, 1);
      
      // Intentar jugar la robada si es posible (Regla house rule común)
      const card = drawn[0];
      if (card && (card.color === currentColor || card.color === 'black' || card.value === topCard.value)) {
        setTimeout(() => handleMove(bot.id, card, chosenColor), 1000); // Pausa dramática
      } else {
        setTurnIndex(getNextPlayerIndex());
        setTurnCount(c => c + 1); // Importante: Actualizar contador
      }
    }
  };

  // Movimiento Humano
  const handleHumanPlay = (card) => {
    if (gameState !== 'PLAYING' || players[turnIndex].isBot) return;

    // Validación
    const topCard = discardPile[discardPile.length - 1];
    const isMatch = card.color === currentColor || card.color === 'black' || card.value === topCard.value;

    if (!isMatch) {
      setMessage("¡No puedes jugar esa carta!");
      setAnimationClass("animate-shake");
      setTimeout(() => setAnimationClass(""), 500);
      return;
    }

    // Verificar UNO
    if (players[0].hand.length === 2 && !unoCalled) {
        setMessage("¡No dijiste UNO! Penalización +3 cartas.");
        drawCards(0, 3);
        // Sigue jugando la carta, pero con penalidad aplicada antes
    }

    if (card.color === 'black') {
      setPendingCard(card);
      setShowColorPicker(true);
    } else {
      handleMove(0, card);
    }
  };

  const handleColorPick = (color) => {
    setShowColorPicker(false);
    handleMove(0, pendingCard, color);
    setPendingCard(null);
  };

  const handleHumanDraw = () => {
    if (players[turnIndex].isBot) return;
    drawCards(0, 1);
    setUnoCalled(false); // Resetear estado UNO al robar
    
    // Si la carta robada es jugable, el usuario puede jugarla haciendo click. 
    // UX simplificada: Pasa turno automáticamente tras breve pausa
    setMessage("Robaste carta. Turno siguiente.");
    setTimeout(() => {
        setTurnIndex(getNextPlayerIndex());
        setTurnCount(c => c + 1);
    }, 800);
  };

  // Lógica Central de Movimiento (Aplica efectos)
  const handleMove = (playerId, card, chosenWildColor = null) => {
    // Clona los jugadores de forma segura para evitar mutaciones directas
    let nextPlayers = players.map(p => ({...p, hand: [...p.hand]}));
    let currentPlayer = nextPlayers[playerId];
    
    // Quitar carta de mano
    const cardIndex = currentPlayer.hand.findIndex(c => c.id === card.id);
    if (cardIndex !== -1) {
        currentPlayer.hand.splice(cardIndex, 1);
    }
    
    // Efecto especial: -4 (Modo Imposible)
    if (card.type === TYPES.MINUS4) {
      // Elimina 4 cartas al azar (que no sean especiales importantes para no romper lógica, o cualquiera)
      // Regla: Elimina 4 cartas numéricas o de acción simple al azar.
      const safeToRemove = currentPlayer.hand.filter(c => c.type !== TYPES.MINUS4 && c.type !== TYPES.WILD10);
      for(let i=0; i<4 && safeToRemove.length > 0; i++) {
        const idx = Math.floor(Math.random() * safeToRemove.length);
        const removed = safeToRemove.splice(idx, 1)[0];
        // Encontrar en mano real y borrar
        const handIdx = currentPlayer.hand.findIndex(h => h.id === removed.id);
        if(handIdx > -1) currentPlayer.hand.splice(handIdx, 1);
      }
      setMessage(`${currentPlayer.name} usó PURGA -4. ¡Su mano se reduce!`);
    }

    setPlayers(nextPlayers);
    setDiscardPile(prev => [...prev, card]);

    // Verificar Victoria
    if (currentPlayer.hand.length === 0) {
      setWinner(playerId);
      setGameState('GAME_OVER');
      return;
    }

    // Aplicar lógica de carta
    let nextIndex = turnIndex; // Temporal
    let skip = false;

    // Actualizar color (CORREGIDO: Solo actualiza si es Comodín)
    if (card.color === 'black') {
       if (chosenWildColor) {
         setCurrentColor(chosenWildColor);
       } else {
         // Fallback por si acaso
         setCurrentColor('red'); 
       }
    } else {
       // Si es carta normal, el color es el de la carta
       setCurrentColor(card.color);
    }

    // Efectos
    switch (card.type) {
      case TYPES.SKIP:
        skip = true;
        setMessage(`${currentPlayer.name} saltó el turno.`);
        break;
      case TYPES.REVERSE:
        if (players.length === 2) {
          skip = true; // En 2P, reverso actúa como salto
        } else {
          setDirection(d => d * -1);
        }
        setMessage("¡Cambio de sentido!");
        break;
      case TYPES.DRAW2:
        nextIndex = getNextPlayerIndex(); // Jugador víctima
        drawCards(nextIndex, 2);
        skip = true; // Pierde turno tras robar
        setMessage(`${players[nextIndex].name} come +2 y pierde turno.`);
        break;
      case TYPES.DRAW6: // IMPOSSIBLE
        nextIndex = getNextPlayerIndex();
        drawCards(nextIndex, 6);
        skip = true;
        setMessage(`¡${players[nextIndex].name} SUFRE +6 y pierde turno!`);
        break;
      case TYPES.WILD4:
        nextIndex = getNextPlayerIndex();
        drawCards(nextIndex, 4);
        skip = true;
        setMessage(`${players[nextIndex].name} come +4 y pierde turno.`);
        break;
      case TYPES.WILD10: // IMPOSSIBLE
        nextIndex = getNextPlayerIndex();
        drawCards(nextIndex, 10);
        skip = true;
        setMessage(`💀 ¡${players[nextIndex].name} DESTRUIDO CON +10! 💀`);
        break;
      case TYPES.MINUS4:
         // No afecta al siguiente jugador, solo al que la tiró
         break;
      default:
        break;
    }

    // Calcular siguiente turno real
    // Nota: getNextPlayerIndex depende del estado actual de turnIndex y direction,
    // pero si hubo REVERSE, direction cambió. Debemos recalcular con cuidado.
    
    let currentDir = direction;
    if (card.type === TYPES.REVERSE && players.length > 2) currentDir *= -1;
    
    let steps = skip ? 2 : 1;
    let nextPlayerId = (playerId + (currentDir * steps)) % players.length;
    if (nextPlayerId < 0) nextPlayerId += players.length;

    setTurnIndex(nextPlayerId);
    setTurnCount(c => c + 1); // Forzar actualización de efecto
    setUnoCalled(false); // Resetear flag UNO
  };

  // --- RENDERIZADO ---

  if (gameState === 'MENU') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-black opacity-80 z-0"></div>
        
        <div className="z-10 text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]">
            UNO <span className="text-white italic">EXTREME</span>
          </h1>
          
          <div className="grid gap-4 w-full max-w-md mx-auto">
            <button onClick={() => startGame('2P')} className="group relative px-8 py-4 bg-blue-600 rounded-2xl font-bold text-xl overflow-hidden hover:scale-105 transition-all shadow-lg hover:shadow-blue-500/50">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
              <div className="flex items-center justify-center gap-2"><Users /> 1 vs 1</div>
            </button>
            <button onClick={() => startGame('3P')} className="group relative px-8 py-4 bg-green-600 rounded-2xl font-bold text-xl overflow-hidden hover:scale-105 transition-all shadow-lg hover:shadow-green-500/50">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
              <div className="flex items-center justify-center gap-2"><Users className="ml-1" /><Users className="-ml-3" /> 3 Jugadores</div>
            </button>
            <button onClick={() => startGame('IMPOSSIBLE')} className="group relative px-8 py-4 bg-red-900 border-2 border-red-500 rounded-2xl font-black text-xl overflow-hidden hover:scale-105 transition-all shadow-lg hover:shadow-red-500/80 animate-pulse">
              <div className="absolute inset-0 bg-red-600/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
              <div className="flex items-center justify-center gap-2 text-red-100"><Flame /> MODO IMPOSIBLE <Skull /></div>
              <p className="text-xs text-red-300 mt-1 font-normal">+10 Cards, +6 Draws, IA Agresiva</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isPlayerTurn = turnIndex === 0;
  const topCard = discardPile[discardPile.length - 1];
  const themeGradient = mode === 'IMPOSSIBLE' 
    ? 'from-gray-900 via-red-900 to-black' 
    : 'from-blue-900 via-indigo-900 to-purple-900';

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-between p-2 md:p-4 overflow-hidden relative bg-gradient-to-br ${themeGradient} text-white transition-colors duration-1000`}>
      
      {/* Indicador de Color y Turno (Top Bar) */}
      <div className="w-full max-w-6xl flex justify-between items-center bg-black/30 p-2 rounded-xl backdrop-blur-sm border border-white/10 z-10">
        <button onClick={() => setGameState('MENU')} className="p-2 hover:bg-white/10 rounded-lg text-xs md:text-sm">⬅ Salir</button>
        <div className="flex items-center gap-4">
            <div className={`px-4 py-1 rounded-full text-sm font-bold shadow-lg transition-colors duration-300
              ${currentColor === 'red' ? 'bg-red-600' : 
                currentColor === 'blue' ? 'bg-blue-600' : 
                currentColor === 'green' ? 'bg-green-600' : 
                currentColor === 'yellow' ? 'bg-yellow-500' : 'bg-gray-500'}
            `}>
              Color: {currentColor.toUpperCase()}
            </div>
            <div className="text-xs md:text-sm text-gray-300">{message}</div>
        </div>
        <div className="text-xs md:text-sm">Ronda: {direction === 1 ? '↻' : '↺'}</div>
      </div>

      {/* Área de Bots (Top) */}
      <div className="flex justify-center gap-4 md:gap-12 w-full mt-4">
        {players.filter(p => p.isBot).map((bot, idx) => (
          <div key={bot.id} className={`flex flex-col items-center transition-opacity ${turnIndex === bot.id ? 'opacity-100 scale-110' : 'opacity-60 scale-90'}`}>
            <div className="relative">
              <div className="w-16 h-24 bg-gradient-to-t from-gray-800 to-gray-600 rounded-lg border-2 border-white/30 shadow-xl flex items-center justify-center">
                 <span className="text-2xl">🃏</span>
              </div>
              <div className="absolute -top-2 -right-2 bg-red-600 rounded-full w-8 h-8 flex items-center justify-center font-bold border-2 border-white">
                {bot.hand.length}
              </div>
              {turnIndex === bot.id && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce"><Zap size={20} fill="currentColor"/></div>}
            </div>
            <span className="mt-2 font-bold text-sm bg-black/50 px-2 rounded">{bot.name}</span>
          </div>
        ))}
      </div>

      {/* Mesa Central (Mazo y Descarte) */}
      <div className={`relative flex items-center justify-center gap-8 md:gap-16 my-4 md:my-8 ${animationClass}`}>
        {/* Mazo de Robo */}
        <div onClick={handleHumanDraw} className="relative group cursor-pointer hover:scale-105 transition-transform">
           <Card card={{color: 'black', type: 'back'}} hidden={true} />
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="bg-black/60 px-2 py-1 rounded text-xs font-bold">Robar</span>
           </div>
        </div>

        {/* Pila de Descarte */}
        <div className="relative">
           {discardPile.slice(-3).map((c, i) => (
             <div key={c.id} className="absolute top-0 left-0" style={{ transform: `rotate(${(i-1)*5}deg) translate(${i*2}px, ${i*2}px)` }}>
               {i < 2 && <Card card={c} />}
             </div>
           ))}
           <div className="relative z-10 transform rotate-2 transition-all duration-300">
             <Card card={topCard} />
           </div>
           
           {/* Efecto visual del sentido */}
           <div className={`absolute -inset-10 border-2 border-dashed border-white/20 rounded-full animate-spin-slow pointer-events-none ${direction === -1 ? 'animate-reverse-spin' : ''}`}></div>
        </div>
      </div>

      {/* Mano del Jugador (Bottom) */}
      <div className="w-full flex flex-col items-center z-20 pb-4">
        {/* Controles del Jugador */}
        <div className="flex gap-4 mb-4">
          <button 
            onClick={() => !unoCalled && players[0].hand.length <= 2 && setUnoCalled(true)}
            className={`
              px-6 py-2 rounded-full font-black text-xl transition-all shadow-lg
              ${unoCalled ? 'bg-green-500 scale-95' : 'bg-orange-500 hover:bg-orange-400 hover:scale-110 animate-pulse'}
            `}
          >
            {unoCalled ? '¡UNO GRITADO!' : '¡UNO!'}
          </button>
          
          {turnIndex === 0 && (
             <div className="text-yellow-300 font-bold animate-pulse flex items-center gap-2">
               <AlertTriangle size={20} /> TU TURNO
             </div>
          )}
        </div>

        {/* Cartas */}
        <div className="flex flex-wrap justify-center items-end gap-[-20px] px-2 max-w-full overflow-x-auto pb-4 no-scrollbar" style={{minHeight: '160px'}}>
           {players[0].hand.map((card, idx) => {
             // Validar si es jugable para highlight
             const isPlayable = isPlayerTurn && (card.color === currentColor || card.color === 'black' || card.value === topCard.value);
             return (
               <div key={card.id} style={{ marginLeft: idx === 0 ? 0 : '-30px', zIndex: idx, transform: isPlayable ? 'translateY(-10px)' : 'none' }} className="transition-transform hover:z-50 hover:-translate-y-8">
                  <Card card={card} isPlayable={isPlayable} onClick={() => handleHumanPlay(card)} />
               </div>
             );
           })}
        </div>
      </div>

      {/* MODAL: Selector de Color */}
      {showColorPicker && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-gray-800 p-8 rounded-2xl border border-white/20 text-center shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Elige un color</h2>
            <div className="grid grid-cols-2 gap-4">
              {['red', 'blue', 'green', 'yellow'].map(c => (
                <button 
                  key={c}
                  onClick={() => handleColorPick(c)}
                  className={`w-24 h-24 rounded-xl shadow-lg transform hover:scale-110 transition-transform bg-${c === 'red' ? 'red-600' : c === 'blue' ? 'blue-600' : c === 'green' ? 'green-600' : 'yellow-500'}`}
                ></button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Game Over */}
      {gameState === 'GAME_OVER' && (
        <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center animate-in zoom-in duration-500">
           {winner === 0 ? (
             <>
               <Trophy size={100} className="text-yellow-400 mb-4 animate-bounce" />
               <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500">¡GANASTE!</h1>
               <div className="confetti-piece"></div>
             </>
           ) : (
             <>
               <Skull size={100} className="text-gray-400 mb-4" />
               <h1 className="text-5xl font-bold text-red-500">PERDISTE</h1>
               <p className="text-xl text-gray-300 mt-2">Ganador: {players[winner].name}</p>
             </>
           )}
           <button onClick={() => setGameState('MENU')} className="mt-8 px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">
             Volver al Menú
           </button>
        </div>
      )}

      {/* Styles for animations */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes reverse-spin { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
        .animate-reverse-spin { animation: reverse-spin 10s linear infinite; }
      `}</style>
    </div>
  );
}