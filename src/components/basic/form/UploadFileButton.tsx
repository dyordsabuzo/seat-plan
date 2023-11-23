type UploadFileButtonProps = {
    setFile: (file: File | null) => {},
}

const UploadFileButton: React.FC<UploadFileButtonProps> = ({setFile}) => {
    const changeHandler = async (event: React.FormEvent<HTMLInputElement>) => {
        const file = (event.currentTarget.files as FileList).item(0);
        setFile(file);
    }

    return (
        <div>
            <div className={`flex p-4`}>
                <input
                    type="file"
                    name="file"
                    accept=".csv"
                    onChange={changeHandler}
                />
            </div>
        </div>
    );
}
export default UploadFileButton;