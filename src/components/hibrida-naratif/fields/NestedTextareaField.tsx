import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface NestedTextareaFieldProps {
  field: {
    key: string;
    label: string;
    desc?: string;
    subFields: Array<{
      key: string;
      label: string;
      desc?: string;
    }>;
  };
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

export const NestedTextareaField: React.FC<NestedTextareaFieldProps> = ({
  field,
  value = {},
  onChange,
  disabled = false,
}) => {
  const handleSubFieldChange = (subKey: string, subValue: string) => {
    onChange({
      ...value,
      [subKey]: subValue,
    });
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold mb-3 text-gray-800">
        {field.label}
      </label>
      {field.desc && (
        <div className="text-xs text-gray-600 mb-4 italic">{field.desc}</div>
      )}
      
      <div className="space-y-4">
        {field.subFields.map((subField) => (
          <div key={subField.key} className="pl-4 border-l-2 border-gray-300">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              {subField.label}
            </label>
            {subField.desc && (
              <div className="text-xs text-gray-500 mb-2">{subField.desc}</div>
            )}
            <Textarea
              rows={4}
              disabled={disabled}
              className={`w-full rounded-lg border p-3 text-sm transition-colors ${
                disabled
                  ? "border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
                  : "border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white"
              }`}
              placeholder={disabled ? "" : `Tuliskan jawaban Anda di sini...`}
              value={value[subField.key] || ""}
              onChange={(e) => handleSubFieldChange(subField.key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
