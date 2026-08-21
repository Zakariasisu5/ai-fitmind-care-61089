import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const PatternGame = () => {
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [isShowing, setIsShowing] = useState(false);
  const [level, setLevel] = useState(1);
  const [gameActive, setGameActive] = useState(false);
  const [highlightedButton, setHighlightedButton] = useState<number | null>(null);
  const { toast } = useToast();

  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
  ];

  const startGame = () => {
    setGameActive(true);
    setLevel(1);
    setPattern([]);
    setUserPattern([]);
    nextRound([]);
  };

  const nextRound = (currentPattern: number[]) => {
    const newPattern = [...currentPattern, Math.floor(Math.random() * 4)];
    setPattern(newPattern);
    setUserPattern([]);
    showPattern(newPattern);
  };

  const showPattern = async (patternToShow: number[]) => {
    setIsShowing(true);
    
    for (const index of patternToShow) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setHighlightedButton(index);
      await new Promise(resolve => setTimeout(resolve, 500));
      setHighlightedButton(null);
    }
    
    setIsShowing(false);
  };

  const handleButtonClick = (index: number) => {
    if (isShowing) return;

    const newUserPattern = [...userPattern, index];
    setUserPattern(newUserPattern);
    setHighlightedButton(index);
    setTimeout(() => setHighlightedButton(null), 200);

    if (newUserPattern[newUserPattern.length - 1] !== pattern[newUserPattern.length - 1]) {
      toast({
        title: "❌ Wrong Pattern!",
        description: `You reached level ${level}`,
        variant: "destructive",
      });
      saveScore(level);
      setGameActive(false);
      return;
    }

    if (newUserPattern.length === pattern.length) {
      toast({
        title: "✅ Correct!",
        description: `Moving to level ${level + 1}`,
      });
      setLevel(level + 1);
      setTimeout(() => nextRound(pattern), 1000);
    }
  };

  const saveScore = (finalLevel: number) => {
    const scores = JSON.parse(localStorage.getItem('brainBoostScores') || '{}');
    if (!scores.pattern) scores.pattern = [];
    scores.pattern.push({ level: finalLevel, date: new Date().toISOString() });
    localStorage.setItem('brainBoostScores', JSON.stringify(scores));
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Pattern Memory
          </div>
          {gameActive && <span className="text-sm text-primary">Level: {level}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!gameActive ? (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Watch the pattern and repeat it back!
            </p>
            <Button onClick={startGame} className="w-full">
              Start Game
            </Button>
          </div>
        ) : (
          <>
            {isShowing && (
              <div className="text-center text-muted-foreground text-sm">
                Watch the pattern...
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {colors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => handleButtonClick(index)}
                  disabled={isShowing}
                  className={`aspect-square rounded-lg transition-all duration-200 ${color} ${
                    highlightedButton === index ? 'opacity-100 scale-105' : 'opacity-60'
                  } ${isShowing ? 'cursor-not-allowed' : 'hover:opacity-100 hover:scale-105'}`}
                />
              ))}
            </div>
            <Button onClick={() => setGameActive(false)} variant="outline" className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              End Game
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};