import { useState, useEffect } from "react";
import { useGameState } from "../../lib/stores/useGameState";
import { useChallenges } from "../../lib/stores/useChallenges";
import { useAudio } from "../../lib/stores/useAudio";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { Progress } from "./progress";

export default function ChallengeModal() {
  const { activeChallenge, setActiveChallenge, addExperience } = useGameState();
  const { submitAnswer, getChallengeById } = useChallenges();
  const { playSuccess, playHit } = useAudio();
  
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const challenge = activeChallenge ? getChallengeById(activeChallenge.challengeId) : null;

  // Timer effect
  useEffect(() => {
    if (!activeChallenge || showResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit(true); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeChallenge, showResult]);

  // Reset state when challenge changes
  useEffect(() => {
    if (activeChallenge) {
      setSelectedAnswer("");
      setShowResult(false);
      setIsCorrect(false);
      setTimeLeft(30);
    }
  }, [activeChallenge]);

  const handleSubmit = (timeUp = false) => {
    if (!challenge || !activeChallenge) return;

    const correct = !timeUp && selectedAnswer === challenge.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      playSuccess();
      addExperience(challenge.experienceReward);
    } else {
      playHit();
    }

    submitAnswer(activeChallenge.challengeId, selectedAnswer, correct);
  };

  const handleClose = () => {
    setActiveChallenge(null);
  };

  if (!activeChallenge || !challenge) return null;

  return (
    <Dialog open={!!activeChallenge} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Cultural Challenge
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Challenge Info */}
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="text-yellow-400 border-yellow-400">
              {challenge.culture}
            </Badge>
            <Badge variant="outline" className={`${challenge.difficulty === 'easy' ? 'text-green-400 border-green-400' : 
              challenge.difficulty === 'medium' ? 'text-yellow-400 border-yellow-400' : 
              'text-red-400 border-red-400'}`}>
              {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
            </Badge>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              {challenge.experienceReward} XP
            </Badge>
          </div>

          {/* Timer */}
          {!showResult && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Time Remaining</span>
                <span className="text-sm font-mono">{timeLeft}s</span>
              </div>
              <Progress value={(timeLeft / 30) * 100} className="h-2" />
            </div>
          )}

          {/* Question */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">{challenge.question}</h3>
              
              {!showResult ? (
                <div className="space-y-3">
                  {challenge.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAnswer(option)}
                      className={`w-full p-3 text-left rounded-lg border transition-colors
                        ${selectedAnswer === option 
                          ? 'bg-blue-600 border-blue-400' 
                          : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'}`}>
                    <h4 className={`font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </h4>
                    <p className="text-sm text-gray-300 mt-2">
                      The correct answer was: <strong>{challenge.correctAnswer}</strong>
                    </p>
                  </div>

                  {/* Explanation */}
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                    <h4 className="font-semibold text-blue-400 mb-2">Learn More</h4>
                    <p className="text-sm text-gray-300">{challenge.explanation}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            {!showResult ? (
              <>
                <Button 
                  onClick={() => handleSubmit()} 
                  disabled={!selectedAnswer}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Submit Answer
                </Button>
                <Button 
                  onClick={handleClose} 
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Skip Challenge
                </Button>
              </>
            ) : (
              <Button 
                onClick={handleClose}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Continue Adventure
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
