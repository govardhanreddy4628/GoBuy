// ✅ Skeleton Card
const SkeletonCard = (key) => (
  <div key={key} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-400 shadow-md rounded-md flex flex-col items-center relative overflow-hidden animate-pulse">
    <div className="bg-gray-300 dark:bg-gray-700 w-full h-[200px]" />
    <div className="w-full p-3 flex flex-col gap-2">
      <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="h-3 w-1/2 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="h-3 w-5/6 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded mt-3"></div>
      <div className="h-8 w-full bg-gray-300 dark:bg-gray-700 rounded mt-4"></div>
    </div>
  </div>
);

export default SkeletonCard;