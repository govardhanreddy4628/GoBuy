// import { useEffect, useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { Collapse, IconButton, Tooltip } from "@mui/material";

// import {
//   LuLayoutDashboard,
// } from "react-icons/lu";
// import {
//   IoCubeOutline,
//   IoChatboxOutline,
// } from "react-icons/io5";
// import { RiProductHuntLine } from "react-icons/ri";
// import { BiCategory } from "react-icons/bi";
// import { FaRegUserCircle, FaRegCalendarAlt } from "react-icons/fa";
// import { ImMagicWand } from "react-icons/im";
// import { MdLogout } from "react-icons/md";
// import { HiOutlineDotsVertical } from "react-icons/hi";

// import {
//   ChevronRight,
//   ChevronDown,
//   LineChart,
//   PieChart,
//   Settings,
// } from "lucide-react";

// import { cn } from "../../lib/utils";
// import { useIsMobile } from "../../hooks/useMobile";
// import LogoutDialog from "./logoutDialog";

// /* ---------------- NAV ---------------- */

// const navItems = [
//   { title: "Dashboard", icon: LuLayoutDashboard, href: "/dashboard" },
//   { title: "Orders", icon: IoCubeOutline, href: "/orders" },
//   { title: "Customers", icon: FaRegUserCircle, href: "/customers" },
//   {
//     title: "Products",
//     icon: RiProductHuntLine,
//     subMenu: [
//       { title: "All Products", href: "/products/all" },
//       { title: "Create Product", href: "/products/create" },
//     ],
//   },
//   { title: "Categories", icon: BiCategory, href: "/categories/manage" },
//   { title: "Calendar", icon: FaRegCalendarAlt, href: "/calendar2" },
//   { title: "Chat", icon: IoChatboxOutline, href: "/chat" },
//   { title: "AI", icon: ImMagicWand, href: "/agents" },
//   { title: "Performance", icon: LineChart, href: "#" },
//   { title: "Analysis", icon: PieChart, href: "#" },
//   { title: "Settings", icon: Settings, href: "/adminsettings" },
//   { title: "Logout", icon: MdLogout, action: "logout" },
// ];

// /* ---------------- COMPONENT ---------------- */

// export default function Sidebar({
//   isExpand,
//   toggleExpand,
//   setIsExpand,
// }: any) {
//   const location = useLocation().pathname;
//   const isMobile = useIsMobile();

//   const [openIndex, setOpenIndex] = useState<number | null>(null);
//   const [logoutOpen, setLogoutOpen] = useState(false);

//   /* AUTO OPEN SUBMENU */
//   useEffect(() => {
//     const index = navItems.findIndex(item =>
//       item.subMenu?.some(sub =>
//         location.startsWith(sub.href)
//       )
//     );
//     setOpenIndex(index !== -1 ? index : null);
//   }, [location]);

//   /* MOBILE DEFAULT COLLAPSE */
//   useEffect(() => {
//     if (isMobile) setIsExpand(false);
//   }, [isMobile]);

//   const handleToggle = (i: number) => {
//     if (!isExpand) setIsExpand(true);
//     setOpenIndex(prev => (prev === i ? null : i));
//   };

//   return (
//     <>
//       {/* MOBILE OVERLAY */}
//       {isMobile && isExpand && (
//         <div
//           className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
//           onClick={() => setIsExpand(false)}
//         />
//       )}

//       {/* SIDEBAR */}
//       <aside
//         className={cn(
//           "bg-white border-r flex flex-col transition-all duration-300 z-50",

//           // width
//           isExpand ? "w-60" : "w-16",

//           // ✅ DESKTOP/TABLET → normal flow (NO OVERLAP)
//           !isMobile && "relative h-full",

//           // ✅ MOBILE → overlay mode
//           isMobile &&
//             "fixed top-0 left-0 h-screen",
//         )}
//       >
//         {/* HEADER */}
//         <div className="flex items-center justify-between px-3 h-14 border-b">
//           {isExpand && <span className="font-semibold">Admin</span>}

//           <IconButton onClick={toggleExpand}>
//             <ChevronRight
//               className={cn(
//                 "transition-transform",
//                 isExpand && "rotate-180"
//               )}
//             />
//           </IconButton>
//         </div>

