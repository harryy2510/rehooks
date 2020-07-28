const useDom = () => Boolean(
    typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
)

export default useDom
