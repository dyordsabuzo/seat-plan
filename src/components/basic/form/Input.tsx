type InputProps = {
    id: string
    type: string
    label: string
    placeholder: string
    value: string | number
    required?: boolean
    setStringValue?: (value: string) => void
    setNumberValue?: (value: number) => void
}

const Input: React.FC<InputProps> = ({
                                         id, type, label, value,
                                         setStringValue, setNumberValue,
                                         placeholder, required = false
                                     }) => {
    return (
        <div>
            <label className="block text-gray-700 text-sm font-bold mb-2"
                   htmlFor={id}>
                {label}
            </label>
            <input id={id} type={type}
                   className={`
                       shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 
                       leading-tight focus:outline-none focus:shadow-outline
                   `}
                   placeholder={placeholder}
                   value={value}
                   onChange={(e) => {
                       setNumberValue && setNumberValue(parseInt(e.target.value));
                       setStringValue && setStringValue(e.target.value);
                   }}
                   required={required}
            />
        </div>

    );
}

export default Input;