//         {/* NAV */}
//         <div className="flex-1 overflow-y-auto p-2 space-y-1">
//           {navItems.map((item, i) => {
//             const active = item.href === location;
//             const subActive =
//               item.subMenu?.some(sub =>
//                 location.startsWith(sub.href)
//               ) ?? false;

//             const isOpen = openIndex === i;

//             return (
//               <div key={item.title}>
//                 <Tooltip
//                   title={!isExpand ? item.title : ""}
//                   placement="right"
//                   arrow
//                 >
//                   <div
//                     onClick={() => {
//                       if (item.action === "logout") {
//                         setLogoutOpen(true);
//                         return;
//                       }

//                       if (item.subMenu) {
//                         handleToggle(i);
//                         return;
//                       }

//                       if (item.href) {
//                         window.location.href = item.href;
//                       }

//                       if (isMobile) setIsExpand(false);
//                     }}
//                     className={cn(
//                       "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition",

//                       active || subActive
//                         ? "bg-gray-900 text-white"
//                         : "text-gray-600 hover:bg-gray-100",

//                       !isExpand && "justify-center"
//                     )}
//                   >
//                     <item.icon />

//                     {isExpand && (
//                       <span className="text-sm flex-1">
//                         {item.title}
//                       </span>
//                     )}

//                     {item.subMenu && isExpand && (
//                       <ChevronDown
//                         className={cn(
//                           isOpen && "rotate-180"
//                         )}
//                       />
//                     )}
//                   </div>
//                 </Tooltip>

//                 {/* SUBMENU */}
//                 {item.subMenu && (
//                   <Collapse in={isOpen && isExpand}>
//                     <div className="ml-9 mt-1 space-y-1">
//                       {item.subMenu.map(sub => {
//                         const isActive = location.startsWith(
//                           sub.href
//                         );

//                         return (
//                           <Link
//                             key={sub.title}
//                             to={sub.href}
//                             onClick={() => {
//                               if (isMobile) setIsExpand(false);
//                             }}
//                             className={cn(
//                               "block text-sm px-3 py-1 rounded-md",
//                               isActive
//                                 ? "bg-gray-200 text-black font-medium"
//                                 : "text-gray-500 hover:text-black"
//                             )}
//                           >
//                             {sub.title}
//                           </Link>
//                         );
//                       })}
//                     </div>
//                   </Collapse>
//                 )}
//               </div>
//             );
//           })}
//         </div>

//         {/* USER */}
//         <div className="border-t p-3 flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
//               J
//             </div>

//             {isExpand && (
//               <div className="text-sm">
//                 <p className="font-medium">John</p>
//                 <p className="text-gray-500 text-xs">
//                   admin@mail.com
//                 </p>
//               </div>
//             )}
//           </div>

//           {isExpand && <HiOutlineDotsVertical />}
//         </div>
//       </aside>

//       <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
//     </>
//   );
// }






import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Collapse, IconButton, Tooltip } from "@mui/material";

import { LuLayoutDashboard } from "react-icons/lu";
import { IoCubeOutline, IoChatboxOutline } from "react-icons/io5";
import { RiProductHuntLine } from "react-icons/ri";
import { BiCategory } from "react-icons/bi";
import { FaRegUserCircle, FaRegCalendarAlt } from "react-icons/fa";
import { ImMagicWand } from "react-icons/im";
import { MdLogout } from "react-icons/md";
import { HiOutlineDotsVertical } from "react-icons/hi";

// ✅ React Icons replacements
import { FiChevronRight, FiChevronDown } from "react-icons/fi";
import { FiBarChart2 } from "react-icons/fi";
import { FiPieChart } from "react-icons/fi";
import { FiSettings } from "react-icons/fi";

import { cn } from "../../lib/utils";
import { useIsMobile } from "../../hooks/useMobile";
import LogoutDialog from "./logoutDialog";

/* ---------------- NAV ---------------- */

