import { useState } from "react";
import Sidebar from "./Sidebar";
import { useIsMobile } from "../../hooks/useMobile";
import { cn } from "../../lib/utils";

export default function AdminLayout({ children }: any) {
  const [isExpand, setIsExpand] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="flex">
      <Sidebar
        isExpand={isExpand}
        toggleExpand={() => setIsExpand(prev => !prev)}
        setIsExpand={setIsExpand}
      />

      <main
        className={cn(
          "flex-1 min-h-screen transition-all duration-300 bg-gray-50",

          // desktop spacing (FIX OVERLAP)
          !isMobile && (isExpand ? "ml-60" : "ml-16"),

          // mobile full width
          isMobile && "ml-0"
        )}
      >
        {children}
      </main>
    </div>
  );
}
