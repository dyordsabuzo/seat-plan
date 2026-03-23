import { BoatPosition } from "../../../enums/BoatConstant";

export const BOAT_POSITIONS = [
  BoatPosition.RESERVE,
  BoatPosition.DRUMMER,
  BoatPosition.LEFT,
  BoatPosition.RIGHT,
  BoatPosition.SWEEP,
];

export const createItemsByPosition = (setup: any) => ({
  [BoatPosition.RESERVE]: setup?.[BoatPosition.RESERVE]?.map((item: any) => String(item.id)) || [],
  [BoatPosition.DRUMMER]: setup?.[BoatPosition.DRUMMER]?.map((item: any) => String(item.id)) || [],
  [BoatPosition.LEFT]: setup?.[BoatPosition.LEFT]?.map((item: any) => String(item.id)) || [],
  [BoatPosition.RIGHT]: setup?.[BoatPosition.RIGHT]?.map((item: any) => String(item.id)) || [],
  [BoatPosition.SWEEP]: setup?.[BoatPosition.SWEEP]?.map((item: any) => String(item.id)) || [],
});

export const areItemsEqual = (a: any, b: any) => {
  return BOAT_POSITIONS.every((position) => {
    const left = a?.[position] || [];
    const right = b?.[position] || [];

    if (left.length !== right.length) return false;
    for (let index = 0; index < left.length; index += 1) {
      if (String(left[index]) !== String(right[index])) return false;
    }

    return true;
  });
};

export const getRowsByIds = (
  ids: any[],
  paddlersById: Map<string, any>,
  fallbackFactory: (id: any, index: number) => any,
) => {
  return ids.map((id: any, index: number) => paddlersById.get(String(id)) || fallbackFactory(id, index));
};
