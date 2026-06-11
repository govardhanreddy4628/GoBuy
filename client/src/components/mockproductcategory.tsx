import React, { useState } from 'react'
import { FaAngleDown } from "react-icons/fa6";
import { IoExpand, IoMenuSharp } from "react-icons/io5";
import { IoGridSharp } from "react-icons/io5";
import Checkbox from '@mui/material/Checkbox';
import Slider from '@mui/material/Slider';
import { Button, IconButton, Typography } from '@mui/material';
import { FaRegHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import FormControlLabel from '@mui/material/FormControlLabel';


interface productsData {
    id: number;
    name: string;
    price: number;
    rating: number;
}
const productsData: productsData[] = [
    { id: 1, name: "Apple", price: 150, rating: 4.5 },
    { id: 2, name: "Banana", price: 50, rating: 3.8 },
    { id: 3, name: "Orange", price: 100, rating: 4.2 },
    { id: 4, name: "Grapes", price: 120, rating: 4.0 },
];

interface sortLabels {
    "": string;
    "name-asc": string;
    "name-desc": string;
    "price-asc": string;
    "price-desc": string;
}
const sortLabels: sortLabels = {
    "": "None",
    "name-asc": "Name, A-Z",
    "name-desc": "Name, Z-A",
    "price-asc": "Price, Low to High",
    "price-desc": "Price, High to Low",
};

const ratingRanges = {
    1: [1.0, 2.0],
    2: [2.0, 3.0],
    3: [3.0, 4.0],
    4: [4.0, 5.1], // end at 5.1 to include 5.0
};


const MockProductcategory = () => {
    const [isCategoryScrollExpand, setIsCategoryScrollExpand] = useState(true)
    const [isGrid, setIsGrid] = useState(true)
    const [filters, setFilters] = useState({
        rating: [] as number[],
        categories: [] as string[],
        priceRange: [100, 60000] as [number, number],
    });

    const [sortOption, setSortOption] = useState("");

    const handleCategoryFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFilters(prev => {
            const categories = checked
                ? prev.categories.includes(value)
                    ? prev.categories // already exists, do nothing
                    : [...prev.categories, value] // add new
                : prev.categories.filter(c => c !== value); // remove unchecked

            return {
                ...prev,
                categories,
            };
        });
    };


    const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const star = parseInt(e.target.value, 10); // value from checkbox is string by default
        const { checked } = e.target;
        setFilters(prev => {
            const newRating = checked
                ? prev.rating.includes(star)
                    ? prev.rating
                    : [...prev.rating, star]
                : prev.rating.filter(r => r !== star);

            return {
                ...prev,
                rating: newRating,
            };
        });
    };



    const handlePriceSliderChange = (_: Event, newValue: number | number[]) => {
        setFilters(prev => ({
            ...prev,
            priceRange: newValue as [number, number],
        }));
    };


    const filteredProducts = [...productsData]          // spread it because thougn filter doesn't mutate array but sort mutates array
        .filter(product => {
            if (filters.rating.length === 0) return true;
            return filters.rating.some(rating => {
                const [min, max] = ratingRanges[rating as 1 | 2 | 3 | 4];
                return product.rating >= min && product.rating < max;
            });
        })
        .filter(
            (product) => product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
        )
        .sort((a, b) => {
            switch (sortOption) {
                case "name-asc":
                    return a.name.localeCompare(b.name);
                case "name-desc":
                    return b.name.localeCompare(a.name);
                case "price-asc":
                    return a.price - b.price;
                case "price-desc":
                    return b.price - a.price;
                default:
                    return 0;
            }
        });

    console.log(filteredProducts)

    function valuetext(value: number) {
        return `₹${value}`;
    }

    return (

        <section className='bg-white'>
            <section className='flex w-[96%] mx-auto bg-white'>

                <aside className='col1 lg:w-[16%] sm:w-[30%] w-full relative'>

                    <div className='flex items-center justify-between bg-white pt-5 pb-1'>
                        <h3 className='text-[16px] font-medium text-gray-700'>Shop By Category</h3>
                        <IconButton onClick={() => setIsCategoryScrollExpand(!isCategoryScrollExpand)} className='!w-8 !h-8'> <FaAngleDown className={isCategoryScrollExpand ? "" : "rotate-180 transition-all duration-300"} /></IconButton>
                    </div>

                    <div
                        className="transition-all duration-700 overflow-y-scroll flex flex-col"
                        style={{
                            maxHeight: isCategoryScrollExpand ? '200px' : '0px',
                            paddingTop: isCategoryScrollExpand ? '0.5rem' : '0',
                            paddingBottom: isCategoryScrollExpand ? '0.5rem' : '0',
                        }}
                    >
                        {[
                            "Fashion",
                            "Electronics",
                            "Bags",
                            "Footware",
                            "Groceries",
                            "Beauty",
                            "Wellness",
                            "Jewellery",
                        ].map((category) => (
                            <FormControlLabel
                                key={category}
                                control={
                                    <Checkbox
                                        checked={filters.categories.includes(category)}
                                        value={category}
                                        onChange={(e) => handleCategoryFilterChange(e)}
                                        color="primary"
                                        size="small"
                                        sx={{
                                            color: 'gray', // icon color when unchecked
                                            '&.Mui-checked': {
                                                color: '#cd4f4f', // color when checked
                                            },
                                        }}
                                    />
                                }
                                label={category}
                            />
                        ))}
                    </div>


                    <div className='max-w-[260px] py-4'>
                        <h1 className='text-[16px] font-medium text-gray-700 mb-2'>Filter By Price</h1>
                        <Slider
                            getAriaLabel={() => 'Price range'}
                            value={filters.priceRange}
                            onChange={handlePriceSliderChange}
                            valueLabelDisplay="auto"
                            getAriaValueText={valuetext}
                            size="medium"
                            min={100}
                            step={100}
                            max={30000}
                            className='!w-[90%] !ml-4'
                        />

                        <div className='flex items-center justify-between'>
                            <p className='text-[rgba(0,0,0,0.5)]'>From:<span className='font-bold text-[rgba(0,0,0,0.8)]'>{filters.priceRange[0]}</span></p>
                            <p className='text-[rgba(0,0,0,0.5)]'>To:<span className='font-bold text-[rgba(0,0,0,0.8)]'>{filters.priceRange[1]}</span></p>
                        </div>

                    </div>

                    <div className="mt-2">
                        <h1 className='text-[16px] font-medium text-gray-700 mb-2'>Filter By Rating</h1>
                        <div>
                            {[5, 4, 3, 2, 1].map((star, index) => (
                                <FormControlLabel
                                    key={index}
                                    control={
                                        <Checkbox
                                            checked={filters.rating.includes(star)}
                                            onChange={(e) => handleRatingChange(e)}
                                            color="primary"
                                            size="small"
                                            value={star}
                                            sx={{
                                                color: 'gray', // icon color when unchecked
                                                '&.Mui-checked': {
                                                    color: '#cd4f4f', // color when checked
                                                },
                                            }}
                                        />
                                    }
                                    label={"★".repeat(star)}
                                    className="!block text-yellow-500 text-lg"
                                />
                            ))}
                        </div>
                    </div>


                    <div className='flex items-center justify-center p-4 h-4vh absolute bottom-0 left-0 w-full'>
                        <Button
                            onClick={() => setFilters({ rating: [], categories: [], priceRange: [0, 1000] })}
                            variant="outlined"
                            color="secondary"
                        >
                            Clear Filters
                        </Button>
                    </div>
                </aside>



                <div className='col2 sm:w-[70%] lg:w-[84%] w-full px-4 py-2 flex flex-col h-screen overflow-auto'>
                    <div className='flex items-center justify-between bg-[#f4f4f4] p-2 my-4'>
                        <div className='flex items-center gap-4'>
                            <IconButton onClick={() => setIsGrid(true)}>
                                <IoGridSharp className={`${isGrid ? "text-red-500" : ""}`} />
                            </IconButton>
                            <IconButton onClick={() => setIsGrid(false)}>
                                <IoMenuSharp className={`${isGrid ? "" : "text-red-500"}`} />
                            </IconButton>
                            <h2>There are 23 products.</h2>
                        </div>

                        <div className='flex items-center justify-end gap-4 mr-2 '>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body1">Sort By:</Typography>

                                <FormControl size="small" sx={{ minWidth: 180 }}>
                                    <Select
                                        value={sortOption}
                                        onChange={(e) => setSortOption(e.target.value)}
                                        sx={{
                                            backgroundColor: "white",
                                            paddingX: 1,
                                            border: "none",
                                            height: 40, // <-- Stabilizes layout height
                                            display: 'flex',
                                            alignItems: 'center', // <-- Aligns text vertically
                                            '& .MuiSelect-select': {
                                                padding: '6px 8px',
                                            },
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'transparent', // default border
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'transparent', // remove blue on focus
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'transparent', // remove hover border
                                            },
                                        }}
                                        displayEmpty
                                        renderValue={(selected) => {
                                            if (!selected) {
                                                return "None";
                                            }
                                            return sortLabels[selected] || "None";
                                        }}
                                    >
                                        <MenuItem value="">None</MenuItem>
                                        <MenuItem value="name-asc">Name, (A To Z)</MenuItem>
                                        <MenuItem value="name-desc">Name, (Z To A)</MenuItem>
                                        <MenuItem value="price-asc">Price, (Low To High)</MenuItem>
                                        <MenuItem value="price-desc">Price, (High To Low)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </div>
                    </div>


                    {filteredProducts.map(() => (<></>))}



                    <div className={`grid  gap-2 ${isGrid ? "grid-cols-1 lg:grid-cols-5 flex-nowrap" : "grid-cols-1 "}`} >
                        <div className={`productcard bg-white border border-gray-200 shadow-md rounded-md flex ${isGrid ? "flex-col" : "flex-row bg-[#f4f4f4]"} items-center relative overflow-hidden h-auto`}>
                            <div className={`bg-white flex items-center justify-center border-1 border-gray-200 relative group h-full ${isGrid ? "h-auto" : " w-[36%] m-3"} h-auto`}>
                                <Link to="/" className={`w-full ${isGrid ? "h-[200px]" : "h-[380px] rounded-md"} relative overflow-hidden`}>
                                    <img src="https://serviceapi.spicezgold.com/download/1742463096955_hbhb1.jpg" className=' opacity-100 hover:opacity-0 transition duration-500 ' />
                                    <img src="https://serviceapi.spicezgold.com/download/1742463096956_hbhb2.jpg" className=' absolute top-[0px] left-[0px] opacity-0  group-hover:scale-105 group-hover:opacity-100 group-hover:z-50 transition duration-500' />
                                </Link>
                                <div className='bg-red-400 rounded-md absolute left-[10px] top-[10px] text-[14px] px-2 py-1 z-50'>10%</div>
                                <div className="absolute right-[10px] -top-[100%] flex flex-col gap-[5px] p-1 transition-all z-50 duration-400 group-hover:top-[10px]">
                                    <div className='h-[35px] w-[35px] rounded-full bg-white  flex items-center justify-center hover:bg-red-500 hover:text-white transition-all'><IoExpand /></div>
                                    <div className='h-[35px] w-[35px] rounded-full bg-white flex items-center justify-center hover:bg-red-500 hover:text-white transition-all'><FaRegHeart /></div>
                                    <div className='h-[35px] w-[35px] rounded-full bg-white flex items-center justify-center hover:bg-red-500 hover:text-white transition-all'><FaRegHeart /></div>
                                </div>
                            </div>

                            <div className={`info flex flex-col ${isGrid ? "" : "pr-10 gap-2"} w-full p-3 items-start`}>
                                <h6 className='text-[18px] font-[200] uppercase mt-2'><Link to="/" className='link'>CLAFOUTIS</Link></h6>
                                <h3 className={`${isGrid ? "text-[14px]" : "text-[24px] my-4"} font-[500] text-gray-600 leading-[20px] mt-2 text-[rgba(0,0,0,0.9)] transition-all`}><Link to="/" className='link'>Description of the product goes here.</Link></h3>
                                {isGrid ? "" : <p className='leading-6'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos explicabo laborum minus sunt, a velit? Totam quis ad, dignissimos dolores blanditiis soluta nobis eius nostrum beatae asperiores eos repudiandae omnis!</p>}
                                <div className='flex items-center justify-between gap-5 w-full'>
                                    <p className='text-[18px] font-bold line-through'>$99.99</p>
                                    <p className='text-[18px] font-bold text-red-400'>$99.99</p>
                                </div>
                                <Button className='flex !w-[180px] !border-[1.5px] !border-solid !border-red-400 !bg-inherit !text-red-400 gap-3 !my-2 hover:!text-white hover:!bg-black hover:!border-black'><ShoppingCartCheckoutIcon /> ADD TO CART</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </section>
    )
}

export default MockProductcategory;
