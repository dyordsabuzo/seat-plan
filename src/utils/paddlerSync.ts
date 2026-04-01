import { Paddler, Race, Regatta } from "../types/RegattaType";

const toPaddlerId = (value: unknown) => String(value ?? "").trim();

const hasPaddlerId = (item: any): item is Paddler => {
    if (!item || typeof item !== "object") return false;
    const id = toPaddlerId(item.id);
    return id.length > 0;
};

const toPaddler = (candidate: any): Paddler | null => {
    if (!hasPaddlerId(candidate)) return null;

    const id = toPaddlerId(candidate.id);
    return {
        ...candidate,
        id,
    } as Paddler;
};

const uniquePaddlerIds = (ids: string[]) => {
    const unique = new Set<string>();
    ids.forEach((id) => {
        const normalised = toPaddlerId(id);
        if (normalised) unique.add(normalised);
    });
    return Array.from(unique);
};

const syncPaddler = (candidate: any, canonicalById: Map<string, Paddler>) => {
    if (!hasPaddlerId(candidate)) return candidate;
    const id = toPaddlerId(candidate.id);
    const canonical = canonicalById.get(id);
    if (!canonical) return candidate;
    return {
        ...candidate,
        ...canonical,
        id,
    };
};

const syncConfig = (config: any, canonicalById: Map<string, Paddler>) => {
    if (typeof config === "string") {
        try {
            const parsed = JSON.parse(config);
            return syncConfig(parsed, canonicalById);
        } catch {
            return config;
        }
    }

    if (!Array.isArray(config)) return config;

    return config.map((group) => {
        if (!Array.isArray(group)) return group;
        return group.map((item) => syncPaddler(item, canonicalById));
    });
};

const getRacePaddlerIds = (race: Race) => {
    if (Array.isArray(race.paddlerIds) && race.paddlerIds.length > 0) {
        return uniquePaddlerIds(race.paddlerIds.map((id) => toPaddlerId(id)));
    }

    if (!Array.isArray(race.paddlers)) return [];

    return uniquePaddlerIds(
        race.paddlers
            .map((paddler) => toPaddlerId((paddler as any)?.id))
            .filter((id) => id.length > 0),
    );
};

const normalisePaddlers = (paddlers: Paddler[] = []) => {
    const canonicalById = new Map<string, Paddler>();
    paddlers.forEach((candidate) => {
        const paddler = toPaddler(candidate);
        if (!paddler) return;
        canonicalById.set(paddler.id, paddler);
    });
    return canonicalById;
};

const normaliseRace = (race: Race, canonicalById: Map<string, Paddler>): Race => {
    const racePaddlerIds = getRacePaddlerIds(race).filter((id) => canonicalById.has(id));

    return {
        ...race,
        paddlerIds: racePaddlerIds,
        paddlers: racePaddlerIds
            .map((id) => canonicalById.get(id))
            .filter((paddler): paddler is Paddler => Boolean(paddler)),
        configs: Array.isArray(race.configs)
            ? race.configs.map((config) => syncConfig(config, canonicalById))
            : race.configs,
    };
};

export const normalizeRegattaState = (regatta: Regatta | null): Regatta | null => {
    if (!regatta) return regatta;

    const canonicalById = normalisePaddlers(regatta.paddlers ?? []);
    const paddlers = Array.from(canonicalById.values());
    const races = (regatta.races ?? []).map((race) => normaliseRace(race, canonicalById));

    return {
        ...regatta,
        paddlers,
        races,
    };
};

const arePaddlersEqual = (left: Paddler[] = [], right: Paddler[] = []) => {
    if (left.length !== right.length) return false;

    for (let index = 0; index < left.length; index += 1) {
        const leftItem = left[index];
        const rightItem = right[index];
        if (!leftItem || !rightItem) return false;
        if (JSON.stringify(leftItem) !== JSON.stringify(rightItem)) return false;
    }

    return true;
};

export const syncRegattaPaddlersFromClub = (regatta: Regatta | null, clubPaddlers: Paddler[] = []) => {
    if (!regatta || !Array.isArray(clubPaddlers) || clubPaddlers.length === 0) {
        return { changed: false, value: regatta };
    }

    const clubCanonicalById = new Map<string, Paddler>(
        clubPaddlers
            .map((candidate) => toPaddler(candidate))
            .filter((paddler): paddler is Paddler => Boolean(paddler))
            .map((paddler) => [paddler.id, paddler]),
    );

    const nextRegattaPaddlers = (regatta.paddlers ?? []).map((paddler) => syncPaddler(paddler, clubCanonicalById));

    const nextRegatta = normalizeRegattaState({
        ...regatta,
        paddlers: nextRegattaPaddlers,
    });

    const changed =
        !arePaddlersEqual(regatta.paddlers ?? [], nextRegatta?.paddlers ?? []) ||
        JSON.stringify(regatta.races ?? []) !== JSON.stringify(nextRegatta?.races ?? []);

    if (!changed) {
        return { changed: false, value: regatta };
    }

    return {
        changed: true,
        value: nextRegatta,
    };
};
