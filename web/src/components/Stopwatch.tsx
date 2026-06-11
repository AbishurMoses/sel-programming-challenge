 import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'

export function Stopwatch() {
    const [elapsed, setElapsed] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const [laps, setLaps] = useState<number[]>([])
    const interval = useRef<number | null>(null)

    useEffect(() => {
        if (!isRunning) return

        interval.current = setInterval(() => {
            setElapsed((prev) => prev + 1)
        }, 1000)

        return () => {
            if (interval.current) {
                clearInterval(interval.current)
            }
        }
    }, [isRunning])

    const start = () => {
        setIsRunning(true)
    }

    const recordLap = () => {
        setLaps(prev => [...prev, elapsed])
    }

    const stop = () => {
        setIsRunning(false)
    }

    const reset = () => {
        stop()
        setElapsed(0)
        setLaps([])
    }

    const formatTime = (time: number) => {
        return `${Math.floor(time / 60)}:${String(time % 60).padStart(2, '0')}`
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader className='flex justify-center'>
                <CardTitle className='font-bold'>StopWatch</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-2'>
                <div className='flex flex-col justify-center gap-4'>
                    <div className='text-center'>
                        <p className='font-bold text-xl'>{formatTime(elapsed)}</p>
                    </div>
                    <div className='flex gap-2 justify-center'>
                        <Button onClick={start} disabled={isRunning}>Start</Button>
                        <Button onClick={recordLap} disabled={!isRunning}>Lap</Button>
                        <Button onClick={stop}>Stop</Button>
                        <Button onClick={reset}>Reset</Button>
                    </div>
                </div>

                {laps.length > 0 && (
                    <div className='pt-4 flex flex-col gap-1'>{laps.map((lap, index) => {
                        return (
                            <p className='font-semibold text-md' key={index}>Lap {index + 1}: {formatTime(lap)}</p>
                        )
                    })
                    }</div>
                )}
            </CardContent>
        </Card>
    )
}