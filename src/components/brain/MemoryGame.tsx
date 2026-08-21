import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CardType {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryGame = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const { toast } = useToast();

  const emojis = ['🧠', '❤️', '🎯', '⭐', '🎨', '🎵', '🔥', '💡'];

  const initializeGame = () => {
    const shuffledCards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setGameStarted(true);
  };

  const handleCardClick = (id: number) => {
    if (isChecking || flippedCards.length === 2 || cards[id].isMatched || cards[id].isFlipped) {
      return;
    }

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);
    setFlippedCards([...flippedCards, id]);
  };

  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsChecking(true);
      setMoves(moves + 1);

      const [first, second] = flippedCards;
      if (cards[first].value === cards[second].value) {
        const newCards = [...cards];
        newCards[first].isMatched = true;
        newCards[second].isMatched = true;
        setCards(newCards);
        setFlippedCards([]);
        setIsChecking(false);

        if (newCards.every(card => card.isMatched)) {
          toast({
            title: "🎉 Congratulations!",
            description: `You completed the game in ${moves + 1} moves!`,
          });
          saveScore(moves + 1);
        }
      } else {
        setTimeout(() => {
          const newCards = [...cards];
          newCards[first].isFlipped = false;
          newCards[second].isFlipped = false;
          setCards(newCards);
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  }, [flippedCards]);

  const saveScore = (finalMoves: number) => {
    const scores = JSON.parse(localStorage.getItem('brainBoostScores') || '{}');
    if (!scores.memory) scores.memory = [];
    scores.memory.push({ moves: finalMoves, date: new Date().toISOString() });
    localStorage.setItem('brainBoostScores', JSON.stringify(scores));
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Memory Match
          </div>
          {gameStarted && <span className="text-sm text-muted-foreground">Moves: {moves}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!gameStarted ? (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Match all pairs of cards to win!</p>
            <Button onClick={initializeGame} className="w-full">
              Start Game
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-3">
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={card.isMatched || card.isFlipped}
                  className={`aspect-square rounded-lg text-3xl flex items-center justify-center transition-all duration-300 ${
                    card.isFlipped || card.isMatched
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  } ${card.isMatched ? 'opacity-50' : ''}`}
                >
                  {card.isFlipped || card.isMatched ? card.value : '?'}
                </button>
              ))}
            </div>
            <Button onClick={initializeGame} variant="outline" className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Game
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};