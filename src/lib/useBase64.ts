import useDom from './useDom'

const useBase64 = () => {
    const canUseDom = useDom()
    const encode = <T extends any = any>(input?: T | null): string => {
        const json = JSON.stringify(input ?? {})
        return canUseDom ? window.btoa(json) : Buffer.from(json).toString('base64')
    }
    const decode = <T extends any = any>(input?: string | null) => {
        const json = canUseDom ? window.atob(input ?? 'e30=') : Buffer.from(input ?? 'e30=', 'base64').toString()
        return JSON.parse(json)
    }
    return [encode, decode]
}

export default useBase64
