export function buildNestedConfig(categories: string[], types: string[], distances: string[], boatTypes: string[]) {
    // Build structure: [ {category: [ {type: [ {distance: [ {boatType: {paddlers:{}, configs:[]}} ] } ] } ] } ]
    const result: any = []

    categories.forEach((cat) => {
        const typeArr: any[] = []
        types.forEach((typ) => {
            const distArr: any[] = []
            distances.forEach((dist) => {
                const boatArr: any[] = []
                boatTypes.forEach((boat) => {
                    const boatObj: any = {}
                    boatObj[boat] = {paddlers: {}, configs: []}
                    boatArr.push(boatObj)
                })
                const distObj: any = {}
                distObj[dist] = boatArr
                distArr.push(distObj)
            })
            const typeObj: any = {}
            typeObj[typ] = distArr
            typeArr.push(typeObj)
        })
        const catObj: any = {}
        catObj[cat] = typeArr
        result.push(catObj)
    })

    return result
}

export function setPaddlersInNestedConfig(nested: any, paddlers: any) {
    if (!nested) return nested
    // deep clone structure and set paddlers at each boat level
    const clone = JSON.parse(JSON.stringify(nested))

    const applyToCategoryArray = (categories: any[]) => {
        categories.forEach((catObj: any) => {
            Object.values(catObj).forEach((typeArr: any) => {
                typeArr.forEach((typeObj: any) => {
                    Object.values(typeObj).forEach((distArr: any) => {
                        distArr.forEach((distObj: any) => {
                            Object.values(distObj).forEach((boatArr: any) => {
                                boatArr.forEach((boatObj: any) => {
                                    const boatKey = Object.keys(boatObj)[0]
                                    boatObj[boatKey].paddlers = paddlers
                                })
                            })
                        })
                    })
                })
            })
        })
    }

    if (Array.isArray(clone)) {
        applyToCategoryArray(clone)
    } else if (typeof clone === 'object') {
        // assume top-level object mapping raceName -> categories[]
        Object.values(clone).forEach((categories: any) => {
            if (Array.isArray(categories)) applyToCategoryArray(categories)
        })
    }

    return clone
}

export function addPaddlerToNestedConfig(nested: any, paddler: any) {
    if (!nested) return nested
    const clone = JSON.parse(JSON.stringify(nested))

    const applyToCategoryArray = (categories: any[]) => {
        categories.forEach((catObj: any) => {
            Object.values(catObj).forEach((typeArr: any) => {
                typeArr.forEach((typeObj: any) => {
                    Object.values(typeObj).forEach((distArr: any) => {
                        distArr.forEach((distObj: any) => {
                            Object.values(distObj).forEach((boatArr: any) => {
                                boatArr.forEach((boatObj: any) => {
                                    const boatKey = Object.keys(boatObj)[0]
                                    const bp = boatObj[boatKey]
                                    if (!bp.paddlers) bp.paddlers = {}
                                    // add paddler to paddlers map keyed by id
                                    bp.paddlers = {
                                        ...(bp.paddlers || {}),
                                        [paddler.id]: paddler
                                    }
                                })
                            })
                        })
                    })
                })
            })
        })
    }

    if (Array.isArray(clone)) {
        applyToCategoryArray(clone)
    } else if (typeof clone === 'object') {
        Object.values(clone).forEach((categories: any) => {
            if (Array.isArray(categories)) applyToCategoryArray(categories)
        })
    }

    return clone
}

export function extractFirstBoatConfig(nested: any) {
    // navigate to first boat object and return its value {paddlers, configs}
    if (!nested) return {paddlers: {}, configs: []}
    try {
        let categories: any[] | undefined
        if (Array.isArray(nested)) {
            categories = nested
        } else if (typeof nested === 'object') {
            const first = Object.values(nested)[0]
            if (Array.isArray(first)) categories = first
        }

        if (!categories || categories.length === 0) return {paddlers: {}, configs: []}

        const catObj = categories[0]
        const typeArr = Object.values(catObj)[0]
        const typeObj = typeArr[0]
        const distArr = Object.values(typeObj)[0]
        const distObj = distArr[0]
        const boatArr = Object.values(distObj)[0]
        const boatObj = boatArr[0]
        const key = Object.keys(boatObj)[0]
        return boatObj[key]
    } catch (e) {
        return {paddlers: {}, configs: []}
    }
}

export default {buildNestedConfig, setPaddlersInNestedConfig, addPaddlerToNestedConfig, extractFirstBoatConfig}
