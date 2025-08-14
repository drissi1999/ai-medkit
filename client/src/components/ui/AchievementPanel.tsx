import { useGameState } from "../../lib/stores/useGameState";
import { useAchievements } from "../../lib/stores/useAchievements";
import { achievements, Achievement } from "../../lib/gameData/achievements";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { Progress } from "./progress";
import { Trophy, Star, BookOpen, Globe } from "lucide-react";

export default function AchievementPanel() {
  const { showAchievements, setShowAchievements } = useGameState();
  const { unlockedAchievements, getAchievementProgress } = useAchievements();

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'exploration': return Globe;
      case 'knowledge': return BookOpen;
      case 'mastery': return Star;
      default: return Trophy;
    }
  };

  const getAchievementColor = (type: string) => {
    switch (type) {
      case 'exploration': return 'text-green-400 border-green-400';
      case 'knowledge': return 'text-blue-400 border-blue-400';
      case 'mastery': return 'text-purple-400 border-purple-400';
      default: return 'text-yellow-400 border-yellow-400';
    }
  };

  return (
    <Dialog open={showAchievements} onOpenChange={setShowAchievements}>
      <DialogContent className="max-w-4xl bg-gray-900 text-white border-gray-700 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Achievements
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Achievement Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-400">
                  {unlockedAchievements.length}
                </div>
                <div className="text-sm text-gray-400">Unlocked</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-400">
                  {achievements.length}
                </div>
                <div className="text-sm text-gray-400">Total</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-400">
                  {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
                </div>
                <div className="text-sm text-gray-400">Completion</div>
              </CardContent>
            </Card>
          </div>

          {/* Achievement List */}
          <div className="grid gap-4">
            {achievements.map((achievement: Achievement) => {
              const isUnlocked = unlockedAchievements.includes(achievement.id);
              const progress = getAchievementProgress(achievement.id);
              const Icon = getAchievementIcon(achievement.type);
              
              return (
                <Card 
                  key={achievement.id} 
                  className={`bg-gray-800 border-gray-700 transition-opacity ${
                    isUnlocked ? 'opacity-100' : 'opacity-60'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        isUnlocked ? 'bg-yellow-400/20' : 'bg-gray-700'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          isUnlocked ? 'text-yellow-400' : 'text-gray-500'
                        }`} />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-semibold ${
                            isUnlocked ? 'text-white' : 'text-gray-400'
                          }`}>
                            {achievement.name}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={getAchievementColor(achievement.type)}
                          >
                            {achievement.type}
                          </Badge>
                        </div>
                        
                        <p className={`text-sm ${
                          isUnlocked ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {achievement.description}
                        </p>
                        
                        {!isUnlocked && (achievement.requirementType === 'correctAnswers' || achievement.requirementType === 'visitRegions' || achievement.requirementType === 'collectItems') && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400">Progress</span>
                              <span className="text-gray-400">
                                {progress} / {achievement.requirementValue}
                              </span>
                            </div>
                            <Progress 
                              value={(progress / achievement.requirementValue) * 100} 
                              className="h-1" 
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            Reward: {achievement.experienceReward} XP
                          </span>
                          {isUnlocked && (
                            <Badge className="bg-green-600 text-white">
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
