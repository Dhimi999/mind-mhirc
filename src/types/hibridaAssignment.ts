// Type definitions for Hibrida Naratif CBT Assignment Fields

export type FieldType = 
  | 'textarea'
  | 'boolean'
  | 'nested-textarea'
  | 'checkbox-multiple'
  | 'contact-list'
  | 'numbered-list'
  | 'table-builder'
  | 'repeatable-card';

export interface BaseField {
  key: string;
  label: string;
  desc?: string;
  required?: boolean;
}

export interface TextareaField extends BaseField {
  type: "textarea";
  placeholder?: string;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
  };
}

export interface BooleanField extends BaseField {
  type: "boolean";
  validation?: {
    required?: boolean;
  };
}

export interface NestedTextareaField extends BaseField {
  type: 'nested-textarea';
  subFields: Array<{
    key: string;
    label: string;
    desc?: string;
  }>;
}

export interface CheckboxMultipleField extends BaseField {
  type: 'checkbox-multiple';
  options: string[];
  allowOther?: boolean;
  otherLabel?: string;
  validation?: {
    minSelected?: number;
    maxSelected?: number;
  };
}

export interface ContactListField extends BaseField {
  type: 'contact-list';
  fields: Array<{
    key: string;
    label: string;
  }>;
}

export interface NumberedListField extends BaseField {
  type: 'numbered-list';
  validation?: {
    minItems?: number;
    maxItems?: number;
  };
}

export interface TableBuilderField extends BaseField {
  type: 'table-builder';
  columns: Array<{
    key: string;
    label: string;
  }>;
  validation?: {
    minRows?: number;
    maxRows?: number;
  };
}

export interface RepeatableCardField extends BaseField {
  type: 'repeatable-card';
  cardLabel: string;
  validation?: {
    minCards?: number;
    maxCards?: number;
  };
  cardFields: Array<{
    key: string;
    label: string;
    type: 'textarea' | 'text';
  }>;
}

export type AssignmentField = 
  | TextareaField
  | BooleanField
  | NestedTextareaField
  | CheckboxMultipleField
  | ContactListField
  | NumberedListField
  | TableBuilderField
  | RepeatableCardField;

export interface SessionConfig {
  title: string;
  assignmentFields: AssignmentField[];
  defaultAssignment?: any;
  tips?: string[];
  guideDesc?: string;
}
