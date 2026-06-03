import { useEffect, useState } from 'react'
import { LuLayoutDashboard } from "react-icons/lu";
import { VscGraph } from "react-icons/vsc";
import { FaRegUserCircle } from "react-icons/fa";
import { IoCubeOutline } from "react-icons/io5";
import { Button, Collapse, IconButton, List, ListItemButton } from '@mui/material';
import { cn } from '../../lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { HiOutlineDotsVertical } from "react-icons/hi";
import { BiCategory } from "react-icons/bi";
import { RiProductHuntLine } from "react-icons/ri";
import { ImMagicWand } from "react-icons/im";
import { FaRegCalendarAlt } from "react-icons/fa";
import { IoChatboxOutline } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import { PieChart, LineChart, Settings, ChevronRight, ChevronDown } from 'lucide-react';
import "./admin.css";
import { useIsMobile } from '../../hooks/useMobile';
import LogoutDialog from './logoutDialog';
import { SiBloglovin } from "react-icons/si";
import { PiApplePodcastsLogo } from "react-icons/pi";


type NavItem = {
  title: string;
  icon: React.ElementType;
  href?: string;
  subMenu?: NavItem[];
  action?: string;
};

export const navItems: NavItem[] = [
  { title: 'Dashboard', icon: LuLayoutDashboard, href: '/dashboard' },
  { title: 'Orders', icon: IoCubeOutline, href: '/orders' },
  { title: 'Customers', icon: FaRegUserCircle, href: '/customers' },
  {
      title: "Categories",
      icon: BiCategory,
      href: "/categories/manage",
    },
  {
    title: 'Products',
    icon: RiProductHuntLine,
    subMenu: [
      { title: 'All Products', icon: RiProductHuntLine, href: '/products/all' },
      { title: 'Create Product', icon: RiProductHuntLine, href: '/products/create' },
      { title: 'Edit Product', icon: RiProductHuntLine, href: '/products/edit' },
      { title: 'Archived Products', icon: RiProductHuntLine, href: '/products/archived' },
    ],
  },
  { title: 'Blogs', icon: SiBloglovin, href: '/blogs' },
  { title: 'Logo', icon: PiApplePodcastsLogo, href: '/manage-logo' },
  { title: 'Calendar', icon: FaRegCalendarAlt, href: '/calendar2' },
  { title: 'Chat', icon: IoChatboxOutline, href: '/chat' },
  { title: 'AI', icon: ImMagicWand, href: '/agents' },
  { title: 'Performance', icon: LineChart, href: '/underconstruction' },
  { title: 'Analysis', icon: PieChart, href: '/underconstruction' },
  { title: 'Logout', icon: MdLogout, action: 'logout' },
  { title: 'Settings', icon: Settings, href: '/adminsettings' },
];


type SidebarProps = {
  isExpand: boolean;
  toggleExpand: () => void;
  setIsExpand: (value: boolean) => void;
};

