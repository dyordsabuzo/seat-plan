import { useEffect, useState } from "react";

type NewPaddler = {
  name: string;
  weight?: number;
  gender?: string;
  birthdate?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (paddler: NewPaddler) => void;
};

export default function AddPaddlerModal({ open, onClose, onAdd }: Props) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("M");
  const [weight, setWeight] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName("");
    setGender("M");
    setWeight("");
    setBirthdate("");
    setError(null);
  }, [open]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    const normalizedWeight = weight ? Number(weight) : undefined;
    if (weight && Number.isNaN(normalizedWeight)) {
      setError("Weight must be a number");
      return;
    }

    onAdd({
      name: name.trim(),
      weight: normalizedWeight,
      gender,
      birthdate: birthdate || null,
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Add paddler</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Weight (kg)</label>
            <input value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border rounded p-2">
              <option value="M">M</option>
              <option value="F">F</option>
              <option value="O">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Date of birth</label>
            <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="w-full border rounded p-2" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
          <button onClick={handleSubmit} className="px-3 py-1 bg-blue-500 text-white rounded">Add</button>
        </div>
      </div>
    </div>
  );
}
