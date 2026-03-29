import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logger } from "../../../common/helpers/logger";
import Breadcrumb from "../../../components/basic/Breadcrumb";
import Container from '../../../components/basic/Container';
import DataTable, { Column } from '../../../components/basic/DataTable';
import { useRegattaState } from "../../../context/RegattaContext";
import { useSetupState } from "../../../context/SetupContext";
import useClubs from '../../../hooks/useClubs';
import { clubPaddlersButtonClassName } from '../../../shared/ui/actions';
import { Regatta } from "../../../types/RegattaType";
import ConfigHelper from '../../../utils/ConfigHelper';
import { processFile } from "../../../utils/DataBuilder";
import AddPaddlerModal from "./components/AddPaddlerModal";
import ClubPaddlersModal from "./components/ClubPaddlersModal";
import { Paddler } from "./types";

export default function PaddlerListPage() {
  const { setting: state, setSetting: setState } = useSetupState();
  const { state: regatta, setState: setRegatta, clubId, persistState }: { state: Regatta | null, setState: (next: Regatta | null) => void, clubId?: string | null, persistState: (nextState?: Regatta | null) => Promise<void> } = useRegattaState();
  const { clubs } = useClubs();

  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const [clubModalOpen, setClubModalOpen] = useState(false);
  const [clubPaddlers, setClubPaddlers] = useState<Paddler[]>([]);
  const [clubSelectedIds, setClubSelectedIds] = useState<string[]>([]);
  const [clubSearch, setClubSearch] = useState('');
  const [clubLoading, setClubLoading] = useState(false);
  const hasNavigatedAwayRef = useRef(false);

  const navigate = useNavigate();

  const getRegattaPaddlers = (nextRegatta: Regatta | null | undefined): Paddler[] => {
    if (!nextRegatta?.paddlers) return [];
    if (Array.isArray(nextRegatta.paddlers)) return nextRegatta.paddlers;
    if (typeof nextRegatta.paddlers === 'object') return Object.keys(nextRegatta.paddlers).map(k => nextRegatta.paddlers[k]);
    return [];
  };

  const [paddlersDisplayed, setPaddlersDisplayed] = useState<Paddler[]>(() => {
    return getRegattaPaddlers(regatta);
  });

  useEffect(() => {
    if (regatta?.name) return;
    if (hasNavigatedAwayRef.current) return;

    hasNavigatedAwayRef.current = true;
    navigate('/', {
      replace: true,
      state: {
        message: 'No active regatta was found. Please select or create one first.',
      },
    });
  }, [navigate, regatta?.name]);

  useEffect(() => {
    setPaddlersDisplayed(getRegattaPaddlers(regatta));
  }, [regatta]);

  const filtered = useMemo(() => {
    if (!search) return paddlersDisplayed;
    const q = search.toLowerCase();
    return paddlersDisplayed.filter(p => `${p.name} ${p.id}`.toLowerCase().includes(q));
  }, [paddlersDisplayed, search]);

  const availableClubPaddlers = useMemo(() => {
    const existingIds = new Set((paddlersDisplayed || []).map(p => String(p.id)));
    return (clubPaddlers || []).filter(p => !existingIds.has(String(p.id)));
  }, [clubPaddlers, paddlersDisplayed]);

  const filteredClubPaddlers = useMemo(() => {
    if (!clubSearch) return availableClubPaddlers;
    const q = clubSearch.toLowerCase();
    return availableClubPaddlers.filter(p => `${p.name} ${p.id}`.toLowerCase().includes(q));
  }, [availableClubPaddlers, clubSearch]);

  const openClubPaddlersModal = async () => {
    setError(null);
    setSuccess(null);

    logger.debug('Opening club paddlers modal', { clubId });
    if (!clubId) {
      setError('No club selected. Please select a club first.');
      return;
    }

    setClubLoading(true);
    try {
      const selectedClub = clubs.find(c => String(c.id) === String(clubId));
      const list = (selectedClub?.paddlers || []).map((p: any) => ({
        id: String(p.id),
        name: p.name || '',
        weight: p.weight,
        gender: p.gender,
        birthdate: p.birthdate || null,
      }));
      setClubPaddlers(list);
      setClubSelectedIds([]);
      setClubSearch('');
      setClubModalOpen(true);
    } catch (e) {
      console.debug('Failed to load club paddlers', e);
      setError('Failed to load club paddlers');
    } finally {
      setClubLoading(false);
    }
  };

  const toggleClubPaddler = (id: string) => {
    setClubSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const addSelectedClubPaddlers = () => {
    const selected = clubPaddlers.filter(p => clubSelectedIds.includes(String(p.id)));
    if (!selected.length) {
      setError('Please select at least one paddler');
      return;
    }

    const existingMap = new Map<string, Paddler>(paddlersDisplayed.map(p => [String(p.id), p]));
    selected.forEach(p => {
      if (!existingMap.has(String(p.id))) {
        existingMap.set(String(p.id), p);
      }
    });

    const next = Array.from(existingMap.values());
    setPaddlersDisplayed(next);
    try {
      setRegatta(prev => ({ ...(prev || {}), paddlers: next }));
    } catch (e) {
      console.debug('could not set regatta paddlers', e);
    }

    setClubModalOpen(false);
    setSuccess(`${selected.length} paddler(s) added from club`);
    setError(null);
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const rawPaddlers: any = await processFile(file);
      const paddlersArray: Paddler[] = [];
      let idx = 0;
      const entries = (rawPaddlers && typeof rawPaddlers === 'object') ? Object.values(rawPaddlers) : [];

      entries.forEach((p: any) => {
        idx += 1;
        const id = (p && p.id) ? String(p.id).trim() : idx.toString();
        paddlersArray.push({
          id,
          name: (p && p.name) ? String(p.name).trim() : `Paddler ${idx}`,
          weight: p && p.weight ? Number(p.weight) : undefined,
          gender: p && p.gender ? String(p.gender).trim() : undefined,
          birthdate: p && p.birthdate ? String(p.birthdate) : null,
        });
      });

      if (paddlersArray.length === 0) {
        setError('No paddlers were parsed from the file. Please check the CSV headers and content.');
        setLoading(false);
        return;
      }

      try {
        setRegatta(prev => ({ ...(prev || {}), paddlers: paddlersArray }));
      } catch (e) {
        console.debug('could not set regatta paddlers', e);
      }

      setSuccess(`${paddlersArray.length} paddlers loaded`);
    } catch (e) {
      console.error('Failed to process file', e);
      setError('Failed to parse file');
    } finally {
      setLoading(false);
    }
  };

  const deletePaddler = (id: string) => {
    const remaining = paddlersDisplayed.filter(p => p.id !== id);
    try {
      setRegatta(prev => ({ ...(prev || {}), paddlers: remaining }));
    } catch (e) {
      console.debug('could not update regatta paddlers', e);
    }

    setPaddlersDisplayed(remaining);
    if (state.configTree) {
      const currentMap: any = {};
      remaining.forEach(r => currentMap[r.id] = r);
      setState(prev => ({ ...prev, configTree: ConfigHelper.setPaddlersInNestedConfig(prev.configTree, currentMap) }));
    }
  };

  const handleSave = (updated: any) => {
    if (!updated.name || !String(updated.name).trim()) {
      setError('Name is required');
      return;
    }
    if (updated.weight && Number.isNaN(Number(updated.weight))) {
      setError('Weight must be a number');
      return;
    }

    const next = paddlersDisplayed.map(p => p.id === updated.id ? ({ ...p, ...updated }) : p);
    try {
      setRegatta(prev => ({ ...(prev || {}), paddlers: next }));
    } catch (e) {
      console.debug('could not set regatta paddlers', e);
    }
    setPaddlersDisplayed(next);

    const paddlersMap: any = {};
    next.forEach(p => {
      paddlersMap[p.id] = p;
    });

    setState(prev => ({
      ...prev,
      paddlers: next,
      configTree: prev.configTree ? ConfigHelper.setPaddlersInNestedConfig(prev.configTree, paddlersMap) : prev.configTree,
    }));

    setError(null);
  };

  const clearAll = () => {
    setPaddlersDisplayed([]);
    setFileName(null);
    setState(prev => ({ ...prev, paddlers: [] }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddPaddler = (paddler: any) => {
    const id = paddler.id || `u-${Date.now()}`;
    const newP = {
      id,
      name: paddler.name,
      weight: paddler.weight,
      gender: paddler.gender,
      birthdate: paddler.birthdate || null,
    };

    const next: Paddler[] = [newP, ...paddlersDisplayed];
    try {
      setRegatta(prev => ({ ...(prev || {}), paddlers: next }));
    } catch (e) {
      console.debug('could not set regatta paddlers', e);
    }

    setState(prev => ({
      ...prev,
      paddlers: next,
      configTree: prev.configTree ? ConfigHelper.addPaddlerToNestedConfig(prev.configTree, newP) : prev.configTree,
    }));

    setError(null);
    setAddOpen(false);
  };

  const handleNext = async () => {
    const toSaveTree: any = JSON.parse(JSON.stringify(regatta || {}));

    await persistState(toSaveTree);

    navigate('/category', {
      state: {
        next: '/type',
        from: '/paddlers',
      },
    });
  };

  if (!regatta?.name) {
    return (
      <Container className="py-6">
        <div className="text-sm text-gray-500">Redirecting to home…</div>
      </Container>
    );
  }

  return (
    <Container className="py-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <div className="mb-4 max-w-[900px]">
            <Breadcrumb items={[{ label: 'Home', to: '/' }]} title="Paddler List" backPath={'/'} />
          </div>
          <h1 className="text-2xl font-semibold">Paddler list</h1>
          <p className="text-sm text-gray-500">Set regatta paddlers.</p>
        </div>
      </header>

      <div className="mb-1">
        <div className="flex justify-between gap-3">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 bg-white border rounded px-3 py-2 cursor-pointer text-sm">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                className="hidden"
              />
              <span className="text-sm text-gray-700">Upload from CSV</span>
            </label>
            {fileName && <div className="text-sm text-gray-600">Selected: <span className="font-medium">{fileName}</span></div>}
            <button onClick={clearAll} className="ml-2 px-3 py-1 bg-gray-100 rounded text-sm">Clear</button>
          </div>

          <button onClick={handleNext} className="px-4 py-2 bg-green-500 text-white rounded">Next</button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">{paddlersDisplayed.length} paddler(s)</div>
            {loading && <div className="text-sm text-gray-500">Parsing...</div>}
            {error && <div className="text-sm text-red-600">{error}</div>}
            {success && <div className="text-sm text-green-600">{success}</div>}
          </div>
          <div className="flex items-center gap-2">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or id" className="border rounded px-2 py-1 text-sm" />
            <button onClick={() => setSearch('')} className="px-3 py-1 bg-gray-100 rounded text-sm">Reset</button>
          </div>
        </div>
      </div>

      <div className="my-2 flex items-center gap-2">
        <button onClick={() => setAddOpen(true)} className="px-3 py-1 bg-indigo-500 text-white rounded text-sm">Add paddler</button>
        <button onClick={openClubPaddlersModal} disabled={clubLoading} className={clubPaddlersButtonClassName}>Club paddlers</button>
      </div>

      <div className="mt-4">
        <DataTable
          data={filtered}
          rowKey={'id'}
          columns={[
            { key: 'id', title: 'ID', sortable: true, filterable: true },
            { key: 'name', title: 'Name', editable: true, inputType: 'text', sortable: true, filterable: true },
            { key: 'weight', title: 'Weight (kg)', editable: true, inputType: 'number', sortable: true, filterable: true },
            { key: 'gender', title: 'Gender', editable: true, inputType: 'select', options: [{ value: 'M', label: 'M' }, { value: 'F', label: 'F' }, { value: 'O', label: 'Other' }], sortable: true, filterable: true },
            { key: 'birthdate', title: 'DOB', editable: true, inputType: 'date', sortable: true, filterable: true },
          ] as Column<Paddler>[]}
          onSave={handleSave}
          onDelete={deletePaddler}
        />
      </div>

      <AddPaddlerModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAddPaddler} />

      <ClubPaddlersModal
        open={clubModalOpen}
        search={clubSearch}
        setSearch={setClubSearch}
        selectedIds={clubSelectedIds}
        paddlers={filteredClubPaddlers}
        availableCount={availableClubPaddlers.length}
        onToggle={toggleClubPaddler}
        onClose={() => setClubModalOpen(false)}
        onAddSelected={addSelectedClubPaddlers}
      />
    </Container>
  );
}
