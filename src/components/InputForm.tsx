import React from 'react';
import { Tag } from 'lucide-react';

interface InputFormProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLabelMode?: boolean;
  onLabelModeToggle?: () => void;
  loading?: boolean;
  error?: string | null;
  placeholder?: string;
  showLabelToggle?: boolean;
}

export function InputForm({
  description,
  onDescriptionChange,
  onSubmit,
  isLabelMode = false,
  onLabelModeToggle,
  loading = false,
  error = null,
  placeholder = "What did you do?",
  showLabelToggle = false,
}: InputFormProps) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-xl p-4 shadow-lg w-80">
      <div className="flex items-center gap-2">
        {showLabelToggle && onLabelModeToggle && (
          <button
            type="button"
            onClick={onLabelModeToggle}
            className={`p-2 rounded-full transition-colors ${
              isLabelMode ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'
            }`}
            title={isLabelMode ? "Switch to description mode" : "Switch to label mode"}
          >
            <Tag className="w-5 h-5" />
          </button>
        )}
        <input
          type="text"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={loading}
          autoFocus
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </form>
  );
}