const navItems = [
  { title: "Dashboard", icon: LuLayoutDashboard, href: "/dashboard" },
  { title: "Orders", icon: IoCubeOutline, href: "/orders" },
  { title: "Customers", icon: FaRegUserCircle, href: "/customers" },
  {
    title: "Products",
    icon: RiProductHuntLine,
    subMenu: [
      { title: "All Products", href: "/products/all" },
      { title: "Create Product", href: "/products/create" },
    ],
  },
  { title: "Categories", icon: BiCategory, href: "/categories/manage" },
  { title: "Calendar", icon: FaRegCalendarAlt, href: "/calendar" },
  { title: "Chat", icon: IoChatboxOutline, href: "/chat" },
  { title: "AI", icon: ImMagicWand, href: "/agents" },
  { title: "Performance", icon: FiBarChart2, href: "#" },
  { title: "Analysis", icon: FiPieChart, href: "#" },
  { title: "Settings", icon: FiSettings, href: "/adminsettings" },
  { title: "Logout", icon: MdLogout, action: "logout" },
];

/* ---------------- COMPONENT ---------------- */

export default function Sidebar({
  isExpand,
  toggleExpand,
  setIsExpand,
}: any) {
  const location = useLocation().pathname;
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);

  /* AUTO OPEN SUBMENU */
  useEffect(() => {
    const index = navItems.findIndex((item) =>
      item.subMenu?.some((sub) => location.startsWith(sub.href))
    );
    setOpenIndex(index !== -1 ? index : null);
  }, [location]);

  /* MOBILE DEFAULT COLLAPSE */
  useEffect(() => {
    if (isMobile) setIsExpand(false);
  }, [isMobile]);

  const handleToggle = (i: number) => {
    if (!isExpand) setIsExpand(true);
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isMobile && isExpand && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsExpand(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={cn(
          "bg-white border-r flex flex-col transition-all duration-300 z-50",
          isExpand ? "w-60" : "w-16",
          !isMobile && "relative h-full",
          isMobile && "fixed top-0 left-0 h-screen"
        )}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-3 h-14 border-b">
          {isExpand && <span className="font-semibold">Admin</span>}

          <IconButton onClick={toggleExpand}>
            <FiChevronRight
              className={cn(
                "transition-transform",
                isExpand && "rotate-180"
              )}
            />
          </IconButton>
        </div>

        {/* NAV */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {navItems.map((item, i) => {
            const active = item.href === location;
            const subActive =
              item.subMenu?.some((sub) =>
                location.startsWith(sub.href)
              ) ?? false;

            const isOpen = openIndex === i;

            return (
              <div key={item.title}>
                <Tooltip
                  title={!isExpand ? item.title : ""}
                  placement="right"
                  arrow
                >
                  <div
                    onClick={() => {
                      if (item.action === "logout") {
                        setLogoutOpen(true);
                        return;
                      }

                      if (item.subMenu) {
                        handleToggle(i);
                        return;
                      }

                      if (item.href) {
                        navigate(item.href); // ✅ FIXED (no reload)
                      }

                      if (isMobile) setIsExpand(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-sm cursor-pointer transition",
                      active || subActive
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:bg-gray-100",
                      !isExpand && "justify-center"
                    )}
                  >
                    <item.icon />

                    {isExpand && (
                      <span className="text-sm flex-1">
                        {item.title}
                      </span>
                    )}

                    {item.subMenu && isExpand && (
                      <FiChevronDown
                        className={cn(
                          "transition-transform",
                          isOpen && "rotate-180"
                        )}
                      />
                    )}
                  </div>
                </Tooltip>

                {/* SUBMENU */}
                {item.subMenu && (
                  <Collapse in={isOpen && isExpand}>
                    <div className="ml-9 mt-1 space-y-1">
                      {item.subMenu.map((sub) => {
                        const isActive = location.startsWith(sub.href);

                        return (
                          <Link
                            key={sub.title}
                            to={sub.href}
                            onClick={() => {
                              if (isMobile) setIsExpand(false);
                            }}
                            className={cn(
                              "block text-sm px-3 py-1 rounded-md",
                              isActive
                                ? "bg-gray-200 text-black font-medium"
                                : "text-gray-500 hover:text-black"
                            )}
                          >
                            {sub.title}
                          </Link>
                        );
                      })}
                    </div>
                  </Collapse>
                )}
              </div>
            );
          })}
        </div>

        {/* USER */}
        <div className="border-t p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              J
            </div>

            {isExpand && (
              <div className="text-sm">
                <p className="font-medium">John</p>
                <p className="text-gray-500 text-xs">
                  admin@mail.com
                </p>
              </div>
            )}
          </div>

          {isExpand && <HiOutlineDotsVertical />}
        </div>
      </aside>

      <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </>
  );
}