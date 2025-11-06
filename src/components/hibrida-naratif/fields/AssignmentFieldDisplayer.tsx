import React from "react";
import type { AssignmentField } from "@/types/hibridaAssignment";

interface AssignmentFieldDisplayerProps {
  field: AssignmentField;
  value: any;
}

export const AssignmentFieldDisplayer: React.FC<AssignmentFieldDisplayerProps> = ({
  field,
  value,
}) => {
  // Handle null/undefined values
  if (value === null || value === undefined) {
    return (
      <div className="mb-4">
        <div className="text-sm font-semibold text-gray-800 mb-1">{field.label}</div>
        {field.desc && <div className="text-xs text-gray-500 mb-2 italic">{field.desc}</div>}
        <div className="text-sm text-gray-400 italic">Tidak ada jawaban</div>
      </div>
    );
  }

  switch (field.type) {
    case "textarea":
      return (
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-800 mb-1">{field.label}</div>
          {field.desc && <div className="text-xs text-gray-500 mb-2 italic">{field.desc}</div>}
          <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded p-3 border border-gray-200">
            {value || <span className="text-gray-400 italic">Tidak ada jawaban</span>}
          </div>
        </div>
      );

    case "boolean":
      return (
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-800 mb-1">{field.label}</div>
          {field.desc && <div className="text-xs text-gray-500 mb-2 italic">{field.desc}</div>}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
            {value === true ? "✓ Ya" : value === false ? "✗ Tidak" : "Tidak dijawab"}
          </div>
        </div>
      );

    case "nested-textarea":
      return (
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-800 mb-1">{field.label}</div>
          {field.desc && <div className="text-xs text-gray-500 mb-2 italic">{field.desc}</div>}
          <div className="space-y-3 bg-gray-50 rounded p-3 border border-gray-200">
            {field.subFields?.map((subField) => (
              <div key={subField.key}>
                <div className="text-xs font-semibold text-teal-700 mb-1 uppercase">
                  {subField.label}:
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {value?.[subField.key] || <span className="text-gray-400 italic">Tidak ada jawaban</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "checkbox-multiple":
      return (
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-800 mb-1">{field.label}</div>
          {field.desc && <div className="text-xs text-gray-500 mb-2 italic">{field.desc}</div>}
          <div className="bg-gray-50 rounded p-3 border border-gray-200">
            {value?.selected && Array.isArray(value.selected) && value.selected.length > 0 ? (
              <>
                <div className="text-xs font-semibold text-gray-600 mb-2">Dipilih:</div>
                <ul className="list-disc pl-5 space-y-1">
                  {value.selected.map((item: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-700">{item}</li>
                  ))}
                </ul>
                {value.other && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-xs font-semibold text-gray-600">Lainnya: </span>
                    <span className="text-sm text-gray-700">{value.other}</span>
                  </div>
                )}
              </>
            ) : (
              <span className="text-sm text-gray-400 italic">Tidak ada pilihan</span>
            )}
          </div>
        </div>
      );

    case "contact-list":
      return (
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-800 mb-1">{field.label}</div>
          {field.desc && <div className="text-xs text-gray-500 mb-2 italic">{field.desc}</div>}
          <div className="space-y-2 bg-gray-50 rounded p-3 border border-gray-200">
            {field.fields?.map((contact) => (
              <div key={contact.key} className="flex items-start gap-2">
                <div className="text-xs font-semibold text-teal-700 min-w-[120px]">
                  {contact.label}:
                </div>
                <div className="text-sm text-gray-700 flex-1">
                  {value?.[contact.key] || <span className="text-gray-400 italic">Tidak diisi</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "numbered-list":
      return (
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-800 mb-1">{field.label}</div>
          {field.desc && <div className="text-xs text-gray-500 mb-2 italic">{field.desc}</div>}
          <div className="bg-gray-50 rounded p-3 border border-gray-200">
            {Array.isArray(value) && value.length > 0 ? (
              <ol className="list-decimal pl-5 space-y-1">
                {value.map((item: string, idx: number) => (
                  <li key={idx} className="text-sm text-gray-700">{item}</li>
                ))}
              </ol>
            ) : (
              <span className="text-sm text-gray-400 italic">Tidak ada item</span>
            )}
          </div>
        </div>
      );

    case "table-builder":
      return (
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-800 mb-1">{field.label}</div>
          {field.desc && <div className="text-xs text-gray-500 mb-2 italic">{field.desc}</div>}
          {Array.isArray(value) && value.length > 0 ? (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-teal-600 text-white">
                    <th className="px-3 py-2 text-left text-xs font-semibold">#</th>
                    {field.columns?.map((col) => (
                      <th key={col.key} className="px-3 py-2 text-left text-xs font-semibold">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {value.map((row: any, rowIdx: number) => (
                    <tr key={rowIdx} className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-3 py-2 text-xs text-gray-500 font-medium">{rowIdx + 1}</td>
                      {field.columns?.map((col) => (
                        <td key={col.key} className="px-3 py-2 text-gray-700 whitespace-pre-wrap">
                          {row[col.key] || <span className="text-gray-400 italic text-xs">-</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-gray-400 italic bg-gray-50 rounded p-3 border border-gray-200">
              Tidak ada data
            </div>
          )}
        </div>
      );

    case "repeatable-card":
      return (
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-800 mb-1">{field.label}</div>
          {field.desc && <div className="text-xs text-gray-500 mb-2 italic">{field.desc}</div>}
          {Array.isArray(value) && value.length > 0 ? (
            <div className="space-y-3">
              {value.map((card: any, cardIdx: number) => (
                <div
                  key={cardIdx}
                  className="border border-teal-200 rounded-lg p-4 bg-gradient-to-br from-white to-teal-50 shadow-sm"
                >
                  <div className="text-sm font-semibold text-teal-700 mb-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-teal-600 text-white rounded-full text-xs">
                      {cardIdx + 1}
                    </span>
                    Kartu {cardIdx + 1}
                  </div>
                  <div className="space-y-2">
                    {field.cardFields?.map((cardField) => (
                      <div key={cardField.key}>
                        <div className="text-xs font-semibold text-gray-600 mb-0.5">
                          {cardField.label}:
                        </div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap pl-2 border-l-2 border-teal-300">
                          {card[cardField.key] || <span className="text-gray-400 italic">Tidak diisi</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400 italic bg-gray-50 rounded p-3 border border-gray-200">
              Tidak ada kartu
            </div>
          )}
        </div>
      );

    default:
      // Exhaustive check - this should never be reached
      const _exhaustiveCheck: never = field;
      return (
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-800 mb-1">Unknown Field Type</div>
          <div className="text-sm text-gray-700 bg-gray-50 rounded p-3 border border-gray-200">
            {typeof value === 'string' || typeof value === 'number' ? (
              String(value)
            ) : (
              <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
            )}
          </div>
        </div>
      );
  }
};
