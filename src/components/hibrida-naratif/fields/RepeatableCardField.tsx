import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

interface RepeatableCardFieldProps {
  field: {
    key: string;
    label: string;
    desc?: string;
    cardFields: Array<{
      key: string;
      label: string;
      placeholder?: string;
    }>;
    validation?: {
      minCards?: number;
      maxCards?: number;
    };
  };
  value: any[];
  onChange: (value: any[]) => void;
  disabled?: boolean;
}

export const RepeatableCardField: React.FC<RepeatableCardFieldProps> = ({
  field,
  value = [],
  onChange,
  disabled = false,
}) => {
  const handleAddCard = () => {
    const newCard: any = {};
    field.cardFields.forEach(cf => {
      newCard[cf.key] = "";
    });
    onChange([...value, newCard]);
  };

  const handleRemoveCard = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const handleCardFieldChange = (cardIndex: number, fieldKey: string, text: string) => {
    const newValue = [...value];
    newValue[cardIndex] = {
      ...newValue[cardIndex],
      [fieldKey]: text,
    };
    onChange(newValue);
  };

  const minCards = field.validation?.minCards || 0;
  const maxCards = field.validation?.maxCards || 10;
  const canAdd = value.length < maxCards;
  const canRemove = value.length > minCards;

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold mb-1 text-gray-800">
        {field.label}
      </label>
      {field.desc && (
        <div className="text-xs text-gray-600 mb-2 italic">{field.desc}</div>
      )}
      
      {(minCards > 0 || maxCards < 10) && (
        <div className="text-xs text-gray-500 mb-2">
          {minCards > 0 && `Minimal ${minCards} kartu`}
          {minCards > 0 && maxCards < 10 && " • "}
          {maxCards < 10 && `Maksimal ${maxCards} kartu`}
        </div>
      )}

      <div className="space-y-4">
        {value.map((card, cardIndex) => (
          <div
            key={cardIndex}
            className="border border-teal-300 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-teal-700">
                Kartu {cardIndex + 1}
              </div>
              {!disabled && canRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCard(cardIndex)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Hapus
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {field.cardFields.map((cf) => (
                <div key={cf.key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {cf.label}
                  </label>
                  <Textarea
                    rows={3}
                    disabled={disabled}
                    className={`text-sm resize-none ${disabled ? "bg-gray-100" : ""}`}
                    placeholder={disabled ? "" : (cf.placeholder || cf.label)}
                    value={card[cf.key] || ""}
                    onChange={(e) =>
                      handleCardFieldChange(cardIndex, cf.key, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Card Button */}
      {!disabled && canAdd && (
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddCard}
            className="w-full border-dashed border-2 border-teal-300 text-teal-600 hover:bg-teal-50"
          >
            <Plus className="h-4 w-4 mr-1" />
            Tambah Kartu
          </Button>
        </div>
      )}
    </div>
  );
};
