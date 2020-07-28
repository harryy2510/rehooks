import { isEqual } from 'lodash-es'
import { useCallback, useEffect, useRef, useState } from 'react'
import useDebouncedCallback from './useDebouncedCallback'

const useDebounce = <T extends any = any>(
    value: T,
    delay: number,
    options?: { maxWait?: number; leading?: boolean; trailing?: boolean }
): [T, () => void, () => void] => {
    const [state, dispatch] = useState(value)
    const [callback, cancel, callPending] = useDebouncedCallback(
        useCallback((value: T) => dispatch(value), []),
        delay,
        options
    )
    const previousValue = useRef(value)
    useEffect(() => {
        if (!isEqual(previousValue.current, value)) {
            callback(value)
            previousValue.current = value
        }
    }, [value, callback])
    return [state, cancel, callPending]
}

export default useDebounce
