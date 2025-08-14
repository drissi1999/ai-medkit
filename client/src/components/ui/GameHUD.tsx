import { useGameState } from "../../lib/stores/useGameState";
import { useAchievements } from "../../lib/stores/useAchievements";
import { useAudio } from "../../lib/stores/useAudio";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Progress } from "./progress";
import { Volume2, VolumeX, Trophy, Package } from "lucide-react";

export default function GameHUD() {
  const { playerLevel, experience, experienceToNext, currentQuest, setShowAchievements, setShowInventory } = useGameState();
  const { unlockedAchievements } = useAchievements();
  const { isMuted, toggleMute } = useAudio();

  const experienceProgress = (experience / experienceToNext) * 100;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
        {/* Player Stats */}
        <Card className="bg-black/80 text-white border-white/20">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Level {playerLevel}</span>
                <span className="text-sm text-gray-300">{experience} / {experienceToNext} XP</span>
              </div>
              <Progress value={experienceProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            onClick={() => setShowInventory(true)}
            variant="outline"
            size="sm"
            className="bg-black/80 text-white border-white/20 hover:bg-white/20"
          >
            <Package className="w-4 h-4 mr-2" />
            Inventory
          </Button>
          <Button
            onClick={() => setShowAchievements(true)}
            variant="outline"
            size="sm"
            className="bg-black/80 text-white border-white/20 hover:bg-white/20"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Achievements ({unlockedAchievements.length})
          </Button>
          <Button
            onClick={toggleMute}
            variant="outline"
            size="sm"
            className="bg-black/80 text-white border-white/20 hover:bg-white/20"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Current Quest */}
      {currentQuest && (
        <div className="absolute bottom-4 left-4 pointer-events-auto">
          <Card className="bg-black/80 text-white border-white/20 max-w-md">
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-yellow-400">Current Quest</h3>
                <p className="text-sm">{currentQuest.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Progress: {currentQuest.progress} / {currentQuest.total}</span>
                  <span>Reward: {currentQuest.rewardXP} XP</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls Help */}
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <Card className="bg-black/80 text-white border-white/20">
          <CardContent className="p-3">
            <div className="text-xs space-y-1">
              <div>WASD / Arrow Keys: Move</div>
              <div>E / Space: Interact</div>
              <div>I: Inventory</div>
              <div>T: Achievements</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
