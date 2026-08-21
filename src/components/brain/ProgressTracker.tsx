import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, Calendar } from 'lucide-react';

interface GameScores {
  memory?: Array<{ moves: number; date: string }>;
  math?: Array<{ score: number; difficulty: string; date: string }>;
  pattern?: Array<{ level: number; date: string }>;
}

export const ProgressTracker = () => {
  const [scores, setScores] = useState<GameScores>({});
  const [stats, setStats] = useState({
    totalGames: 0,
    bestMemory: 0,
    bestMath: 0,
    bestPattern: 0,
  });

  useEffect(() => {
    const loadScores = () => {
      const savedScores = JSON.parse(localStorage.getItem('brainBoostScores') || '{}');
      setScores(savedScores);

      const totalGames = 
        (savedScores.memory?.length || 0) + 
        (savedScores.math?.length || 0) + 
        (savedScores.pattern?.length || 0);

      const bestMemory = savedScores.memory?.length 
        ? Math.min(...savedScores.memory.map((s: any) => s.moves)) 
        : 0;

      const bestMath = savedScores.math?.length 
        ? Math.max(...savedScores.math.map((s: any) => s.score)) 
        : 0;

      const bestPattern = savedScores.pattern?.length 
        ? Math.max(...savedScores.pattern.map((s: any) => s.level)) 
        : 0;

      setStats({ totalGames, bestMemory, bestMath, bestPattern });
    };

    loadScores();
    const interval = setInterval(loadScores, 2000);
    return () => clearInterval(interval);
  }, []);

  const getRecentGames = () => {
    const allGames: Array<{ type: string; date: string; result: string }> = [];

    scores.memory?.forEach(game => {
      allGames.push({
        type: 'Memory',
        date: game.date,
        result: `${game.moves} moves`,
      });
    });

    scores.math?.forEach(game => {
      allGames.push({
        type: 'Math',
        date: game.date,
        result: `Score: ${game.score} (${game.difficulty})`,
      });
    });

    scores.pattern?.forEach(game => {
      allGames.push({
        type: 'Pattern',
        date: game.date,
        result: `Level ${game.level}`,
      });
    });

    return allGames
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalGames}</div>
            <div className="text-sm text-muted-foreground">Total Games</div>
          </div>
          <div className="bg-muted p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary">{stats.bestMath}</div>
            <div className="text-sm text-muted-foreground">Best Math Score</div>
          </div>
          <div className="bg-muted p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary">{stats.bestMemory || '-'}</div>
            <div className="text-sm text-muted-foreground">Best Memory</div>
          </div>
          <div className="bg-muted p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary">{stats.bestPattern}</div>
            <div className="text-sm text-muted-foreground">Best Pattern</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="w-4 h-4" />
            Recent Games
          </div>
          {getRecentGames().length > 0 ? (
            <div className="space-y-2">
              {getRecentGames().map((game, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center p-3 bg-muted rounded-lg"
                >
                  <div>
                    <div className="font-medium text-sm">{game.type}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(game.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm text-primary font-medium">
                    {game.result}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No games played yet. Start playing to track your progress!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};