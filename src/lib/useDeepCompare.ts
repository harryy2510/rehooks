import { isEqual } from 'lodash-es'
import React from 'react'

const useDeepCompare = <T extends any>(value: T): T => {
    const latestValue = React.useRef(value)
    if (!isEqual(latestValue.current, value)) {
        latestValue.current = value
    }
    return latestValue.current
}
export default useDeepCompare
