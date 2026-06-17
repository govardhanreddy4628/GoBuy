import React, { useEffect, useMemo, useState } from 'react';
import Actions from './Actions';
import ActionModal from './ActionModal';
import AddCustomerButton from './AddCustomerButton';
import SearchBar from '../table/SearchBar';
import BulkDelete from '../table/BulkDelete';
import BulkExport from '../table/BulkExport';
import RowsPerPage from '../table/RowsPerPage';
// import Table from './table';
import DataTable, { Column } from "./dataTable";
import { useCustomers } from '../context/customerContext';
import { formatDate } from '../utils/formatDate';
import { Customer } from '../types/customers';
//import useDebouncedValue from "../table/useDebouncedSearch";

const CustomersTable: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [selected, setSelected] = useState<Customer["id"][]>([]);
    const [sortField, setSortField] = useState<keyof Customer | null>(null);
    const [sortAsc, setSortAsc] = useState(true);
    const [actionType, setActionType] = useState<'add' | 'edit' | 'view' | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedCustomerForAction, setSelectedCustomerForAction] = useState<Customer | null>(null);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);
    const { customers, loading, addCustomer, updateCustomer, fetchCustomers } = useCustomers();

    // const debouncedSearch = useDebouncedValue(searchTerm, 300);

    //   const filtered = useMemo(() => {
    //     const term = debouncedSearch.toLowerCase();
    //     return customers.filter(
    //     (c) =>
    //       c.name.toLowerCase().includes(term) ||
    //       c.email.toLowerCase().includes(term) ||
    //       c.phone.toLowerCase().includes(term)
    //   );
    //   }, [customers, debouncedSearch]);


    useEffect(() => {
        const term = searchTerm.toLowerCase();
        const filtered = customers.filter(
            (c) =>
                c.name.toLowerCase().includes(term) ||
                c.email.toLowerCase().includes(term) ||
                c.phone.toLowerCase().includes(term)
        );
        setFilteredCustomers(filtered);
        //setCurrentPage(1); // reset to first page when filtering
    }, [searchTerm, customers]);

    const closeModal = () => {
        setShowModal(false);
        setSelectedCustomerForAction(null);
    };

    // const handleFormSubmit = (customer: Customer) => {
    //     setCustomers((prev) => {
    //         const exists = prev.find((c) => c.id === customer.id);
    //         if (exists) {
    //             // Update
    //             return prev.map((c) => (c.id === customer.id ? customer : c));
    //         } else {
    //             // Add
    //             return [...prev, customer];
    //         }
    //     });
    //     closeModal();
    // };

    const handleFormSubmit = async (customer: Customer) => {
        if (customer.id) {
            await updateCustomer(customer.id, customer);
        } else {
            await addCustomer(customer);
        }
        closeModal();
    };

    // Sorting
    const sortedData = useMemo(() => {
        if (!sortField) return [...filteredCustomers];
        return [...filteredCustomers].sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];
            if (typeof aVal === "number" && typeof bVal === "number") {
                return sortAsc ? aVal - bVal : bVal - aVal;
            }
            return sortAsc
                ? String(aVal).localeCompare(String(bVal))
                : String(bVal).localeCompare(String(aVal));
        });
    }, [filteredCustomers, sortField, sortAsc]);

    const toggleSort = (field: keyof Customer) => {
        if (sortField === field) {
            if (sortAsc) {
                // currently ascending → switch to descending
                setSortAsc(false);
            } else {
                // currently descending → reset sorting
                setSortField(null);
            }
        } else {
            // new field → ascending sort
            setSortField(field);
            setSortAsc(true);
        }
    };


    // Calculate total pages, handle "All"
    const totalPages = rowsPerPage === -1 ? 1 : Math.ceil(sortedData.length / rowsPerPage);

    // Paginate data
    const pagedData = rowsPerPage === -1 ? sortedData : sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    // Select all on current page
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelected((prev) => [
                ...new Set([...prev, ...pagedData.map((c) => c.id)]),
            ]);
        } else {
            setSelected((prev) => prev.filter((id) => !pagedData.some((c) => c.id === id)));
        }
    };


    // Select/deselect individual row on click or Select/deselect multiple rows on click with shift 
    const handleSelectRow = (
        id: Customer["id"],
        index: number,
        shiftKey: boolean,
        checked: boolean
    ) => {
        if (shiftKey && lastClickedIndex !== null) {
            const start = Math.min(lastClickedIndex, index);
            const end = Math.max(lastClickedIndex, index);

            const idsInRange = pagedData
                .slice(start, end + 1)
                .map((c) => c.id);

            setSelected((prev) => {
                if (checked) {
                    return Array.from(new Set([...prev, ...idsInRange]));
                }
                return prev.filter((rowId) => !idsInRange.includes(rowId));
            });
        } else {
            setSelected((prev) => {
                if (checked) {
                    return prev.includes(id) ? prev : [...prev, id];
                }
                return prev.filter((i) => i !== id);
            });
        }

        setLastClickedIndex(index); // ✅ ALWAYS update
    };

    const highlightMatch = (text: string, query: string) => {
        if (!query) return text;

        const regex = new RegExp(`(${query})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <strong key={i} className="text-black dark:text-white font-semibold">
                    {part}
                </strong>
            ) : (
                part
            )
        );
    };

    const customerColumns: Column<Customer>[] = [
        {
            accessor: "select",
            header: (
                <input
                    type="checkbox"
                    aria-label="Select all customers on current page"
                    checked={
                        pagedData.length > 0 &&
                        pagedData.every((c) => selected.includes(c.id))
                    }
                    onChange={handleSelectAll}
                />
            ),
            render: (cust, idx) => (
                <input
                    type="checkbox"
                    checked={selected.includes(cust.id)}
                    onClick={(e) =>
                        handleSelectRow(
                            cust.id,
                            idx,
                            (e as React.MouseEvent<HTMLInputElement>).shiftKey,
                            (e.target as HTMLInputElement).checked
                        )
                    }
                    aria-label={`Select customer ${cust.name}`}
                />
            ),
            headerStyles: "px-4 py-2",
        },
        {
            accessor: "avatar",
            label: "Avatar",
            render: (cust) => (
                <img
                    src={cust.avatar}
                    alt={cust.name}
                    className="w-8 h-8 rounded-full object-cover"
                />
            ),
            cellStyles: " mt-1 flex items-center justify-center",
        },
        {
            accessor: "name",
            label: "Name",
            render: (cust) => highlightMatch(cust.name, searchTerm),
            headerStyles: "px-4 py-2 text-left",
            cellStyles: "text-nowrap min-w-44",
        },
        { accessor: "email", label: "Email", render: (cust) => highlightMatch(cust.email, searchTerm) },
        { accessor: "phone", label: "Phone", render: (cust) => highlightMatch(String(cust.phone ?? ""), searchTerm), cellStyles: "whitespace-nowrap text-sm" },
        { accessor: "joined", label: "Joined", render: (cust) => highlightMatch(formatDate(cust.joined), searchTerm), cellStyles: "text-nowrap min-w-36" },
        { accessor: "orders", label: "Orders", sortable: true, render: (cust) => cust.orders, cellStyles: "text-nowrap min-w-24", },
        { accessor: "totalSpend", label: "Total Spend", sortable: true, render: (cust) => `₹${cust.totalSpend?.toFixed(2)}`, cellStyles: "text-nowrap min-w-36", },
        { accessor: "lastOrder", label: "Last Order", render: (cust) => formatDate(cust.lastOrder), cellStyles: "text-nowrap min-w-24", },
        {
            accessor: "status",
            label: "Status",
            render: (cust) => (
                <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded ${cust.status === "Active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                >
                    {cust.status}
                </span>
            ),
        },
        {
            accessor: "actions",
            label: "Actions",
            render: (cust) => (
                <Actions
                    cust={cust}
                    setActionType={setActionType}
                    setSelectedCustomer={setSelectedCustomerForAction}
                    setShowModal={setShowModal}
                    onDeleted={fetchCustomers}
                />
            ),
        },
    ];

    if (loading) return <div className='w-full h-screen flex items-center justify-center'>Loading...</div>;

    return (
        <div className="p-6 text-gray-900 dark:text-gray-100">

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">All Customers</h1>
                <AddCustomerButton setShowModal={setShowModal} setActionType={setActionType} setSelectedCustomer={setSelectedCustomerForAction} />
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center mb-4">
                <div className='flex gap-4 flex-1'>
                    <BulkDelete selected={selected} />
                    <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </div>

                <div className="flex items-center gap-3">
                    <RowsPerPage rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} setCurrentPage={setCurrentPage} setSelected={setSelected} />
                    <BulkExport selected={selected} filteredCustomers={filteredCustomers} />
                </div>
            </div>


            {/* Table */}
            {/* <Table pagedData={pagedData} selected={selected} handleSelectAll={handleSelectAll} toggleSort={toggleSort} sortField={sortField} filteredCustomers={filteredCustomers} highlightMatch={highlightMatch} handleSelectRow={handleSelectRow} searchTerm={searchTerm} sortAsc={sortAsc} setActionType={setActionType} setSelectedCustomer={setSelectedCustomer} setShowModal /> */}

            <DataTable<Customer>
                customerColumns={customerColumns}
                keyField="id"
                pagedData={pagedData}
                toggleSort={toggleSort}
                sortField={sortField}
                sortAsc={sortAsc}
            />

            {/* Modal with Form */}
            <ActionModal actionType={actionType} showModal={showModal} setShowModal={setShowModal} selectedCustomer={selectedCustomerForAction} handleFormSubmit={handleFormSubmit} />

            {rowsPerPage !== -1 && (
                <div className="flex justify-between items-center mt-4 text-gray-700 dark:text-gray-300">
                    <p className="text-sm">
                        Showing {(currentPage - 1) * rowsPerPage + 1}-
                        {Math.min(currentPage * rowsPerPage, filteredCustomers.length)} of {filteredCustomers.length}
                    </p>

                    <div className="space-x-2 flex items-center">
                        {/* Prev Button */}
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600"
                        >
                            Prev
                        </button>

                        {
                            (() => {
                                const pages = [];
                                //const totalPageButtons = 5; // max page buttons (excluding first/last/... if shown)
                                const showLeftEllipsis = currentPage > 3;
                                const showRightEllipsis = currentPage < totalPages - 2;

                                // Always show first page
                                pages.push(
                                    <button
                                        key={1}
                                        onClick={() => setCurrentPage(1)}
                                        className={`px-3 py-1 border rounded dark:border-gray-600 ${currentPage === 1 ? 'bg-blue-600 text-white' : ''}`}
                                    >
                                        1
                                    </button>
                                );

                                // Left Ellipsis
                                if (showLeftEllipsis) {
                                    pages.push(
                                        <span key="left-ellipsis" className="px-2">
                                            ...
                                        </span>
                                    );
                                }

                                // Middle Page Buttons
                                let start = Math.max(2, currentPage - 1);
                                let end = Math.min(totalPages - 1, currentPage + 1);

                                if (!showLeftEllipsis) {
                                    start = 2;
                                    end = 4;
                                }

                                if (!showRightEllipsis) {
                                    start = totalPages - 3;
                                    end = totalPages - 1;
                                }

                                start = Math.max(start, 2);
                                end = Math.min(end, totalPages - 1);

                                for (let i = start; i <= end; i++) {
                                    pages.push(
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i)}
                                            className={`px-3 py-1 border rounded dark:border-gray-600 ${currentPage === i ? 'bg-blue-600 text-white' : ''}`}
                                        >
                                            {i}
                                        </button>
                                    );
                                }

                                // Right Ellipsis
                                if (showRightEllipsis) {
                                    pages.push(
                                        <span key="right-ellipsis" className="px-2">
                                            ...
                                        </span>
                                    );
                                }

                                // Always show last page if more than one
                                if (totalPages > 1) {
                                    pages.push(
                                        <button
                                            key={totalPages}
                                            onClick={() => setCurrentPage(totalPages)}
                                            className={`px-3 py-1 border rounded dark:border-gray-600 ${currentPage === totalPages ? 'bg-blue-600 text-white' : ''}`}
                                        >
                                            {totalPages}
                                        </button>
                                    );
                                }

                                return pages;
                            })()
                        }

                        {/* Next Button */}
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CustomersTable;
