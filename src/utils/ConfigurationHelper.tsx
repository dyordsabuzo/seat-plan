// fake data generator
import {BoatPosition} from "../enums/BoatConstant";

export const getItems = (count: number, offset = 0, label: string) =>
    Array.from({length: count}, (v, k) => k).map(k => ({
            id: `${label}-${k + offset}-${new Date().getTime()}`,
            // content: `${label} ${k + offset}`,
            content: 'Empty Seat',
            weight: 0
        })
    );

export const reorder = (list: any, startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

/**
 * Moves an item from one list to another list.
 */
export const move = (source: any, destination: any, droppableSource: any, droppableDestination: any) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);


    const result: any = {};
    // if index of droppable destination is greater than or equal the length of destination
    // then remove the last item
    let replaced = null
    if (droppableDestination.droppableId !== BoatPosition.RESERVE.toString()) {
        [replaced] = destClone.splice(droppableDestination.index, 1)
        if (droppableDestination.index >= destination.length) {
            [replaced] = destClone.splice(droppableDestination.index - 1, 1)
        }
    }

    if (droppableSource.droppableId !== BoatPosition.RESERVE.toString()) {
        if (droppableDestination.droppableId !== BoatPosition.RESERVE.toString()) {
            sourceClone.splice(droppableSource.index, 0, replaced)
        } else {
            sourceClone.splice(droppableSource.index, 0, {
                id: `empty-${droppableSource.index}-${new Date().getTime()}`,
                content: 'Empty Seat'
            })
        }
    } else {
        if (droppableDestination.droppableId !== BoatPosition.RESERVE.toString()) {
            if ((replaced as any).content !== "Empty Seat") {
                result["displaced"] = replaced
            }
        }
    }

    destClone.splice(droppableDestination.index, 0, removed);

    result[droppableSource.droppableId as string] = sourceClone;
    result[droppableDestination.droppableId as string] = destClone;

    return result;
};