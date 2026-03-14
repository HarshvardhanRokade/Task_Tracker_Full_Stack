// src/components/rewards/RewardOverlay.jsx
import { useState, useEffect } from 'react'
import useGameStore from '../../store/useGameStore'
import FloatingXp from './FloatingXp'
import RewardToast from './RewardToast'
import LevelUpScreen from './LevelupScreen'

const RewardOverlay = () => {
  const { pendingReward, isLevelingUp, clearPendingReward, getLevelName } = useGameStore()

  const [showFloating, setShowFloating]   = useState(false)
  const [showToast, setShowToast]         = useState(false)
  const [showLevelUp, setShowLevelUp]     = useState(false)
  const [rewardSnapshot, setRewardSnapshot] = useState(null)

  useEffect(() => {
    if (pendingReward) {
      // Snapshot the reward so it persists during animation even if store clears
      setRewardSnapshot(pendingReward)
      setShowFloating(true)

      // Stagger: toast appears after floating XP starts
      setTimeout(() => setShowToast(true), 400)

      // Level up appears after toast if applicable
      if (isLevelingUp) {
        setTimeout(() => setShowLevelUp(true), 800)
      }
    }
  }, [pendingReward, isLevelingUp])

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