const Sidebar = ({ isExpand, toggleExpand, setIsExpand }: SidebarProps) => {
  const location = useLocation().pathname;
  const isMobile = useIsMobile()

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  useEffect(() => {
    if (isMobile) setIsExpand(false);
  }, [isMobile, setIsExpand]);

  const handleSubMenuToggle = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    //<aside className={`${isExpand ? "w-[25%] lg:w-[22%]" : "w-16"} flex flex-col border-r gap-2 transition-all ease-in-out duration-500 bg-sidebar-background h-96 overflow-y-auto sidebar sticky overflow-x-hidden`}>
    // <aside className="flex flex-col overflow-y-auto sticky top-0 h-screen bg-sidebar-background transition-all duration-300">
    <>
      <aside className={cn(
        `${isExpand ? "w-48 lg:w-[18%]" : "w-16"} 
  flex flex-col bg-white transition-all duration-500 
  h-full overflow-y-auto overflow-x-hidden sticky top-0 ad-sidebar-scroll dark:bg-gray-950 border-r border-border`
      )}>

        <header className='flex justify-between items-center relative pt-2'>
          <div className='w-12'>
            <img src="https://th.bing.com/th/id/OIP.GXs2WSLR6jqhqTL_m72kpgHaFP?w=231&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
              className={cn('object-cover block', !isExpand ? "opacity-0 w-0 hidden" : "opacity-100")} />
          </div>
          <IconButton
            onClick={toggleExpand}
            className={cn(
              "absolute right-3 text-sidebar-foreground h-9 w-9 !rounded-md hover:!bg-gray-400",
            )}
          >
            {<ChevronRight className={cn('h-full w-full font-bold dark:text-white', isExpand ? "rotate-180" : "")} />}
          </IconButton>
        </header>

        <hr />

        <nav className="grid gap-1 px-2">
          {navItems.map((item, index) => {
            const isActive = location === item.href;
            const hasSubmenu = !!item.subMenu;
            const isOpen = openIndex === index;
            return (
              <div key={index}>
                <Button
                  component={Link}
                  to={item.action === 'logout' ? location : item.href ?? location}
                  onClick={() => {
                    if (item.action === 'logout') {
                      setLogoutModalOpen(true);
                      return;
                    }
                    if (hasSubmenu) handleSubMenuToggle(index);
                  }}
                  className={cn(
                    'rounded-sm px-3 py-2 transition-colors hover:!bg-gray-300 !text-black group flex items-center justify-between w-full',
                    isActive ? '!bg-gray-300' : '',
                    !isExpand && 'flex items-center justify-center pl-3 pr-0'
                  )}
                >
                  <div className='mr-auto flex gap-3'>
                    <item.icon className={cn("h-5 w-5 shrink-0 group-hover:text-primary self-center text-gray-800 dark:text-gray-50", isActive ? "!text-blue-700" : "",)} />
                    <span className={cn(
                      "transition-opacity duration-200",
                      !isExpand ? "opacity-0 w-0 transition-all duration-500" : "opacity-100 text-[13px] text-[rgba(0,0,0,0.8)] dark:text-gray-50",
                      isActive ? "!text-blue-700" : "",
                    )}>
                      {isExpand ? item.title : ""}
                    </span>
                  </div>
                  {item.subMenu && isExpand && (
                    <span className="ml-auto text-xs text-gray-500">
                      <ChevronDown
                        className={cn('h-full w-full transition-all', hasSubmenu && isOpen ? 'rotate-180' : '')}
                      />
                    </span>
                  )}
                </Button>

                {hasSubmenu && (
                  <Collapse in={isOpen && isExpand} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subMenu!.map((subItem, subIndex) => (
                        <ListItemButton
                          key={subIndex}
                          component={Link}
                          to={subItem.href ?? "#"}
                          sx={{ pl: 4 }}
                          className={cn(
                            "flex items-center gap-3 rounded-sm px-3 py-2 transition-colors hover:!bg-gray-300 !text-black group",
                            isActive
                              ? "bg-gray-300 text-sidebar-accent-foreground"
                              : "text-sidebar-foreground",
                            !isExpand && "flex items-center justify-center pl-3 pr-0"
                          )}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-300 group-hover:bg-gray-800" />
                          <span className='text-[rgba(0,0,0,0.7)] dark:text-gray-100 text-[12px] font-bold'>{subItem.title}</span>
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                )}

              </div>

            );
          })}
        </nav>

        <hr className='mt-2' />

        {/* User Profile Section */}

        <div className='flex justify-between  items-center my-4'>
          <div className='flex items-center gap-4 ml-2'>
            <Button sx={{ width: "35px", height: "35px", borderRadius: "50%", border: "solid red", padding: 0, minWidth: 0 }}>Go</Button>
            {isExpand ? <div>
              <p className="text-sm font-semibold text-gray-800">{"john Doe"}</p>
              <p className="text-xs text-gray-500">{"johndoe@gmail.com"}</p>
            </div> : ""}
          </div>
          {isExpand ? <HiOutlineDotsVertical className='mr-2 h-auto w-auto text-[24px] hover:bg-gray-300 rounded-full p-2 hover:shadow' /> : ""}
        </div>
      </aside>

      {/* Shared Logout Modal */}
      <LogoutDialog open={logoutModalOpen} onOpenChange={setLogoutModalOpen} />
    </>
  )
}

export default Sidebar
