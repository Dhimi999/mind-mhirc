import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

interface NumberedListFieldProps {
  field: {
    key: string;
    label: string;
    desc?: string;
    validation?: {
      minItems?: number;
      maxItems?: number;
    };
  };
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export const NumberedListField: React.FC<NumberedListFieldProps> = ({
  field,
  value = [],
  onChange,
  disabled = false,
}) => {
  const handleAddItem = () => {
    onChange([...value, ""]);
  };

  const handleRemoveItem = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const handleItemChange = (index: number, text: string) => {
    const newValue = [...value];
    newValue[index] = text;
    onChange(newValue);
  };

  const minItems = field.validation?.minItems || 0;
  const maxItems = field.validation?.maxItems || 20;
  const canAdd = value.length < maxItems;
  const canRemove = value.length > minItems;

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold mb-1 text-gray-800">
        {field.label}
      </label>
      {field.desc && (
        <div className="text-xs text-gray-600 mb-2 italic">{field.desc}</div>
      )}
      
      {(minItems > 0 || maxItems < 20) && (
        <div className="text-xs text-gray-500 mb-2">
          {minItems > 0 && `Minimal ${minItems} item`}
          {minItems > 0 && maxItems < 20 && " • "}
          {maxItems < 20 && `Maksimal ${maxItems} item`}
        </div>
      )}

      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center bg-teal-600 text-white rounded font-semibold text-sm">
              {index + 1}
            </div>
            <Input
              type="text"
              disabled={disabled}
              className={`flex-1 ${disabled ? "bg-gray-100" : ""}`}
              placeholder={disabled ? "" : `Item ${index + 1}`}
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
            />
            {!disabled && canRemove && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveItem(index)}
                className="flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        
        {!disabled && canAdd && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            className="w-full border-dashed border-2 border-teal-300 text-teal-600 hover:bg-teal-50"
          >
            <Plus className="h-4 w-4 mr-1" />
            Tambah Item
          </Button>
        )}
      </div>
    </div>
  );
};
