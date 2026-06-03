import { Calendar as CalendarIcon } from 'lucide-react';
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { getMonthName } from '../utils/dateUtils';
import { FaCaretDown } from "react-icons/fa";
import { useState } from 'react';


interface CalendarHeaderProps {
  currentDate: Date;
  view: 'month' | 'week' | 'day' | 'year';
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: 'month' | 'week' | 'day' | 'year') => void;
}

export function CalendarHeader({
  currentDate,
  view,
  onPrevious,
  onNext,
  onToday,
  onViewChange,
}: CalendarHeaderProps) {
  const [openDurationDropdown, setOpenDurationDropdown] = useState(false);
  const monthName = getMonthName(currentDate.getMonth());
  const year = currentDate.getFullYear();

  const todayNum = new Date().getDate();
  const durations: ("day" | "week" | "month" | "year")[] = ["day", "week", "month", "year"];
  return (
    <header className="flex py-2 px-4 items-center justify-between w-full gap-2 bg-white">
      <div className="flex items-center gap-4">
        {/* Calendar Logo */}
        <div className="flex items-center gap-2 w-64">
          <img
            src={`https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_${todayNum}_2x.png`}
            srcSet={`
                      https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_${todayNum}_2x.png 1x,
                      https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_${todayNum}_2x.png 2x
                    `}
            alt="Calendar logo"
            aria-hidden="true"
            role="presentation"
            width={40}
            height={40}
          />
          <h3 className="font-medium text-xl">Calendar</h3>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-4">
          <button
            className="capitalize text-primary flex items-center justify-between gap-2 px-4 py-2 mr-5 border border-gray-900 rounded-lg shadow-sm hover:bg-gray-100 transition duration-150"
            onClick={onToday}
          >
            <CalendarIcon className="w-4 h-4" />
            Today
          </button>

          <div className="flex items-center gap-2">
            <button
              aria-label="previous"
              onClick={onPrevious}
              className="p-1 rounded-full hover:bg-gray-300 text-gray-800 transition-colors duration-200"
            >
              <MdChevronLeft size={22} />
            </button>

            <button
              aria-label="next"
              onClick={onNext}
              className="p-1 rounded-full hover:bg-gray-300 text-gray-800 transition-colors duration-200"
            >
              <MdChevronRight size={22} />
            </button>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900">
            {monthName} {year}
          </h2>
        </div>
      </div>

      {/* <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
        {(['month', 'week', 'day'] as const).map(v => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={`px-4 py-2 rounded-md transition-colors ${view === v
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            {v[0].toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div> */}

      {/* Duration Dropdown */}
      <div className="relative inline-block">
        <button
          onClick={() => setOpenDurationDropdown(!openDurationDropdown)}
          className="flex items-center justify-between gap-2 px-4 py-2 mr-5 border border-gray-900 rounded-lg shadow-sm hover:bg-gray-100 transition duration-150"
        >
          <span className="capitalize">{view.charAt(0).toUpperCase() + view.slice(1)}</span>
          <FaCaretDown
            className={`transition-transform duration-200 ${openDurationDropdown ? "rotate-180" : ""}`}
          />
        </button>

        {openDurationDropdown && (
          <div className="absolute top-full -left-2 mt-2 w-full bg-white border border-gray-200 shadow-lg rounded-md z-10">
            {durations.map((d) => (
              <div
                key={d}
                onClick={() => {
                  onViewChange(d);
                  setOpenDurationDropdown(false);
                }}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 w-full text-center capitalize transition-colors"
              >
                {d}
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
