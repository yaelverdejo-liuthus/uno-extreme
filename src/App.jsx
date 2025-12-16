import React, { useState, useEffect, useRef } from 'react';
import { Play, Users, Skull, RefreshCw, Trophy, Zap, Flame, ShieldAlert, AlertTriangle, BookOpen, ArrowLeft } from 'lucide-react';

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
let globalIdCounter = 0;
const getUniqueId = () => {
  globalIdCounter++;
  return `card-${Date.now()}-${globalIdCounter}-${Math.random().toString(36).substr(2, 9)}`;
};

// Generador de Baraja
const generateDeck = (mode) => {
  let deck = [];
  const isImpossible = mode === 'IMPOSSIBLE';

  COLORS.forEach(color => {
    deck.push({ id: getUniqueId(), color, value: 0, type: TYPES.NUMBER, points: 0 });
    for (let i = 1; i <= 9; i++) {
      deck.push({ id: getUniqueId(), color, value: i, type: TYPES.NUMBER, points: i });
      deck.push({ id: getUniqueId(), color, value: i, type: TYPES.NUMBER, points: i });
    }
    for (let i = 0; i < 2; i++) {
      deck.push({ id: getUniqueId(), color, value: '🚫', type: TYPES.SKIP, points: 20 });
      deck.push({ id: getUniqueId(), color, value: '⇄', type: TYPES.REVERSE, points: 20 });
      
      if (isImpossible) {
        deck.push({ id: getUniqueId(), color, value: '+6', type: TYPES.DRAW6, points: 50 });
      } else {
        deck.push({ id: getUniqueId(), color, value: '+2', type: TYPES.DRAW2, points: 20 });
      }
    }
  });

  for (let i = 0; i < 4; i++) {
    deck.push({ id: getUniqueId(), color: SPECIAL_COLOR, value: '🌈', type: TYPES.WILD, points: 50 });
    if (isImpossible) {
      deck.push({ id: getUniqueId(), color: SPECIAL_COLOR, value: '+10', type: TYPES.WILD10, points: 100 });
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
      <span className="absolute top-2 left-2 text-white font-bold text-sm md:text-lg">{card.value}</span>
      <span className="absolute bottom-2 right-2 text-white font-bold text-sm md:text-lg rotate-180">{card.value}</span>
    </div>
  );
};

// --- LOGICA PRINCIPAL (APP) ---

export default function App() {
  const [mode, setMode] = useState(null); 
  const [gameState, setGameState] = useState('MENU'); // 'MENU', 'PLAYING', 'GAME_OVER', 'HOW_TO_PLAY'
  const [deck, setDeck] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [players, setPlayers] = useState([]); 
  const [turnIndex, setTurnIndex] = useState(0);
  const [turnCount, setTurnCount] = useState(0); 
  const [direction, setDirection] = useState(1); 
  const [currentColor, setCurrentColor] = useState('');
  const [winner, setWinner] = useState(null);
  const [unoCalled, setUnoCalled] = useState(false); 
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingCard, setPendingCard] = useState(null); 
  const [message, setMessage] = useState("¡Bienvenido!");
  const [animationClass, setAnimationClass] = useState("");

  const playAreaRef = useRef(null);

  // Función pura para ejecutar robos (sin side effects directos, devuelve nuevo estado)
  const performDraw = (currentDeck, currentDiscard, currentPlayers, playerIdx, count) => {
    let newDeck = [...currentDeck];
    let newDiscard = [...currentDiscard];
    let newPlayers = currentPlayers.map(p => ({...p, hand: [...p.hand]}));
    
    let drawn = [];
    
    for(let i=0; i<count; i++) {
        if (newDeck.length === 0) {
            if (newDiscard.length > 1) {
                const topCard = newDiscard.pop();
                newDeck = newDiscard.sort(() => Math.random() - 0.5);
                newDiscard = [topCard];
            } else {
                break; // No hay más cartas
            }
        }
        if(newDeck.length > 0) {
            drawn.push(newDeck.shift());
        }
    }

    newPlayers[playerIdx].hand.push(...drawn);
    
    return {
        newDeck,
        newDiscard,
        newPlayers,
        drawn
    };
  };

  const startGame = (selectedMode) => {
    const newDeck = generateDeck(selectedMode);
    const p1 = { id: 0, name: 'Tú', hand: [], isBot: false };
    const p2 = { id: 1, name: selectedMode === 'IMPOSSIBLE' ? 'Terminator' : 'Bot 1', hand: [], isBot: true };
    let newPlayers = [p1, p2];

    if (selectedMode === '3P' || selectedMode === 'IMPOSSIBLE') {
      newPlayers.push({ id: 2, name: selectedMode === 'IMPOSSIBLE' ? 'Destroyer' : 'Bot 2', hand: [], isBot: true });
    }

    newPlayers.forEach(p => {
      p.hand = newDeck.splice(0, 7);
    });

    let initialCard = newDeck.shift();
    while ([TYPES.WILD4, TYPES.WILD10, TYPES.MINUS4].includes(initialCard.type)) {
      newDeck.push(initialCard);
      initialCard = newDeck.shift();
    }

    setDeck(newDeck);
    setDiscardPile([initialCard]);
    setCurrentColor(initialCard.color === 'black' ? 'red' : initialCard.color); 
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

  // Turno de la IA
  useEffect(() => {
    if (gameState === 'PLAYING' && players[turnIndex]?.isBot && !winner && !showColorPicker) {
      const timer = setTimeout(() => {
        botPlay();
      }, mode === 'IMPOSSIBLE' ? 1000 : 1500); 
      return () => clearTimeout(timer);
    }
  }, [turnCount, gameState, winner, showColorPicker, players, turnIndex, discardPile]);

  // Wrapper para robos simples (Botón Robar / Penalizaciones simples)
  const drawCards = (playerIdx, count) => {
    const { newDeck, newDiscard, newPlayers } = performDraw(deck, discardPile, players, playerIdx, count);
    setDeck(newDeck);
    setDiscardPile(newDiscard);
    setPlayers(newPlayers);
    return newPlayers[playerIdx].hand.slice(-count); 
  };

  const getNextPlayerIndex = (skip = false) => {
    let next = turnIndex + (direction * (skip ? 2 : 1));
    if (next >= players.length) next %= players.length;
    if (next < 0) next += players.length;
    return (next + players.length) % players.length;
  };

  const botPlay = () => {
    const bot = players[turnIndex];
    const topCard = discardPile[discardPile.length - 1];
    
    const playable = bot.hand.filter(c => 
      c.color === currentColor || 
      c.color === 'black' || 
      (c.value === topCard.value && c.color !== 'black') 
    );

    let chosenCard = null;
    let chosenColor = 'red';

    if (mode === 'IMPOSSIBLE') {
      const attacks = playable.filter(c => [TYPES.WILD10, TYPES.DRAW6, TYPES.SKIP, TYPES.MINUS4].includes(c.type));
      if (attacks.length > 0) {
        chosenCard = attacks[0];
      } else if (playable.length > 0) {
        chosenCard = playable[0]; 
      }
      
      const counts = { red:0, blue:0, green:0, yellow:0 };
      bot.hand.forEach(c => { if(c.color !== 'black') counts[c.color]++; });
      chosenColor = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

    } else {
      chosenCard = playable.length > 0 ? playable[0] : null;
      chosenColor = ['red', 'blue', 'green', 'yellow'][Math.floor(Math.random() * 4)];
    }

    if (bot.hand.length === 2 && chosenCard) {
      const forgets = mode !== 'IMPOSSIBLE' && Math.random() < 0.1;
      if (!forgets) {
        setMessage(`${bot.name} grita: ¡UNO!`);
      } else {
        setTimeout(() => {
            setMessage(`${bot.name} olvidó decir UNO. +3 Cartas.`);
            drawCards(turnIndex, 3);
        }, 500);
      }
    }

    if (chosenCard) {
      handleMove(bot.id, chosenCard, chosenColor);
    } else {
      setMessage(`${bot.name} roba una carta.`);
      const drawn = drawCards(turnIndex, 1);
      
      const card = drawn[0];
      if (card && (card.color === currentColor || card.color === 'black' || card.value === topCard.value)) {
        setTimeout(() => handleMove(bot.id, card, chosenColor), 1000); 
      } else {
        setTurnIndex(getNextPlayerIndex());
        setTurnCount(c => c + 1); 
      }
    }
  };

  const handleHumanPlay = (card) => {
    if (gameState !== 'PLAYING' || players[turnIndex].isBot) return;

    const topCard = discardPile[discardPile.length - 1];
    const isMatch = card.color === currentColor || card.color === 'black' || card.value === topCard.value;

    if (!isMatch) {
      setMessage("¡No puedes jugar esa carta!");
      setAnimationClass("animate-shake");
      setTimeout(() => setAnimationClass(""), 500);
      return;
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
    setUnoCalled(false); 
    
    setMessage("Robaste carta. Turno siguiente.");
    setTimeout(() => {
        setTurnIndex(getNextPlayerIndex());
        setTurnCount(c => c + 1);
    }, 800);
  };

  // --- LÓGICA CENTRAL DE MOVIMIENTO ---
  const handleMove = (playerId, card, chosenWildColor = null) => {
    let tempDeck = [...deck];
    let tempDiscard = [...discardPile];
    let tempPlayers = players.map(p => ({...p, hand: [...p.hand]}));
    let currentPlayer = tempPlayers[playerId];

    // VERIFICACIÓN DE PENALIZACIÓN POR NO DECIR UNO
    if (playerId === 0 && currentPlayer.hand.length === 2 && !unoCalled) {
        setMessage("¡No dijiste UNO! Penalización +3 cartas.");
        const resPenalty = performDraw(tempDeck, tempDiscard, tempPlayers, playerId, 3);
        tempDeck = resPenalty.newDeck;
        tempDiscard = resPenalty.newDiscard;
        tempPlayers = resPenalty.newPlayers;
        currentPlayer = tempPlayers[playerId];
    }
    
    const cardIndex = currentPlayer.hand.findIndex(c => c.id === card.id);
    if (cardIndex !== -1) {
        currentPlayer.hand.splice(cardIndex, 1);
    }
    
    if (card.type === TYPES.MINUS4) {
      const safeToRemove = currentPlayer.hand.filter(c => c.type !== TYPES.MINUS4 && c.type !== TYPES.WILD10);
      for(let i=0; i<4 && safeToRemove.length > 0; i++) {
        const idx = Math.floor(Math.random() * safeToRemove.length);
        const removed = safeToRemove.splice(idx, 1)[0];
        const handIdx = currentPlayer.hand.findIndex(h => h.id === removed.id);
        if(handIdx > -1) currentPlayer.hand.splice(handIdx, 1);
      }
      setMessage(`${currentPlayer.name} usó PURGA -4. ¡Su mano se reduce!`);
    }

    tempDiscard.push(card);

    if (currentPlayer.hand.length === 0) {
      setWinner(playerId);
      setGameState('GAME_OVER');
      setDeck(tempDeck);
      setDiscardPile(tempDiscard);
      setPlayers(tempPlayers);
      return;
    }

    let nextIndex = turnIndex;
    let skip = false;

    if (card.color === 'black') {
       if (chosenWildColor) {
         setCurrentColor(chosenWildColor);
       } else {
         setCurrentColor('red'); 
       }
    } else {
       setCurrentColor(card.color);
    }

    let currentDir = direction;
    if (card.type === TYPES.REVERSE && players.length > 2) currentDir *= -1;
    
    const getVictimIndex = (skipping) => {
        let steps = skipping ? 1 : 1; 
        let next = playerId + (currentDir * steps);
        if (next >= tempPlayers.length) next %= tempPlayers.length;
        if (next < 0) next += tempPlayers.length;
        return (next + tempPlayers.length) % tempPlayers.length;
    };

    switch (card.type) {
      case TYPES.SKIP:
        skip = true;
        setMessage(`${currentPlayer.name} saltó el turno.`);
        break;
      case TYPES.REVERSE:
        if (players.length === 2) {
          skip = true; 
        } else {
          setDirection(d => d * -1);
        }
        setMessage("¡Cambio de sentido!");
        break;
      case TYPES.DRAW2:
        nextIndex = getVictimIndex(false);
        const resDraw2 = performDraw(tempDeck, tempDiscard, tempPlayers, nextIndex, 2);
        tempDeck = resDraw2.newDeck;
        tempDiscard = resDraw2.newDiscard;
        tempPlayers = resDraw2.newPlayers;
        skip = true; 
        setMessage(`${tempPlayers[nextIndex].name} come +2 y pierde turno.`);
        break;
      case TYPES.DRAW6: 
        nextIndex = getVictimIndex(false);
        const resDraw6 = performDraw(tempDeck, tempDiscard, tempPlayers, nextIndex, 6);
        tempDeck = resDraw6.newDeck;
        tempDiscard = resDraw6.newDiscard;
        tempPlayers = resDraw6.newPlayers;
        skip = true;
        setMessage(`¡${tempPlayers[nextIndex].name} SUFRE +6 y pierde turno!`);
        break;
      case TYPES.WILD4:
        nextIndex = getVictimIndex(false);
        const resDraw4 = performDraw(tempDeck, tempDiscard, tempPlayers, nextIndex, 4);
        tempDeck = resDraw4.newDeck;
        tempDiscard = resDraw4.newDiscard;
        tempPlayers = resDraw4.newPlayers;
        skip = true;
        setMessage(`${tempPlayers[nextIndex].name} come +4 y pierde turno.`);
        break;
      case TYPES.WILD10: 
        nextIndex = getVictimIndex(false);
        const resDraw10 = performDraw(tempDeck, tempDiscard, tempPlayers, nextIndex, 10);
        tempDeck = resDraw10.newDeck;
        tempDiscard = resDraw10.newDiscard;
        tempPlayers = resDraw10.newPlayers;
        skip = true;
        setMessage(`💀 ¡${tempPlayers[nextIndex].name} DESTRUIDO CON +10! 💀`);
        break;
      case TYPES.MINUS4:
         break;
      default:
        break;
    }

    let steps = skip ? 2 : 1;
    let nextPlayerId = (playerId + (currentDir * steps)) % players.length;
    if (nextPlayerId < 0) nextPlayerId += players.length;

    setDeck(tempDeck);
    setDiscardPile(tempDiscard);
    setPlayers(tempPlayers);
    setTurnIndex(nextPlayerId);
    setTurnCount(c => c + 1);
    setUnoCalled(false);
  };

  // --- VISTAS ---

  if (gameState === 'HOW_TO_PLAY') {
      return (
          <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4 md:p-8 text-white overflow-auto relative">
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-black opacity-80 z-0 fixed"></div>
               <div className="z-10 w-full max-w-3xl">
                   <button 
                    onClick={() => setGameState('MENU')}
                    className="flex items-center gap-2 mb-6 text-gray-300 hover:text-white transition-colors"
                   >
                       <ArrowLeft /> Volver al Menú
                   </button>

                   <h1 className="text-4xl md:text-5xl font-black mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">
                       ¿Cómo jugar?
                   </h1>

                   <div className="space-y-8 bg-black/40 p-6 md:p-8 rounded-2xl border border-white/10 backdrop-blur-md">
                       
                       <section>
                           <h2 className="text-2xl font-bold text-yellow-400 mb-4 border-b border-yellow-400/30 pb-2">Mecánicas básicas</h2>
                           <ul className="space-y-3 text-gray-200">
                               <li>• Juega cartas que <strong>coincidan en color, número o símbolo</strong> con la carta superior del montón de descarte. Si no puedes jugar, <strong>roba del montón de robo</strong> hasta encontrar una que puedas usar.</li>
                               <li>• <strong>Objetivo:</strong> Sé el primero en descartar todas tus cartas.</li>
                               <li>• <strong>Turnos:</strong> Se juegan en orden (horario o anti-horario).</li>
                               <li>• <strong>¡UNO!:</strong> Cuando te quedan 2 cartas, presiona el botón UNO o recibirás penalidad (+3 cartas).</li>
                           </ul>
                       </section>

                       <section>
                           <h3 className="text-xl font-bold text-blue-400 mb-3">Cartas especiales:</h3>
                           <ul className="grid gap-3 text-sm md:text-base">
                               <li className="flex items-start gap-2"><span className="text-xl">⏭️</span> <span><strong>Saltar:</strong> Salta el turno del siguiente jugador.</span></li>
                               <li className="flex items-start gap-2"><span className="text-xl">↺</span> <span><strong>Reverso:</strong> Invierte el orden de los turnos.</span></li>
                               <li className="flex items-start gap-2"><span className="font-bold text-green-400">+2</span> <span>El siguiente jugador roba <strong>2 cartas</strong> y pierde su turno.</span></li>
                               <li className="flex items-start gap-2"><span className="text-xl">🃏</span> <span><strong>Comodín:</strong> Elige <strong>nuevo color</strong> para continuar.</span></li>
                               <li className="flex items-start gap-2"><span className="font-bold text-yellow-400">+4</span> <span>El siguiente roba <strong>4 cartas</strong>, pierde turno y tú eliges color.</span></li>
                           </ul>
                       </section>

                       <section>
                           <h2 className="text-2xl font-bold text-pink-500 mb-4 border-b border-pink-500/30 pb-2">Modos de juego</h2>
                           <div className="space-y-4">
                               <div>
                                   <h4 className="font-bold flex items-center gap-2"><Users size={18}/> Modo 2 jugadores</h4>
                                   <p className="text-gray-400 ml-6">Tú vs 1 IA. Reglas clásicas del UNO.</p>
                               </div>
                               <div>
                                   <h4 className="font-bold flex items-center gap-2"><Users size={18}/> Modo 3 jugadores</h4>
                                   <p className="text-gray-400 ml-6">Tú vs 2 IAs. Reglas clásicas del UNO.</p>
                               </div>
                               <div className="bg-red-900/30 p-4 rounded-xl border border-red-500/30">
                                   <h4 className="font-bold flex items-center gap-2 text-red-400"><Skull size={18}/> Modo Imposible (3 jugadores)</h4>
                                   <p className="text-gray-300 mb-2">Tú vs 2 IAs ultra-inteligentes. <strong>Reglas modificadas EXTREMAS:</strong></p>
                                   <ul className="space-y-2 text-sm ml-4">
                                       <li className="text-red-200"><strong>+10</strong> (reemplaza +4): Siguiente roba 10 cartas y pierde turno.</li>
                                       <li className="text-orange-200"><strong>+6</strong> (reemplaza +2): Siguiente roba 6 cartas y pierde turno.</li>
                                       <li className="text-purple-200"><strong>-4</strong> (nueva): Elimina 4 cartas al azar DE TU PROPIA MANO.</li>
                                   </ul>
                                   <p className="mt-2 text-xs italic text-red-400">¡Supervivencia pura! Las IAs juegan perfectamente y sin piedad.</p>
                               </div>
                           </div>
                       </section>

                       <section>
                           <h2 className="text-2xl font-bold text-green-400 mb-4 border-b border-green-400/30 pb-2">Controles rápidos</h2>
                           <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                               <li className="flex items-center gap-2 bg-white/5 p-2 rounded">🖱️ Haz clic en las cartas para jugar</li>
                               <li className="flex items-center gap-2 bg-white/5 p-2 rounded">📦 Botón "Robar" si no puedes jugar</li>
                               <li className="flex items-center gap-2 bg-white/5 p-2 rounded">🚨 Botón "UNO" con 1 carta restante</li>
                               <li className="flex items-center gap-2 bg-white/5 p-2 rounded">🎨 Elige color cuando juegues comodines</li>
                               <li className="flex items-center gap-2 bg-white/5 p-2 rounded">🚪 Botón "Salir" para cambiar modo</li>
                           </ul>
                       </section>
                   </div>
               </div>
          </div>
      )
  }

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
            
            <button onClick={() => setGameState('HOW_TO_PLAY')} className="mt-4 px-6 py-2 bg-slate-700/50 hover:bg-slate-600 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 mx-auto">
                <BookOpen size={16}/> ¿Cómo jugar?
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
      
      {/* Indicador de Color y Turno */}
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

      {/* Área de Bots */}
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

      {/* Mesa Central */}
      <div className={`relative flex items-center justify-center gap-8 md:gap-16 my-4 md:my-8 ${animationClass}`}>
        <div onClick={handleHumanDraw} className="relative group cursor-pointer hover:scale-105 transition-transform">
           <Card card={{color: 'black', type: 'back'}} hidden={true} />
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="bg-black/60 px-2 py-1 rounded text-xs font-bold">Robar</span>
           </div>
        </div>

        <div className="relative">
           {discardPile.slice(-3).map((c, i) => (
             <div key={c.id} className="absolute top-0 left-0" style={{ transform: `rotate(${(i-1)*5}deg) translate(${i*2}px, ${i*2}px)` }}>
               {i < 2 && <Card card={c} />}
             </div>
           ))}
           <div className="relative z-10 transform rotate-2 transition-all duration-300">
             <Card card={topCard} />
           </div>
           
           <div className={`absolute -inset-10 border-2 border-dashed border-white/20 rounded-full animate-spin-slow pointer-events-none ${direction === -1 ? 'animate-reverse-spin' : ''}`}></div>
        </div>
      </div>

      {/* Mano del Jugador */}
      <div className="w-full flex flex-col items-center z-20 pb-4">
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

        <div className="flex flex-wrap justify-center items-end gap-[-20px] px-2 max-w-full overflow-x-auto pb-4 no-scrollbar" style={{minHeight: '160px'}}>
           {players[0].hand.map((card, idx) => {
             const isPlayable = isPlayerTurn && (card.color === currentColor || card.color === 'black' || card.value === topCard.value);
             return (
               <div key={card.id} style={{ marginLeft: idx === 0 ? 0 : '-30px', zIndex: idx, transform: isPlayable ? 'translateY(-10px)' : 'none' }} className="transition-transform hover:z-50 hover:-translate-y-8">
                  <Card card={card} isPlayable={isPlayable} onClick={() => handleHumanPlay(card)} />
               </div>
             );
           })}
        </div>
      </div>

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