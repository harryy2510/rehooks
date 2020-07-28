import { useCallback, useEffect, useRef } from 'react'

const useDebouncedCallback = <T extends any[]>(
    callback: (...args: T) => any,
    delay: number,
    options: { maxWait?: number, leading?: boolean, trailing?: boolean } = {}
): [(...args: T) => void, () => void, () => void] => {
    const maxWait = options.maxWait
    const maxWaitHandler = useRef<NodeJS.Timeout | null>(null)
    const maxWaitArgs = useRef<T | []>([])
    const leading = options.leading
    const trailing = options.trailing === undefined ? true : options.trailing
    const leadingCall = useRef(false)
    const functionTimeoutHandler = useRef<NodeJS.Timeout | null>(null)
    const isComponentUnmounted = useRef(false)
    const debouncedFunction = useRef(callback)
    debouncedFunction.current = callback
    const cancelDebouncedCallback: () => void = useCallback(() => {
        functionTimeoutHandler.current !== null && clearTimeout(functionTimeoutHandler.current)
        maxWaitHandler.current !== null && clearTimeout(maxWaitHandler.current)
        maxWaitHandler.current = null
        maxWaitArgs.current = []
        functionTimeoutHandler.current = null
        leadingCall.current = false
    }, [])
    useEffect(() => {
        isComponentUnmounted.current = false
        return () => {
            isComponentUnmounted.current = true
        }
    }, [])
    const debouncedCallback = useCallback(
        (...args: T) => {
            maxWaitArgs.current = args
            functionTimeoutHandler.current !== null && clearTimeout(functionTimeoutHandler.current)
            if (leadingCall.current) {
                leadingCall.current = false
            }
            if (!functionTimeoutHandler.current && leading && !leadingCall.current) {
                debouncedFunction.current(...args)
                leadingCall.current = true
            }
            functionTimeoutHandler.current = setTimeout(() => {
                let shouldCallFunction = true
                if (leading && leadingCall.current) {
                    shouldCallFunction = false
                }
                cancelDebouncedCallback()

                if (!isComponentUnmounted.current && trailing && shouldCallFunction) {
                    debouncedFunction.current(...args)
                }
            }, delay)

            if (maxWait && !maxWaitHandler.current && trailing) {
                maxWaitHandler.current = setTimeout(() => {
                    const args = maxWaitArgs.current
                    cancelDebouncedCallback()

                    if (!isComponentUnmounted.current) {
                        debouncedFunction.current.apply(null, args as any)
                    }
                }, maxWait)
            }
        },
        [maxWait, delay, cancelDebouncedCallback, leading, trailing]
    )
    const callPending = useCallback(() => {
        if (!functionTimeoutHandler.current) {
            return
        }
        debouncedFunction.current.apply(null, maxWaitArgs.current as any)
        cancelDebouncedCallback()
    }, [cancelDebouncedCallback])
    return [debouncedCallback, cancelDebouncedCallback, callPending]
}

export default useDebouncedCallback
