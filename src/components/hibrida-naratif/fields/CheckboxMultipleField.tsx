import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface CheckboxMultipleFieldProps {
  field: {
    key: string;
    label: string;
    desc?: string;
    options: string[];
    allowOther?: boolean;
    otherLabel?: string;
    validation?: {
      minSelected?: number;
      maxSelected?: number;
    };
  };
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

export const CheckboxMultipleField: React.FC<CheckboxMultipleFieldProps> = ({
  field,
  value = { selected: [], other: "" },
  onChange,
  disabled = false,
}) => {
  const handleCheckboxChange = (option: string, checked: boolean) => {
    const currentSelected = value.selected || [];
    const newSelected = checked
      ? [...currentSelected, option]
      : currentSelected.filter((item: string) => item !== option);
    
    onChange({
      ...value,
      selected: newSelected,
    });
  };

  const handleOtherChange = (text: string) => {
    onChange({
      ...value,
      other: text,
    });
  };

  const selectedCount = (value.selected || []).length;
  const hasOther = field.allowOther && typeof value.other === 'string' && value.other.trim() !== '';
  const totalCount = selectedCount + (hasOther ? 1 : 0);
  const minSelected = field.validation?.minSelected;
  const maxSelected = field.validation?.maxSelected;

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold mb-1 text-gray-800">
        {field.label}
      </label>
      {field.desc && (
        <div className="text-xs text-gray-600 mb-2 italic">{field.desc}</div>
      )}
      
      {(minSelected || maxSelected) && (
        <div className="text-xs text-gray-500 mb-2">
          {minSelected && `Minimal pilih ${minSelected} opsi`}
          {minSelected && maxSelected && " • "}
          {maxSelected && `Maksimal pilih ${maxSelected} opsi`}
          {!disabled && (
            <span className="ml-2 font-medium">
              (Dipilih: {totalCount})
            </span>
          )}
        </div>
      )}

      <div className="space-y-2 border border-gray-300 rounded-lg p-4 bg-gray-50">
        {field.options.map((option) => {
          const isChecked = (value.selected || []).includes(option);
          const isMaxReached = maxSelected && selectedCount >= maxSelected && !isChecked;
          
          return (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`${field.key}-${option}`}
                checked={isChecked}
                onCheckedChange={(checked) => handleCheckboxChange(option, checked as boolean)}
                disabled={disabled || isMaxReached}
              />
              <label
                htmlFor={`${field.key}-${option}`}
                className={`text-sm cursor-pointer ${
                  disabled || isMaxReached ? "text-gray-400" : "text-gray-700"
                }`}
              >
                {option}
              </label>
            </div>
          );
        })}
        
        {field.allowOther && (
          <div className="pt-2 border-t border-gray-300">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              {field.otherLabel || "Lainnya"}:
            </label>
            <Input
              type="text"
              disabled={disabled}
              className={`w-full ${disabled ? "bg-gray-100" : ""}`}
              placeholder={disabled ? "" : "Tuliskan jawaban lain..."}
              value={value.other || ""}
              onChange={(e) => handleOtherChange(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
