import React from "react";
import { Input } from "@/components/ui/input";

interface ContactListFieldProps {
  field: {
    key: string;
    label: string;
    desc?: string;
    fields: Array<{
      key: string;
      label: string;
    }>;
  };
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

export const ContactListField: React.FC<ContactListFieldProps> = ({
  field,
  value = {},
  onChange,
  disabled = false,
}) => {
  const handleContactChange = (contactKey: string, contactValue: string) => {
    onChange({
      ...value,
      [contactKey]: contactValue,
    });
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold mb-1 text-gray-800">
        {field.label}
      </label>
      {field.desc && (
        <div className="text-xs text-gray-600 mb-3 italic">{field.desc}</div>
      )}
      
      <div className="space-y-3 border border-gray-300 rounded-lg p-4 bg-gray-50">
        {field.fields.map((contactField) => (
          <div key={contactField.key}>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              {contactField.label}:
            </label>
            <Input
              type="text"
              disabled={disabled}
              className={`w-full ${disabled ? "bg-gray-100" : ""}`}
              placeholder={disabled ? "" : `Contoh: Nama (0812...)`}
              value={value[contactField.key] || ""}
              onChange={(e) => handleContactChange(contactField.key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
