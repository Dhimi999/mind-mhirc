import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { NestedTextareaField } from "./NestedTextareaField";
import { CheckboxMultipleField } from "./CheckboxMultipleField";
import { ContactListField } from "./ContactListField";
import { NumberedListField } from "./NumberedListField";
import { TableBuilderField } from "./TableBuilderField";
import { RepeatableCardField } from "./RepeatableCardField";
import type { AssignmentField } from "@/types/hibridaAssignment";

interface AssignmentFieldRendererProps {
  field: AssignmentField;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

export const AssignmentFieldRenderer: React.FC<AssignmentFieldRendererProps> = ({
  field,
  value,
  onChange,
  disabled = false,
}) => {
  // Normalize value based on field type
  const normalizeValue = (fieldType: string, currentValue: any): any => {
    if (currentValue !== undefined && currentValue !== null) return currentValue;
    
    switch (fieldType) {
      case "textarea":
        return "";
      case "boolean":
        return false;
      case "nested-textarea":
        return {};
      case "checkbox-multiple":
        return { selected: [], other: "" };
      case "contact-list":
        return {};
      case "numbered-list":
        return [];
      case "table-builder":
        return [];
      case "repeatable-card":
        return [];
      default:
        return "";
    }
  };

  const normalizedValue = normalizeValue(field.type, value);

  switch (field.type) {
    case "textarea":
      return (
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-1 text-gray-800">
            {field.label}
            {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.desc && (
            <div className="text-xs text-gray-600 mb-2 italic">{field.desc}</div>
          )}
          <Textarea
            rows={4}
            disabled={disabled}
            className={`text-sm resize-none ${disabled ? "bg-gray-100" : ""}`}
            placeholder={disabled ? "" : (field.placeholder || field.label)}
            value={normalizedValue}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case "boolean":
      return (
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-1 text-gray-800">
            {field.label}
            {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.desc && (
            <div className="text-xs text-gray-600 mb-2 italic">{field.desc}</div>
          )}
          <div className="flex gap-3">
            <Button
              type="button"
              disabled={disabled}
              variant={normalizedValue === true ? "default" : "outline"}
              className={normalizedValue === true ? "bg-teal-600 hover:bg-teal-700" : ""}
              onClick={() => !disabled && onChange(true)}
            >
              Ya
            </Button>
            <Button
              type="button"
              disabled={disabled}
              variant={normalizedValue === false ? "default" : "outline"}
              className={normalizedValue === false ? "bg-teal-600 hover:bg-teal-700" : ""}
              onClick={() => !disabled && onChange(false)}
            >
              Tidak
            </Button>
          </div>
        </div>
      );

    case "nested-textarea":
      return (
        <NestedTextareaField
          field={field}
          value={normalizedValue}
          onChange={onChange}
          disabled={disabled}
        />
      );

    case "checkbox-multiple":
      return (
        <CheckboxMultipleField
          field={field}
          value={normalizedValue}
          onChange={onChange}
          disabled={disabled}
        />
      );

    case "contact-list":
      return (
        <ContactListField
          field={field}
          value={normalizedValue}
          onChange={onChange}
          disabled={disabled}
        />
      );

    case "numbered-list":
      return (
        <NumberedListField
          field={field}
          value={normalizedValue}
          onChange={onChange}
          disabled={disabled}
        />
      );

    case "table-builder":
      return (
        <TableBuilderField
          field={field}
          value={normalizedValue}
          onChange={onChange}
          disabled={disabled}
        />
      );

    case "repeatable-card":
      return (
        <RepeatableCardField
          field={field}
          value={normalizedValue}
          onChange={onChange}
          disabled={disabled}
        />
      );

    default:
      return (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded">
          <p className="text-sm text-red-700">
            Unsupported field type: {(field as any).type}
          </p>
        </div>
      );
  }
};
