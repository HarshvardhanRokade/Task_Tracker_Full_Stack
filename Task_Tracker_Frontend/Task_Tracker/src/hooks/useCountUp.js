import { useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'

const useCountUp = (target, duration = 0.8) => {
    const [value, setValue] = useState(target)
    const prevTarget = useRef(target)

    useEffect(() => {
        if (prevTarget.current === target) return

        const from = prevTarget.current
        prevTarget.current = target

        const controls = animate(from, target, {
            duration,
            ease: 'easeOut',
            onUpdate: (latest) => {
                setValue(Math.round(latest))
            },
        })

        return controls.stop
    }, [target, duration])

    return value
}

export default useCountUp