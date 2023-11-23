type DropdownListProps = {
    id: string
    value: string
    label: string
    options: string[]
    setValue: (value: string) => void
}

const DropDownList: React.FC<DropdownListProps> = ({id, value, label, options, setValue}) => {
    return (
        <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={id}>
                {label}
            </label>

            <select id="raceType"
                    className={`
                        bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 
                        focus:border-blue-500 block w-full p-2.5
                    `}
                    onChange={(e) => setValue(e.target.value)}
                    value={value}
                    required>
                <option value="">Choose a category</option>
                {options.map((option) => (<option key={option} value={option}>{option}</option>))}
            </select>
        </div>
    );
}

export default DropDownList;