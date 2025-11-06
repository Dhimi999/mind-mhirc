import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

interface TableBuilderFieldProps {
  field: {
    key: string;
    label: string;
    desc?: string;
    columns: Array<{
      key: string;
      label: string;
    }>;
    validation?: {
      minRows?: number;
      maxRows?: number;
    };
  };
  value: any[];
  onChange: (value: any[]) => void;
  disabled?: boolean;
}

export const TableBuilderField: React.FC<TableBuilderFieldProps> = ({
  field,
  value = [],
  onChange,
  disabled = false,
}) => {
  const handleAddRow = () => {
    const newRow: any = {};
    field.columns.forEach(col => {
      newRow[col.key] = "";
    });
    onChange([...value, newRow]);
  };

  const handleRemoveRow = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const handleCellChange = (rowIndex: number, columnKey: string, text: string) => {
    const newValue = [...value];
    newValue[rowIndex] = {
      ...newValue[rowIndex],
      [columnKey]: text,
    };
    onChange(newValue);
  };

  const minRows = field.validation?.minRows || 0;
  const maxRows = field.validation?.maxRows || 10;
  const canAdd = value.length < maxRows;
  const canRemove = value.length > minRows;

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold mb-1 text-gray-800">
        {field.label}
      </label>
      {field.desc && (
        <div className="text-xs text-gray-600 mb-2 italic">{field.desc}</div>
      )}
      
      {(minRows > 0 || maxRows < 10) && (
        <div className="text-xs text-gray-500 mb-2">
          {minRows > 0 && `Minimal ${minRows} baris`}
          {minRows > 0 && maxRows < 10 && " • "}
          {maxRows < 10 && `Maksimal ${maxRows} baris`}
        </div>
      )}

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid gap-2 p-3 bg-teal-600 text-white font-semibold text-sm"
          style={{ gridTemplateColumns: `repeat(${field.columns.length}, 1fr) ${!disabled ? '40px' : ''}` }}>
          {field.columns.map((col) => (
            <div key={col.key}>{col.label}</div>
          ))}
          {!disabled && <div></div>}
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-200">
          {value.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-2 p-3 bg-white hover:bg-gray-50"
              style={{ gridTemplateColumns: `repeat(${field.columns.length}, 1fr) ${!disabled ? '40px' : ''}` }}
            >
              {field.columns.map((col) => (
                <Textarea
                  key={col.key}
                  rows={2}
                  disabled={disabled}
                  className={`text-sm resize-none ${disabled ? "bg-gray-100" : ""}`}
                  placeholder={disabled ? "" : col.label}
                  value={row[col.key] || ""}
                  onChange={(e) => handleCellChange(rowIndex, col.key, e.target.value)}
                />
              ))}
              {!disabled && canRemove && (
                <div className="flex items-center justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveRow(rowIndex)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Row Button */}
        {!disabled && canAdd && (
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRow}
              className="w-full border-dashed border-2 border-teal-300 text-teal-600 hover:bg-teal-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Tambah Baris
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
