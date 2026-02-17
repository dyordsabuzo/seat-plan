export type Race = {
    id: string,
    paddlers?: Paddler[],
    category: string,
    type?: string,
    distance?: string,
    boatType?: string,
    configs?: any
}

export type Regatta = {
    name: string,
    paddlers?: Paddler[],
    categories?: string[],
    types?: string[],
    distances?: string[],
    boatTypes?: string[],
    races?: Race[]
}

export type Paddler = {
    id: string,
    name: string,
    weight?: number,
    gender?: string,
    birthdate?: string,
    content?: string, // for board display purposes
}

export type BoatSetup = {
    drummer: (Paddler | null)[],
    sweep: (Paddler | null)[],
    left: (Paddler | null)[],
    right: (Paddler | null)[],
    reserve: Paddler[]
}