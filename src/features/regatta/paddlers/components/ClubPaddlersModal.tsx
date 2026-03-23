import { Paddler } from "../types";

type Props = {
  open: boolean;
  search: string;
  setSearch: (value: string) => void;
  selectedIds: string[];
  paddlers: Paddler[];
  availableCount: number;
  onToggle: (id: string) => void;
  onClose: () => void;
  onAddSelected: () => void;
};

export default function ClubPaddlersModal({
  open,
  search,
  setSearch,
  selectedIds,
  paddlers,
  availableCount,
  onToggle,
  onClose,
  onAddSelected,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Club paddlers</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search club paddlers by name or id"
            className="border rounded px-2 py-1 text-sm w-full"
          />
          <button onClick={() => setSearch("")} className="px-3 py-1 bg-gray-100 rounded text-sm">Reset</button>
        </div>

        <div className="text-sm text-gray-600 mb-2">
          {selectedIds.length} selected • {paddlers.length} shown • {availableCount} available
        </div>

        <div className="border rounded overflow-auto flex-1">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="text-left px-3 py-2 w-10"></th>
                <th className="text-left px-3 py-2">ID</th>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">Weight</th>
                <th className="text-left px-3 py-2">Gender</th>
              </tr>
            </thead>
            <tbody>
              {paddlers.map((p) => (
                <tr key={`club-p-${p.id}`} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(String(p.id))}
                      onChange={() => onToggle(String(p.id))}
                    />
                  </td>
                  <td className="px-3 py-2">{p.id}</td>
                  <td className="px-3 py-2">{p.name}</td>
                  <td className="px-3 py-2">{p.weight ?? ""}</td>
                  <td className="px-3 py-2">{p.gender ?? ""}</td>
                </tr>
              ))}
              {paddlers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-gray-500">No available paddlers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 bg-gray-100 rounded">Cancel</button>
          <button onClick={onAddSelected} className="px-3 py-1 bg-blue-600 text-white rounded">Add selected</button>
        </div>
      </div>
    </div>
  );
}
