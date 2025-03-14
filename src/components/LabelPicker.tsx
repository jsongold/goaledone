import React, { useState } from 'react';
import { Plus, X, Edit2, Trash2 } from 'lucide-react';
import { useLabelStore } from '../store/labelStore';

interface LabelPickerProps {
  selectedLabels: string[];
  onLabelsChange: (labelIds: string[]) => void;
  onClose: () => void;
  onApply?: () => void;
}

export function LabelPicker({ selectedLabels, onLabelsChange, onClose, onApply }: LabelPickerProps) {
  const { labels, addLabel, deleteLabel, updateLabel } = useLabelStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#6366F1');
  const [editingLabel, setEditingLabel] = useState<string | null>(null);

  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;

    try {
      await addLabel(newLabelName.trim(), newLabelColor);
      setNewLabelName('');
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create label:', error);
    }
  };

  const handleLabelSelect = (labelId: string) => {
    const newSelection = selectedLabels.includes(labelId)
      ? selectedLabels.filter(id => id !== labelId)
      : [...selectedLabels, labelId];
    onLabelsChange(newSelection);
  };

  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleApply = () => {
    if (onApply) {
      onApply();
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleClickOutside}
    >
      <div className="bg-white rounded-xl p-6 shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Manage Labels</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Label List */}
        <div className="space-y-2 mb-4">
          {labels.map(label => (
            <div
              key={label.id}
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedLabels.includes(label.id)}
                  onChange={() => handleLabelSelect(label.id)}
                  className="rounded text-purple-600"
                />
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: label.color }}
                />
                {editingLabel === label.id ? (
                  <input
                    type="text"
                    value={label.name}
                    onChange={(e) => updateLabel(label.id, { name: e.target.value })}
                    onBlur={() => setEditingLabel(null)}
                    className="border-gray-200 rounded-md px-2 py-1 text-sm"
                    autoFocus
                  />
                ) : (
                  <span>{label.name}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingLabel(label.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteLabel(label.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create New Label Form */}
        {isCreating ? (
          <form onSubmit={handleCreateLabel} className="space-y-4">
            <div>
              <input
                type="text"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="Label name"
                className="w-full border-gray-200 rounded-lg px-3 py-2"
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newLabelColor}
                onChange={(e) => setNewLabelColor(e.target.value)}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Create
              </button>
            </div>
          </form>
        ) : (
          <div className="flex justify-between items-center">
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
            >
              <Plus className="w-5 h-5" />
              <span>Create new label</span>
            </button>
            {onApply && selectedLabels.length > 0 && (
              <button
                onClick={handleApply}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Apply
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}