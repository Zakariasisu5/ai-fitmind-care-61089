import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calculator, RotateCcw, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const MathChallenge = () => {
  const [question, setQuestion] = useState({ num1: 0, num2: 0, operator: '+' });
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const { toast } = useToast();

  const generateQuestion = () => {
    const operators = ['+', '-', '×'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let num1, num2;

    if (difficulty === 'easy') {
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
    } else if (difficulty === 'medium') {
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 50) + 1;
    } else {
      num1 = Math.floor(Math.random() * 100) + 1;
      num2 = Math.floor(Math.random() * 100) + 1;
    }

    setQuestion({ num1, num2, operator });
  };

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setTimeLeft(60);
    setAnswer('');
    generateQuestion();
  };

  const checkAnswer = () => {
    const { num1, num2, operator } = question;
    let correctAnswer = 0;

    if (operator === '+') correctAnswer = num1 + num2;
    else if (operator === '-') correctAnswer = num1 - num2;
    else if (operator === '×') correctAnswer = num1 * num2;

    if (parseInt(answer) === correctAnswer) {
      setScore(score + 1);
      toast({
        title: "✅ Correct!",
        description: `Great job! Score: ${score + 1}`,
      });
      setAnswer('');
      generateQuestion();
    } else {
      toast({
        title: "❌ Incorrect",
        description: `The correct answer was ${correctAnswer}`,
        variant: "destructive",
      });
      setAnswer('');
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (gameActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setGameActive(false);
      toast({
        title: "⏰ Time's Up!",
        description: `Final Score: ${score}`,
      });
      saveScore(score);
    }
    return () => clearInterval(interval);
  }, [gameActive, timeLeft]);

  const saveScore = (finalScore: number) => {
    const scores = JSON.parse(localStorage.getItem('brainBoostScores') || '{}');
    if (!scores.math) scores.math = [];
    scores.math.push({ score: finalScore, difficulty, date: new Date().toISOString() });
    localStorage.setItem('brainBoostScores', JSON.stringify(scores));
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Math Challenge
          </div>
          {gameActive && (
            <div className="flex gap-3 text-sm">
              <span className="text-muted-foreground">⏱️ {timeLeft}s</span>
              <span className="text-primary">Score: {score}</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!gameActive ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Difficulty:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <Button
                    key={level}
                    variant={difficulty === level ? 'default' : 'outline'}
                    onClick={() => setDifficulty(level)}
                    className="capitalize"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
            <Button onClick={startGame} className="w-full">
              Start Challenge
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center p-6 bg-muted rounded-lg">
              <div className="text-4xl font-bold">
                {question.num1} {question.operator} {question.num2} = ?
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && answer && checkAnswer()}
                placeholder="Your answer"
                className="text-lg text-center"
              />
              <Button onClick={checkAnswer} disabled={!answer}>
                Submit
              </Button>
            </div>
            <Button onClick={() => setGameActive(false)} variant="outline" className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              End Game
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};