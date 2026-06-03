import React from "react";
import { RiExpandUpDownFill } from "react-icons/ri";
import { IoCaretDownOutline } from "react-icons/io5";
import { IoCaretUp } from "react-icons/io5";
import { IoCaretUpOutline } from "react-icons/io5";

export interface Column<T> {
  accessor: string;
  label?: string;
  header?: React.ReactNode;
  sortable?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
  headerStyles?: string;
  cellStyles?: string;
}

interface DataTableProps<T> {
  customerColumns: Column<T>[];
  pagedData: T[];
  keyField: keyof T;
  sortField: keyof T | null;
  sortAsc: boolean;
  toggleSort: (field: keyof T) => void;
}

function DataTable<T extends { [key: string]: any }>({
  customerColumns,
  keyField,
  pagedData,
  sortField,
  sortAsc,
  toggleSort,
}: DataTableProps<T>) {


// const getSortIcon = (field: keyof T) => {
//     if (sortField !== field) {
//       return <RiExpandUpDownFill className="inline-block ml-1 text-gray-400" />;
//     }
//     if (sortAsc) {
//       return <IoCaretDownOutline className="inline-block ml-1 transform rotate-180 text-blue-500" />;
//     }
//     return <IoCaretUpOutline className="inline-block ml-1 text-blue-500" />;
//   };


  const getSortIcon = (field: keyof T) => {
  if (sortField !== field) {
    return <RiExpandUpDownFill className="inline-block ml-1 text-gray-400" />;
  }
  if (sortAsc) {
    // Ascending → caret up
    return <IoCaretUpOutline className="inline-block ml-1 text-blue-500" />;
  }
  // Descending → caret down
  return <IoCaretDownOutline className="inline-block ml-1 text-blue-500" />;
};


  return (
    <div className="overflow-auto ">
      <table className="min-w-full border border-solid border-gray-300 text-sm ">
        <thead className="bg-white dark:bg-gray-950 ">
          <tr>
            {customerColumns.map((col) => (
              <th
                key={col.accessor}
                onClick={() => col.sortable && toggleSort(col.accessor as keyof T)}
                className={`px-4 py-2 text-left ${col.sortable ? "cursor-pointer select-none" : ""
                  } ${col.headerStyles ?? ""}`}
              >
                <div className="flex items-center gap-1">
                  {col.header ?? col.label}
                  {/* {col.sortable && sortField === col.accessor && (
                    <span>{sortAsc ? "▲" : "▼"}</span>
                  )} */}
                  {col.sortable && getSortIcon(col.accessor as keyof T)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pagedData.map((row, idx) => (
            <tr
              key={String(row[keyField])}
              className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {customerColumns.map((col) => (
                <td
                  key={col.accessor}
                  className={`px-4 py-2 ${col.cellStyles ?? ""}`}
                >
                  {col.render ? col.render(row, idx) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
