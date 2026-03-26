import useSound from 'use-sound'

const useGameSounds = () => {
    const [playTaskComplete] = useSound('/sounds/task-complete.mp3', {
        volume: 0.4,
    })

    const [playLevelUp] = useSound('/sounds/level-up.mp3', {
        volume: 0.6,
    })

    const [playPurchase] = useSound('/sounds/purchase.mp3', {
        volume: 0.4,
    })

    return { playTaskComplete, playLevelUp, playPurchase }
}

export default useGameSounds