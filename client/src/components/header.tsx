import { Badge, Box, Button, IconButton, TextField } from '@mui/material'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import SearchIcon from '@mui/icons-material/Search';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '../ui/themeToggle';
import SideDrawer from '../ui/drawer';
import LeftMenu from './leftMenu';
import CartSidebar from './cartSidebar';
import Menu from '@mui/material/Menu';
import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/authContext';
import { accountMenu } from '../data/accountMenu';
import { useCart } from '../context/cartContext';
import { useWishlist } from '../context/wishlistContext'; // ✅ new
import { useCategories } from './admin/context/categoryContext';
import { TypeAnimation } from 'react-type-animation';
import SearchBar from './smartSearch';
import { GET } from '../api/api_utility';
import { FaUserCircle } from "react-icons/fa";


const HIDDEN_SLUGS = ["miscellaneous"];
interface Category {
    name: string;
    path: string;
    subcategories: {
        name: string;
        children: string[];
    }[];
}


const Header = () => {
    const [isFocused, setIsFocused] = useState(false);
    const [open, setOpen] = useState(false);
    const [anchor, setAnchor] = useState<'left' | 'right'>('left');
    const [accanchorEl, setAccAnchorEl] = useState<null | HTMLElement>(null);
    const [loginHover, setLoginHover] = useState(false);
    const [logo, setLogo] = useState("");
    const [openSearch, setOpenSearch] = useState(false);
    
    
    const { getCartCount } = useCart();
    const { wishlist } = useWishlist(); // assuming your context exposes `wishlist` array
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const { categories, loading } = useCategories();

    const visibleCategories = categories.filter(
        (cat) => cat.isActive && !HIDDEN_SLUGS.includes(cat.slug) && !cat.parentCategoryId
    ) ?? [];


    const userMenuOpen = Boolean(accanchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAccAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAccAnchorEl(null);
    };

    const toggleDrawer = (newOpen: boolean, side: 'left' | 'right' = "left") => {
        setOpen(newOpen);
        setAnchor(side)
    };

    const leftDrawerList = (
        <Box
            sx={{ width: anchor === "left" ? 250 : 380 }}
            role="presentation"
        // {...(anchor === "left" ? { onClick: () => toggleDrawer(false, anchor) } : {})}
        // onKeyDown={() => toggleDrawer(false, anchor)}
        >
            {anchor === "left" ? <LeftMenu /> : <CartSidebar setOpen={setOpen} />}
        </Box>
    );


    const location = useLocation();
    const isHome = location.pathname === "/";

    const handleLogout = async () => {
        await logout();
        handleClose();
        navigate("/login", { replace: true });
    };

    const userInitial = user?.email?.charAt(0).toUpperCase() ?? "";

    useEffect(() => {
        GET("/api/v1/logos/active").then((res) => {
            setLogo(res.data.logo?.image);
            console.log(res.data)
        });
    }, []);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpenSearch(false);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    return (
        <div className='relative'>
            {/* Top Header */}
            {isHome &&
                <section className="row1 hidden lg:block max-w-8xl bg-gray-600 dark:bg-gray-400 text-muted px-4 py-3 border-b border-border border-solid">
                    <div className="flex flex-col sm:flex-row items-center justify-between lg:w-[95%] w-full mx-auto">
                        <p className="text-sm font-medium">
                            Get up to 50% off new season styles, limited time only
                        </p>

                        <ul className="flex items-center gap-4 mt-2 sm:mt-0">
                            <li>
                                <Link to="#" className="text-inherit hover:text-red-300 text-sm font-medium">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="text-inherit hover:text-red-300 text-sm font-medium">
                                    Order Tracking
                                </Link>
                            </li>
                        </ul>
                    </div>
                </section>
            }

            {/* secondary header */}
            <section className='row2 bg-background border-b border-b-border border-solid'>
                <div className='flex justify-between items-center p-1.5 w-[95%] mx-auto '>
                    {/* ✅ LOGO */}
                    <div className='flex items-center min-w-[380px] cursor-pointer hover:opacity-80 transition'>
                        {logo && (
                            <img
                                src={logo}
                                onClick={() => navigate("/")}
                                className="h-10 sm:h-12 lg:h-14 w-auto object-contain"
                                alt="logo"
                            />
                        )}
                    </div>

                    {/* <div className='col2 w-[40%] bg-slate-300 rounded-[8px] lg:flex items-center justify-between overflow-hidden hidden relative'>
                        {!searchValue && !isFocused && (
                            <div className="absolute left-3 text-gray-500 pointer-events-none">
                                <TypeAnimation
                                    sequence={[
                                        'Search for "fashion"',
                                        1000,
                                        'Search for "electronics"',
                                        1000,
                                        'Search for "groceries"',
                                        1000,
                                        'Search for "footwear"',
                                        1000,
                                        'Search for "wellness"',
                                        1000,
                                        'Search for "bags"',
                                        1000,
                                        'Search for "beauty"',
                                        1000,
                                        'Search for "jewellery"',
                                        1000,
                                    ]}
                                    wrapper="span"
                                    speed={50}
                                    repeat={Infinity}
                                />
                            </div>
                        )}

                        <TextField
                            variant='outlined'
                            size='small'
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className='searchBox border-none text-[35px] w-[90%] focus:outline-none !py-1'
                            placeholder=""
                            InputProps={{
                                sx: {
                                    background: "transparent",
                                    "& fieldset": { border: "none" },
                                    "& input": { padding: "10px 12px" },
                                },
                            }}
                        />

                        <div className='w-[10%] flex items-center justify-center'>
                            <IconButton aria-label="search" className='!text-red'>
                                <SearchIcon className='!text-[28px]' />
                            </IconButton>
                        </div>
                    </div> */}


                    <div className="hidden lg:block w-full max-w-2xl">
                        <SearchBar />
                    </div>

                    <div className='col3 w-[30%] flex justify-center p-4 items-center'>
                        <div className='flex items-center justify-end w-full sm:gap-4 gap-2'>
                            <IconButton
                                onClick={() => setOpenSearch(true)}
                                className="p-1"
                                sx={{ display: { xs: "flex", lg: "none" } }}
                            >
                                <SearchIcon className="!w-6 !h-6  text-muted-foreground" />
                            </IconButton>

                            <IconButton aria-label="favorite" className="!p-2">
                                <Link to={!user? "login" : "myaccount/wishlist"} className="flex items-center justify-center">
                                    <Badge badgeContent={wishlist.length || 0} color="warning">
                                        <FavoriteBorderIcon className="!w-5 lg:!w-6 !h-5 lg:!h-6 text-muted-foreground dark:text-gray-300" />
                                    </Badge>
                                </Link>
                            </IconButton>

                            <IconButton aria-label="cart" onClick={() => toggleDrawer(true, "right")}>
                                <Badge badgeContent={getCartCount} color="warning">
                                    <ShoppingCartCheckoutIcon className='!w-5 lg:!w-6 !h-5 lg:!h-6 text-muted-foreground' />
                                </Badge>
                            </IconButton>
                            <ThemeToggle />
                            {!user ? (
                                <div
                                    className="relative"
                                    onMouseEnter={() => setLoginHover(true)}
                                    onMouseLeave={() => setLoginHover(false)}
                                >
                                    {/* ICON */}
                                    <IconButton
                                        aria-label="account"
                                        onClick={() => navigate("/login")}
                                        className="!rounded-full cursor-pointer"
                                    >
                                        <FaUserCircle className="!w-8 !h-8 text-muted-foreground dark:text-white" />
                                    </IconButton>

                                    {/* DROPDOWN */}
                                    <div
                                        className={`absolute right-0 top-[48px] w-[230px] bg-white dark:bg-gray-800 
    border border-gray-200 dark:border-gray-700 rounded-md shadow-lg 
    transition-all duration-150 z-50
    ${loginHover ? "opacity-100 visible" : "opacity-0 invisible"}`}
                                    >
                                        <div className="flex flex-col py-2 text-gray-800 dark:text-gray-200">

                                            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    New Customer?
                                                </span>

                                                <Link
                                                    to="/signup"
                                                    className="text-sm font-semibold text-red-500 hover:underline"
                                                >
                                                    Sign Up
                                                </Link>
                                            </div>

                                            <Link to="/login" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
                                                My Profile
                                            </Link>

                                            <Link to="/login" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
                                                Orders
                                            </Link>

                                            <Link to="/login" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
                                                Wishlist
                                            </Link>

                                            <Link to="/login" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
                                                Rewards
                                            </Link>

                                            <Link to="/login" className="px-4 py-2 text-red-500 font-semibold hover:underline">
                                                Login
                                            </Link>

                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Avatar / Initial */}
                                    <div
                                        className="flex items-center gap-4 p-2 cursor-pointer"
                                        onClick={handleClick}
                                        aria-controls={userMenuOpen ? "account-menu" : undefined}
                                        aria-haspopup="true"
                                        aria-expanded={userMenuOpen ? "true" : undefined}
                                    >
                                        {user.avatar ? (
                                            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300 dark:border-gray-700">
                                                <img
                                                    src={user.avatar}
                                                    alt="User Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-semibold uppercase">
                                                {userInitial}
                                            </div>
                                        )}
                                    </div>

                                    {/* Account Menu */}
                                    <Menu
                                        anchorEl={accanchorEl}
                                        id="account-menu"
                                        open={userMenuOpen}
                                        onClose={handleClose}
                                        onClick={handleClose}
                                        disableScrollLock
                                        transformOrigin={{ horizontal: "right", vertical: "top" }}
                                        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                                        slotProps={{
                                            paper: {
                                                elevation: 6,
                                                sx: {
                                                    overflow: "hidden",
                                                    mt: 1.5,
                                                    minWidth: 220,
                                                    borderRadius: "12px",
                                                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                                                    bgcolor: "background.paper",
                                                    border: "1px solid",
                                                    borderColor: "divider",
                                                },
                                            },
                                        }}
                                    >
                                        <div className="flex flex-col py-2">

                                            {/* USER INFO */}
                                            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                                <p className="text-sm font-semibold">{user?.email}</p>
                                                <p className="text-xs text-gray-500">Welcome back 👋</p>
                                            </div>

                                            {/* MENU ITEMS */}
                                            {accountMenu.map((item) => (
                                                <Link
                                                    key={item.id}
                                                    to={`/myaccount/${item.path}`}
                                                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                                >
                                                    <span className="text-lg">{item.icon}</span>
                                                    <span className="text-sm font-medium">{item.label}</span>
                                                </Link>
                                            ))}

                                            {/* LOGOUT */}
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 px-4 py-2 mt-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                            >
                                                <FiLogOut />
                                                Logout
                                            </button>
                                        </div>
                                    </Menu>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>


            {/* tertiary header*/}
            <section className='row3 bg-background border-b border-b-border border-solid w-full'>
                <div className='flex justify-between items-center px-2.5 w-[95%] mx-auto min-h-[56px]'>

                    {/* LEFT */}
                    <div className='col1 w-[20%]'>
                        <Button
                            className='flex items-center !text-gray-800 dark:!text-slate-300'
                            onClick={() => toggleDrawer(true, "left")}
                        >
                            <MenuOutlinedIcon className='mr-2' />
                            <span className='hidden lg:flex'>
                                Shop By Category
                                <ExpandMoreOutlinedIcon className='ml-6' />
                            </span>
                        </Button>
                    </div>

                    {/* CENTER */}
                    <div className='col2 w-[60%] justify-center hidden lg:flex'>
                        <ul className="flex items-center gap-3">

                            {!isHome && (
                                <li className="list-none">
                                    <NavLink to="/" className="link">
                                        <Button className='!text-gray-800 dark:!text-gray-100 hover:!text-red-500'>Home</Button>
                                    </NavLink>
                                </li>
                            )}

                            {!loading && visibleCategories.map((category) => (
                                <li key={category._id} className="list-none group relative">

                                    <div className="flex items-center justify-between relative">

                                        {/* LEVEL 0 */}
                                        <Link
                                            to={`/products?catId=${category._id}`}
                                            className="link py-2.5"
                                        >
                                            <Button className="!text-[14px] !font-[500] text-gray-800 dark:text-gray-100 hover:!text-red-500 transition">
                                                {category.name}
                                            </Button>
                                        </Link>

                                        {/* LEVEL 1 */}
                                        {category.children?.length > 0 && (
                                            <div className="absolute left-0 top-[48px] w-[160px] z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-[1] flex flex-col py-2 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-in-out">

                                                <ul className="list-none flex flex-col items-start justify-center w-full">

                                                    {category.children.map((sub) => (
                                                        <div key={sub._id} className="relative group/sub w-full">

                                                            <li className="p-2 capitalize hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition text-gray-800 dark:text-gray-100">

                                                                <Link
                                                                    to={`/products?catId=${sub._id}`}
                                                                    className="w-full"
                                                                >
                                                                    {sub.name}
                                                                </Link>

                                                                {/* LEVEL 2 */}
                                                                {sub.children?.length > 0 && (
                                                                    <div className="absolute left-[158px] top-0 w-[160px] z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-[1] flex flex-col gap-1 py-2 opacity-0 invisible translate-x-4 group-hover/sub:opacity-100 group-hover/sub:visible group-hover/sub:translate-x-0 transition-all duration-300 ease-in-out">

                                                                        <ul className="list-none flex flex-col items-start justify-center gap-1">

                                                                            {sub.children.map((child) => (
                                                                                <li
                                                                                    key={child._id}
                                                                                    className="p-2 capitalize hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer w-full text-[14px] font-[500] text-gray-800 dark:text-gray-100 transition"
                                                                                >
                                                                                    <Link to={`/products?catId=${child._id}`}>
                                                                                        {child.name}
                                                                                    </Link>
                                                                                </li>
                                                                            ))}

                                                                        </ul>
                                                                    </div>
                                                                )}

                                                            </li>
                                                        </div>
                                                    ))}

                                                </ul>
                                            </div>
                                        )}

                                    </div>
                                </li>
                            ))}

                        </ul>
                    </div>

                    {/* RIGHT */}
                    <div className="col3 w-[20%]  text-slate-800 dark:text-slate-300 text-nowrap py-3 lg:py-0 !md:mr-4 items-center pr-4">
                        <span className='text-[14px] lg:text-[16px] flex justify-end '>
                        <RocketLaunchOutlinedIcon className="mr-2" />
                        Super Fast Delivery
                        </span>
                    </div>

                </div>
            </section>

            <SideDrawer open={open} toggleDrawer={toggleDrawer} anchor={anchor} drawerList={leftDrawerList} />

            {openSearch && (
                <div className="fixed inset-0 z-[999] bg-white dark:bg-gray-950 p-4 flex flex-col">

                    {/* TOP BAR */}
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={() => setOpenSearch(false)}
                            className="text-lg"
                        >
                            ←
                        </button>

                        <div className="flex-1">
                            <SearchBar autoFocus closeSearch={() => setOpenSearch(false)} />
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}

export default Header




{/* 
                            | Class       | Visible? | Takes up space? | Interactive? (click/focus) | Animatable?                                       |
| ----------- | -------- | --------------- | -------------------------- | ------------------------------------------------- |
| `opacity-0` | ❌ No     | ✅ Yes           | ✅ Yes                      | ✅ Yes                                             |
| `invisible` | ❌ No     | ✅ Yes           | ❌ No                       | ❌ No (visibility not animatable in most browsers) |
| `hidden`    | ❌ No     | ❌ No            | ❌ No                       | ❌ No                                              |


invisible(tailwind css) =====> visibility: hidden;(css)
hidden(tailwind css) =====> display: none; (css) */}

