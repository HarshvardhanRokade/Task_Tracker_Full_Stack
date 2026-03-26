// src/components/rewards/RewardOverlay.jsx
import { useState, useEffect } from 'react'
import useGameStore from '../../store/useGameStore'
import FloatingXp from './FloatingXp'
import RewardToast from './RewardToast'
import LevelUpScreen from './LevelupScreen'
// ✨ NEW: Import sounds
import useGameSounds from '../../hooks/useGameSounds'

const RewardOverlay = () => {
  const { pendingReward, isLevelingUp, clearPendingReward, getLevelName } = useGameStore()
  
  // ✨ NEW: Init sounds
  const { playLevelUp } = useGameSounds()

  const [showFloating, setShowFloating]   = useState(false)
  const [showToast, setShowToast]         = useState(false)
  const [showLevelUp, setShowLevelUp]     = useState(false)
  const [rewardSnapshot, setRewardSnapshot] = useState(null)

  useEffect(() => {
    if (pendingReward) {
      setRewardSnapshot(pendingReward)
      setShowFloating(true)

      setTimeout(() => setShowToast(true), 400)

      if (isLevelingUp) {
        setTimeout(() => {
          setShowLevelUp(true)
          playLevelUp() // ✨ Play when level-up screen appears
        }, 800)
      }
    }
  }, [pendingReward, isLevelingUp, playLevelUp])

  const handleDismiss = () => {
    setShowFloating(false)
    setShowToast(false)
    setShowLevelUp(false)
    setRewardSnapshot(null)
    clearPendingReward()
  }

  return (
    <>
      <FloatingXp
        amount={rewardSnapshot?.xpEarned}
        isVisible={showFloating}
        onComplete={() => setShowFloating(false)}
      />
      <RewardToast
        reward={rewardSnapshot}
        isVisible={showToast}
        onDismiss={handleDismiss}
      />
      <LevelUpScreen
        isVisible={showLevelUp}
        newLevel={rewardSnapshot?.newLevel}
        levelName={getLevelName()}
        gemBonus={rewardSnapshot?.levelUpGemBonus}
        onDismiss={handleDismiss}
      />
    </>
  )
}

export default RewardOverlay