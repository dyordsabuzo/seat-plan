import {BoatPosition} from "../enums/BoatConstant";

const frontBackFactor = [
    6, 4.5, 3.5, 2.5, 1.5, 0.5, -0.5, -1.5, -2.5, -3.5, -4.5, -6
];

export function calculateFrontBackBalance(board: any, paddlers: any) {
    if (board === null) {
        return {frontHeavy: false, value: 0, alert: false};
    }

    let value: number = 0;
    for (let i = 0, l = frontBackFactor.length; i < l; i++) {
        let weight = 0;
        if (i === 0) {
            const drummer = board['drummer'].paddlerIds[0];
            weight = drummer ? paddlers[drummer].weight : 0;

            // add 14kg drum weight on drummer
            weight += 14;
        } else if (i === l - 1) {
            const sweep = board['sweep'].paddlerIds[0];
            weight = sweep ? paddlers[sweep].weight : 0;

            // add 7 for oar's weight
            weight += 7;
        } else {
            const leftPaddler = board[`left-${i}`].paddlerIds[0];
            const rightPaddler = board[`right-${i}`].paddlerIds[0];

            const leftPaddlerWeight = leftPaddler ? paddlers[leftPaddler].weight : 0;
            const rightPaddlerWeight = rightPaddler ? paddlers[rightPaddler].weight : 0;

            weight = rightPaddlerWeight + leftPaddlerWeight;
        }
        value += (frontBackFactor[i] / 6) * (weight);
    }

    // positive is front heavy, alert if > 15 or < -25
    return {
        frontHeavy: value > 0,
        value: value.toFixed(1),
        alert: value > 15 || value < -25
    };
}

export function calculateLeftRightBalance(board: any, paddlers: any) {
    if (board === null) {
        return {frontHeavy: false, value: 0, alert: false};
    }

    const leftRightFactor = [
        0, 300, 330, 350, 350, 350, 350, 350, 350, 330, 300, 420
    ];

    // get left right weight factor
    let value = 0, menCount = 0, womenCount = 0;
    for (let i = 1, l = leftRightFactor.length - 1; i < l; i++) {
        const leftPaddler = board[`left-${i}`].paddlerIds[0];
        const rightPaddler = board[`right-${i}`].paddlerIds[0];

        menCount += leftPaddler && paddlers[leftPaddler].gender === 'M' ? 1 : 0;
        menCount += rightPaddler && paddlers[rightPaddler].gender === 'M' ? 1 : 0;

        womenCount += leftPaddler && paddlers[leftPaddler].gender === 'F' ? 1 : 0;
        womenCount += rightPaddler && paddlers[rightPaddler].gender === 'F' ? 1 : 0;

        const leftPaddlerWeight = leftPaddler ? paddlers[leftPaddler].weight : 0;
        const rightPaddlerWeight = rightPaddler ? paddlers[rightPaddler].weight : 0;

        value += (leftRightFactor[i] / 350) * (rightPaddlerWeight - leftPaddlerWeight);
    }

    // sweeps weight
    value += 1.2 * (-3)

    // right heavy if greater than zero, alert if unsigned value is > 5
    return {
        rightHeavy: value > 0,
        value: value.toFixed(1),
        alert: Math.abs(value) > 5,
        menCount,
        womenCount
    };
}


const sideWeightFactor = [
    // 0,
    300, 330, 350, 350, 350, 350, 350, 350, 330, 300, 420
];

export function calculateSideBalance(boat: any, settings: any = {}) {
    if (boat.length === 1) {
        return 0;
    }

    console.log(settings)

    let value = 0;

    const leftPaddlers = boat[BoatPosition.LEFT]
    const rightPaddlers = boat[BoatPosition.RIGHT]

    const weightFactor = settings.sideWeightFactor ?? sideWeightFactor


    for (let i = 0; i < leftPaddlers.length; i++) {
        const factor = (weightFactor[i] / 350)
        const leftPaddlerWeight = leftPaddlers[i].weight ?? 0
        const rightPaddlerWeight = rightPaddlers[i].weight ?? 0

        value += factor * (rightPaddlerWeight - leftPaddlerWeight);
    }

    // left sweep oar weight offset of 3kg
    value += (weightFactor[weightFactor.length - 1] / 350) * (-3)

    return {
        distribution: (value === 0 ? "Balanced" : (value > 0 ? "Right" : "Left") + " heavy"),
        value: value.toFixed(1),
        alert: Math.abs(value) > 5,
        weightTolerance: `minimum -5kg, maximum 5kg`
    };
}

export function calculateLineBalance(boat: any, settings: any = {}) {
    if (boat.length === 1) {
        return 0;
    }

    console.log(settings)
    let value: number = 0;

    // add drum weight of 14kg on drummer weight
    const defaultDrumWeight = settings.defaultDrumWeight ?? 14
    const drummerWeight = defaultDrumWeight + (boat[BoatPosition.DRUMMER].weight ?? 0)
    const weightFactor = settings.lineWeightFactor ?? frontBackFactor
    value += (weightFactor[0] / 6) * (drummerWeight);

    const leftPaddlers = boat[BoatPosition.LEFT]
    const rightPaddlers = boat[BoatPosition.RIGHT]

    for (let i = 0; i < leftPaddlers.length; i++) {
        let weight = 0;

        const leftPaddlerWeight = leftPaddlers[i].weight ?? 0
        const rightPaddlerWeight = rightPaddlers[i].weight ?? 0
        weight = rightPaddlerWeight + leftPaddlerWeight;

        value += (weightFactor[i + 1] / 6) * (weight);
    }

    // add sweep oar weight of 7kg on sweep weight
    const defaultSweepWeight = settings.defaultSweepWeight ?? 7
    const sweepWeight = defaultSweepWeight + (boat[BoatPosition.SWEEP].weight ?? 0)
    value += (weightFactor[weightFactor.length - 1] / 6) * (sweepWeight);

    // positive is front heavy, alert if > 15 or < -25
    return {
        distribution: (value === 0 ? "Balanced" : (value > 0 ? "Front" : "Back") + " heavy"),
        value: value.toFixed(1),
        alert: value > 15 || value < -25,
        weightTolerance: `minimum -25kg, maximum 15kg`
    };
}

export function calculateBalance(boat: any) {
    const sideBalance = calculateSideBalance(boat);
    const lineBalance = calculateLineBalance(boat);

    return {
        ...sideBalance,
        ...lineBalance
    }
}

