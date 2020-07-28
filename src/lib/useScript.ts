import React from 'react'

const generateHash = (str: string): string => {
    let hash = 0
    for (let char of str) {
        const charCode = char.charCodeAt(0)
        hash = (hash << 7) - hash + charCode
        hash = hash & hash
    }
    return hash.toString()
}

const useScript = (src: string) => {
    const [state, setState] = React.useState({
        loaded: false,
        error: false
    })
    React.useEffect(() => {
        const hash = generateHash(src)
        const existingScript = document.querySelector(
            `script[data-hash="${hash}"]`
        ) as HTMLScriptElement
        if (existingScript) {
            existingScript.src = src
            setState({ loaded: true, error: false })
        } else {
            const script = document.createElement('script')
            script.setAttribute('data-hash', hash)
            script.setAttribute('async', '')
            script.src = src
            const onScriptLoad = () => setState({ loaded: true, error: false })
            const onScriptError = () => {
                script.remove()
                setState({ loaded: false, error: true })
            }
            script.addEventListener('load', onScriptLoad)
            script.addEventListener('error', onScriptError)
            document.body.appendChild(script)
            return () => {
                script.removeEventListener('load', onScriptLoad)
                script.removeEventListener('error', onScriptError)
            }
        }
        return () => {}
    }, [src])
    return [state.loaded, state.error]
}

export default useScript
