// src/components/rewards/RewardOverlay.jsx
import { useState, useEffect } from 'react'
import useGameStore from '../../store/useGameStore'
import FloatingXp from './FloatingXp'
import RewardToast from './RewardToast'
import LevelUpScreen from './LevelUpScreen'
import useGameSounds from '../../hooks/useGameSounds'
// ✨ NEW: Import your sleek Badge component
import BadgeUnlock from './BadgeUnlock'

const RewardOverlay = () => {
  const { pendingReward, isLevelingUp, clearPendingReward, getLevelName } = useGameStore()
  
  const { playLevelUp, playTaskComplete } = useGameSounds()

  const [showFloating, setShowFloating]   = useState(false)
  const [showToast, setShowToast]         = useState(false)
  const [showLevelUp, setShowLevelUp]     = useState(false)
  const [rewardSnapshot, setRewardSnapshot] = useState(null)

  // Badge States
  const [newBadges, setNewBadges] = useState([])
  const [badgeIndex, setBadgeIndex] = useState(0)
  const [showBadge, setShowBadge] = useState(false)

  useEffect(() => {
    if (pendingReward) {
      setRewardSnapshot(pendingReward)
      setShowFloating(true)

      setTimeout(() => setShowToast(true), 400)

      if (isLevelingUp) {
        setTimeout(() => {
          setShowLevelUp(true)
          playLevelUp() 
        }, 800)
      } else if (pendingReward?.newBadges?.length > 0) {
        setNewBadges(pendingReward.newBadges)
        setBadgeIndex(0)
        setTimeout(() => {
            setShowBadge(true)
            playTaskComplete() // Fire the sound right when the badge slides in
        }, 1200)
      }
    }
  }, [pendingReward, isLevelingUp, playLevelUp, playTaskComplete])

  const handleDismiss = () => {
    setShowFloating(false)
    setShowToast(false)
    setShowLevelUp(false)
    setShowBadge(false)
    setRewardSnapshot(null)
    clearPendingReward()
  }

  const handleLevelUpDismiss = () => {
      setShowLevelUp(false)
      if (rewardSnapshot?.newBadges?.length > 0) {
          setNewBadges(rewardSnapshot.newBadges)
          setBadgeIndex(0)
          setTimeout(() => {
              setShowBadge(true)
              playTaskComplete()
          }, 400)
      } else {
          handleDismiss()
      }
  }

  const handleNextBadge = () => {
      if (badgeIndex < newBadges.length - 1) {
          setBadgeIndex(prev => prev + 1)
          playTaskComplete() // Fire sound for the next badge
      } else {
          setShowBadge(false)
          setNewBadges([])
          handleDismiss() 
      }
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
        onDismiss={() => {
            setShowToast(false)
            if (!isLevelingUp && !(rewardSnapshot?.newBadges?.length > 0)) {
                handleDismiss()
            }
        }}
      />
      <LevelUpScreen
        isVisible={showLevelUp}
        newLevel={rewardSnapshot?.newLevel}
        levelName={getLevelName()}
        gemBonus={rewardSnapshot?.levelUpGemBonus}
        onDismiss={handleLevelUpDismiss} 
      />
      
      {/* ✨ NEW: Your sleek floating Badge component */}
      <BadgeUnlock
        badge={newBadges[badgeIndex]}
        isVisible={showBadge}
        onDismiss={handleNextBadge}
      />
    </>
  )
}

export default RewardOverlay