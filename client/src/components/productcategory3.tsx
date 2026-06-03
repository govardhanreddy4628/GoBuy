
const Productcategory = () => {
  const { cart, handleAdd, handleIncrease, handleDecrease } = useCart();

  
  /* ---------------- RENDER CATEGORY TREE ---------------- */

  const renderCategories = (cats: any[], level = 0) =>
    cats.map((cat) => (
      <div key={cat._id}>
        <div
          className="flex items-center justify-between cursor-pointer"
          style={{ paddingLeft: `${level * 10}px` }}
        >
          <span
            onClick={() => handleCategoryClick(cat._id)}
            className={`text-sm ${
              filters.category === cat._id
                ? "text-red-500 font-medium"
                : "hover:text-red-500"
            }`}
          >
            {cat.name}
          </span>

          {cat.subcategories?.length > 0 && (
            <IconButton
              onClick={() =>
                setExpanded((prev) => ({
                  ...prev,
                  [cat._id]: !prev[cat._id],
                }))
              }
              size="small"
            >
              <FaAngleRight
                className={`transition-transform duration-200 ${
                  expanded[cat._id] ? "rotate-90" : ""
                }`}
              />
            </IconButton>
          )}
        </div>

        {expanded[cat._id] &&
          cat.subcategories?.length > 0 &&
          renderCategories(cat.subcategories, level + 1)}
      </div>
    ));
};
