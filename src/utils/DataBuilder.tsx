// import initialData from '../initialData';
// import Boat from "../components/Boat";
import Papa from "papaparse";
import {PaddlerType} from "../types/PaddlerType";

type BoatData = {
    paddlers: any,
    board: any,
    drummer: string[],
    leftOrder: string[],
    rightOrder: string[],
    sweep: string[],
}


function getPaddler(data: any) {
    let paddler: PaddlerType = {
        id: null,
        name: null,
        birthdate: null,
        gender: null,
        weight: null
    }

    for (const [key, value] of Object.entries(data)) {
        if (key.toLowerCase() === 'name') {
            let firstname, lastname;
            [lastname, firstname] = (value as string).trim().split(",");
            paddler.name = `${firstname} ${lastname.charAt(0)}`;
        } else if (key.toLowerCase() === 'attendee name') {
            let firstname, lastname;
            [firstname, lastname] = (value as string).trim().split(" ");
            paddler.name = `${firstname} ${lastname.charAt(0)}`;
        } else if (key.toLowerCase() === 'state member id') {
            paddler.id = (value as string).trim()
        } else if (key.toLowerCase() === 'first name') {
            console.log(value)
            paddler.name = (value as string).trim()
        } else if (key.toLowerCase() === 'last name') {
            paddler.name = `${paddler.name}${(value as string).trim().charAt(0)}`
        } else if (key.toLowerCase() === 'date of birth') {
            paddler.birthdate = value as string
        } else if (key.toLowerCase() === 'gender') {
            paddler.gender = value as string
        } else if (key.toLowerCase() === 'current weight (in kgs)') {
            let weight = (value as string).replace("kg", "").replace("s", "").trim() || "60";
            paddler.weight = parseInt(weight);
        }
    }
    return paddler;
}

export function processFile(file: File) {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                let paddlers = {};
                results.data.forEach((d) => {
                    const paddler = getPaddler(d);
                    paddlers = {
                        ...paddlers,
                        [paddler.id as string]: paddler
                    };
                });
                resolve(paddlers);
            },
        });
    });
}

export async function buildBoat(file: File) {
    let paddlers = await processFile(file);

    let data: BoatData = {
        board: {},
        drummer: [],
        leftOrder: [],
        rightOrder: [],
        sweep: [],
        paddlers: paddlers
    };

    let keys = Object.keys(data.paddlers);

    data.board = {
        ...data.board,
        main: {
            id: 'main',
            paddlerIds: keys.sort()
        },
        drummer: {
            id: 'drummer',
            paddlerIds: []
        },
        sweep: {
            id: 'sweep',
            paddlerIds: []
        },
    };

    for (let i = 1; i < 11; i++) {
        data.board = {
            ...data.board,
            [`left-${i}`]: {
                id: `left-${i}`,
                paddlerIds: []
            },
            [`right-${i}`]: {
                id: `right-${i}`,
                paddlerIds: []
            },
        }
        data.leftOrder.push(`left-${i}`);
        data.rightOrder.push(`right-${i}`);
    }
    data.drummer.push('drummer');
    data.sweep.push('sweep');

    return data;
}