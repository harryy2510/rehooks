import React from 'react'
import store from 'store'

const useStore = <T extends any = any>(
    key: string,
    initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [value, setValue] = React.useState<T>(store.get(key, initialValue))
    React.useEffect(() => {
        store.set(key, value)
    }, [key, value])
    return [value, setValue]
}

export default useStore
