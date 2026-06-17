import DeleteDialog from "./DeleteDialog";

type BulkDeleteProps = {
  selected: (string | number)[];
};

const BulkDelete = ({ selected }: BulkDeleteProps) => {
  return (
    <DeleteDialog
      selectedIds={selected}
      resourceName="customer(s)"
      trigger={
        <button
          disabled={selected.length === 0}
          className="px-3 py-1 bg-red-600 rounded text-white disabled:opacity-50"
        >
          Delete
        </button>
      }
    />
  );
};

export default BulkDelete;
