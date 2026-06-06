import React, { useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { useCategories } from "./admin/context/categoryContext";
import ProductsSlider from "./productsSlider";


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const CategoryTabs = ({ handleClickOpen, handleOpenAiChat }: { handleClickOpen: (product: any) => void; handleOpenAiChat: (product: any) => void }) => {
  const { categories, loading } = useCategories();
  const [value, setValue] = useState(0);

  if (loading || categories.length === 0) return null;

  // ✅ Only root categories
  const rootCategories = categories.filter(
    (cat) => !cat.parentCategoryId
  );

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <section className="bg-white w-full dark:bg-gray-900">
      <div className="mx-auto flex items-center justify-between">
        <div className="flex flex-col w-full">

          {/* 🔹 HEADER + TABS ROW (same as before) */}
          <Box
            sx={{ width: "95%" }}
            className="w-full flex justify-between items-center mx-auto pt-4"
          >
            {/* Left: Heading */}
            <div className="flex flex-col justify-start">
              <h1 className="text-[24px] font-bold">Popular Products</h1>
              <p className="text-[14px]">
                Do not miss the current offers until the end of March.
              </p>
            </div>

            {/* Right: Tabs */}
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="Category Tabs"
              variant="scrollable"
              scrollButtons
              allowScrollButtonsMobile
            >
              {rootCategories.map((cat, index) => (
                <Tab
                  key={cat._id}
                  label={cat.name}
                  id={`simple-tab-${index}`}
                  className="dark:!text-gray-300"
                />
              ))}
            </Tabs>
          </Box>

          {/* 🔹 TAB CONTENT */}
          <Box sx={{ width: "100%" }}>
            {rootCategories.map((cat, index) => (
              <CustomTabPanel key={cat._id} value={value} index={index}>
                <ProductsSlider
                  categorySlug={cat.slug}
                  handleClickOpen={handleClickOpen}
                  handleOpenAiChat={handleOpenAiChat}
                />
              </CustomTabPanel>
            ))}
          </Box>

        </div>
      </div>
    </section>
  );
};

export default CategoryTabs;
