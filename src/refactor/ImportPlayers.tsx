import {useContext} from "react";
import {processFile} from "../utils/DataBuilder";
import BoatContext from "../context/BoatContext";
import UploadFileButton from "../components/basic/form/UploadFileButton";
import MainPage from "../pages/MainPage";

const ImportPlayers = () => {
    const boatContext = useContext(BoatContext);

    const parseFile = async (file: File | null) => {
        if (file) {
            const _paddlers = await processFile(file);
            boatContext.setPaddlers(_paddlers);
        }
    }

    let paddlers = boatContext.paddlers;
    if (paddlers) {
        return <MainPage/>
    } else {
        return <UploadFileButton setFile={parseFile}/>
    }
}

export default ImportPlayers;