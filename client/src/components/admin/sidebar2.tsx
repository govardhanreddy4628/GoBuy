import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Button,
  Collapse,
  IconButton,
  List,
  ListItemButton,
  Tooltip,
} from "@mui/material";

import { FaRegUserCircle, FaRegCalendarAlt } from "react-icons/fa";
import { LuLayoutDashboard } from "react-icons/lu";
import { IoCubeOutline, IoChatboxOutline } from "react-icons/io5";
import { RiProductHuntLine } from "react-icons/ri";
import { BiCategory } from "react-icons/bi";
import { ImMagicWand } from "react-icons/im";
import { MdLogout } from "react-icons/md";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { SiBloglovin } from "react-icons/si";

import {PieChart,LineChart,Settings,ChevronRight,ChevronDown} from "lucide-react";

import { cn } from "../../lib/utils";
import { useIsMobile } from "../../hooks/useMobile";
import LogoutDialog from "./logoutDialog";

import "./admin.css";

/* ---------------- TYPES ---------------- */

type Role = "SUPER_ADMIN" | "ADMIN";

type NavItem = {
  title: string;
  icon: React.ElementType;
  href?: string;
  subMenu?: NavItem[];
  action?: string;
  roles?: Role[];
};

/* ---------------- NAV CONFIG ---------------- */

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    icon: LuLayoutDashboard,
    href: "/dashboard",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "Orders",
    icon: IoCubeOutline,
    href: "/orders",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "Customers",
    icon: FaRegUserCircle,
    href: "/customers",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "Admins",
    icon: FaRegUserCircle,
    href: "/admins",
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Products",
    icon: RiProductHuntLine,
    roles: ["SUPER_ADMIN", "ADMIN"],
    subMenu: [
      { title: "All Products", icon: RiProductHuntLine, href: "/products/all" },
      { title: "Create Product", icon: RiProductHuntLine, href: "/products/create" },
      { title: "Edit Product", icon: RiProductHuntLine, href: "/products/edit" },
      { title: "Archived Products", icon: RiProductHuntLine, href: "/products/archived" },
    ],
  },
  {
    title: "Categories",
    icon: BiCategory,
    href: "/categories/manage",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  { title: 'Blogs', icon: SiBloglovin, href: '/blogs', roles: ["SUPER_ADMIN", "ADMIN"],},
  {
    title: "Calendar",
    icon: FaRegCalendarAlt,
    href: "/calendar2",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "Chat",
    icon: IoChatboxOutline,
    href: "/chat",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "AI",
    icon: ImMagicWand,
    href: "/agents",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "Performance",
    icon: LineChart,
    href: "/underconstruction",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "Analysis",
    icon: PieChart,
    href: "/underconstruction",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/adminsettings",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "Logout",
    icon: MdLogout,
    action: "logout",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
];

/* ---------------- COMPONENT ---------------- */

type SidebarProps = {
  isExpand: boolean;
  toggleExpand: () => void;
  setIsExpand: (value: boolean) => void;
};

const Sidebar = ({ isExpand, toggleExpand, setIsExpand }: SidebarProps) => {
  const [forceCloseTooltip, setForceCloseTooltip] = useState(false);

  const location = useLocation().pathname;
  const isMobile = useIsMobile();

  const user = {
    role: "SUPER_ADMIN",
    name: "Johnsena",
    email: "john.sena@example.com",
  };

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  /* -------- OPEN SUBMENU IF ROUTE MATCHES (NO AUTO EXPAND) -------- */
  useEffect(() => {
    const index = navItems.findIndex(
      item =>
        item.subMenu &&
        item.subMenu.some(sub => location.startsWith(sub.href ?? ""))
    );

    setOpenIndex(index !== -1 ? index : null);
  }, [location]);

  useEffect(() => {
    if (isMobile) setIsExpand(false);
  }, [isMobile, setIsExpand]);

  const handleSubMenuToggle = (index: number) => {
    if (!isExpand) setIsExpand(true);
    setOpenIndex(prev => (prev === index ? null : index));
  };

  const filteredNavItems = navItems.filter(
    item => !item.roles || item.roles.includes(user.role as Role)
  );

  return (
    <>
      <aside
        className={cn(
          isExpand ? "w-48 lg:w-[18%]" : "w-16",
          "flex flex-col bg-white dark:bg-gray-950 h-full sticky top-0",
          "transition-all duration-500 border-r overflow-y-auto overflow-x-hidden"
        )}
      >
        {/* -------- HEADER -------- */}
        <header className="flex justify-between items-center relative pt-2 px-2">
          {isExpand && (
            <img
              src="https://th.bing.com/th/id/OIP.GXs2WSLR6jqhqTL_m72kpgHaFP?w=231&h=180"
              className="h-10 object-contain"
            />
          )}

          <IconButton onClick={toggleExpand} className="absolute right-2">
            <ChevronRight
              className={cn("transition-transform", isExpand && "rotate-180")}
            />
          </IconButton>
        </header>

        <hr />

        {/* -------- NAV -------- */}
        <nav className="grid gap-1 px-2 mt-1">
          {filteredNavItems.map((item, index) => {
            const hasSubmenu = !!item.subMenu;
            const isOpen = openIndex === index;

            const isSubRouteActive = item.subMenu?.some(sub => location.startsWith(sub.href ?? "")) ?? false;
            const isParentActive = item.href === location || (!isExpand && isSubRouteActive);

            return (
              <div key={item.title}>
                <Button
                  component={Link}
                  to={item.href ?? location}
                  onClick={() => {
                    if (item.action === "logout") {
                      setLogoutModalOpen(true);
                      return;
                    }
                    if (hasSubmenu) {
                      setForceCloseTooltip(true);
                      handleSubMenuToggle(index);
                      setTimeout(() => setForceCloseTooltip(false), 0);
                      return;
                    }

                    if (isMobile) setIsExpand(false);
                  }}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 rounded-sm group hover:!bg-gray-300 !text-black transition-colors",
                    isParentActive && "!bg-gray-300 !text-blue-800",
                    !isExpand && "justify-center pl-3 pr-0"
                  )}
                >
                  <Tooltip
                    key={isExpand ? "expanded" : "collapsed"}
                    title={item.title}
                    placement="right"
                    arrow
                    disableHoverListener={isExpand}
                    disableFocusListener={isExpand}
                    disableTouchListener={isExpand}
                  >

                    <div className="flex gap-3 mr-auto">
                      <item.icon className="h-5 w-5" />
                      {!isMobile && isExpand && (
                        <span className="text-[13px]">{item.title}</span>
                      )}
                    </div>
                  </Tooltip>

                  {hasSubmenu && isExpand && (
                    <ChevronDown
                      className={cn(
                        "transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  )}
                </Button>

                {hasSubmenu && (
                  <Collapse in={isOpen && isExpand} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subMenu!.map(subItem => {
                        const isSubActive = location.startsWith(subItem.href ?? "");

                        return (
                          <ListItemButton
                            key={subItem.title}
                            component={Link}
                            to={subItem.href ?? "#"}
                            sx={{ pl: 4 }}
                            className={cn(
                              "flex items-center gap-3 rounded-sm px-2 py-2 !my-1 !ml-3 transition-colors hover:!bg-gray-300 !text-black group",
                              isSubActive && "!bg-gray-300"
                            )}
                          >
                            <span
                              className={cn("h-1.5 w-1.5 rounded-full group-hover:bg-gray-800",
                                isSubActive ? "bg-gray-800" : "bg-gray-300"
                              )}
                            />
                            <span
                              className={cn("text-[12px] font-bold",
                                isSubActive ? "text-black" : "text-[rgba(0,0,0,0.7)]"
                              )}
                            >
                              {subItem.title}
                            </span>
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </div>
            );
          })}
        </nav>

        <hr className="mt-2" />

        {/* -------- USER -------- */}
        {user && (
          <div className="flex justify-between items-center my-4 px-2">
            <div className="flex items-center gap-3">
              <Button
                sx={{
                  width: 35,
                  height: 35,
                  borderRadius: "50%",
                  minWidth: 0,
                }}
              >
                {user.name?.[0] ?? "U"}
              </Button>

              {isExpand && (
                <div>
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              )}
            </div>

            {isExpand && <HiOutlineDotsVertical />}
          </div>
        )}
      </aside>

      <LogoutDialog open={logoutModalOpen} onOpenChange={setLogoutModalOpen} />
    </>
  );
};

export default Sidebar;
