// import { Link } from 'react-router-dom';

// const blogs = [
//   {
//     id: 1,
//     title: 'Top 5 Fashion Trends for Summer 2025',
//     category: 'Clothing',
//     description: 'Explore the hottest colors, cuts, and styles dominating the fashion world this summer.',
//     image: 'https://kaizenaire.com/wp-content/uploads/2023/10/Singapore-Clothing-Brands-Discover-the-Best-Fashion-Labels-in-the-Lion-City-Singapore.jpg',
//   },
//   {
//     id: 2,
//     title: 'How to Choose the Best Laptop for Work & Gaming',
//     category: 'Electronics',
//     description: 'From performance to portability, here’s everything to consider before you buy your next laptop.',
//     image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg',
//   },
//   {
//     id: 3,
//     title: '10 Grocery Hacks to Save Time and Money',
//     category: 'Groceries',
//     description: 'Meal prep, bulk buys, and smart shopping tips every busy person should know.',
//     image: 'https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/GYOBVQAM2II63CHIYWG4HW5O4I.jpg',
//   },
//   {
//     id: 4,
//     title: 'Best Beauty Products for Glowing Skin in 2025',
//     category: 'Beauty',
//     description: 'Our top product picks that actually deliver glowing results.',
//     image: 'https://png.pngtree.com/background/20230612/original/pngtree-various-makeup-products-lie-on-a-table-on-dark-picture-image_3185889.jpg',
//   },
//   {
//     id: 5,
//     title: 'Essential Footwear Styles Every Wardrobe Needs',
//     category: 'Footwear',
//     description: 'Sneakers, boots, sandals — see which shoes you should always have in rotation.',
//     image: 'https://tse1.mm.bing.net/th?id=OIP.dSMTiGuBykd-7gZYc3mSFgHaE8&pid=Api&P=0&h=180',
//   },
//   {
//     id: 6,
//     title: 'Top 10 Headphones in 2025',
//     category: 'Electronics',
//     description:
//       'Discover the best noise-cancelling headphones you can buy this year with a breakdown of features and value.',
//     image: 'https://axerosolutions.com/assets/Uploaded-CMS-Files/1c3bc747-fef3-4ce9-a3ae-dc94f44fbcb1.jpg',
//   },
// ];

// const BlogSection = () => {
//   return (
//     <>
//       <section className="bg-white py-12 px-6 md:px-12 dark:bg-gray-900">
//         <div className="max-w-9xl mx-auto">
//           <div className="text-start mb-10">
//             <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-300">From Our Blog</h2>
//             <p className="text-gray-600 mt-2 dark:text-gray-400">Shopping guides, trend reports, wellness tips, and more.</p>
//           </div>

//           <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
//             {blogs.map((post) => (
//               <div key={post.id} className="bg-white dark:bg-gray-800 border rounded-lg shadow hover:shadow-md transition duration-300">
//                 <img
//                   src={post.image}
//                   alt={post.title}
//                   className="rounded-t-lg w-full h-48 object-cover"
//                 />
//                 <div className="p-5">
//                   <span className="text-sm text-red-400 font-semibold">{post.category}</span>
//                   <h3 className="text-xl font-semibold text-gray-700 mt-1 dark:text-gray-300">{post.title}</h3>
//                   <p className="text-gray-600 text-sm my-2 dark:text-gray-400">{post.description}</p>
//                   <Link
//                     to={`/blog/${post.id}`}
//                     className="text-red-300 hover:underline text-sm font-medium"
//                   >
//                     Read more →
//                   </Link>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     </>
//   );
// };

// export default BlogSection;






import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GET } from "../../api/api_utility";

type Blog = {
  _id: string;
  title: string;
  category: string;
  description: string;
  image: string;
};


const BlogSkeleton = () => {
  return (
    <section className="bg-white py-12 px-6 md:px-12 dark:bg-gray-900 animate-pulse">
      <div className="max-w-9xl mx-auto">
        {/* Heading Skeleton */}
        <div className="mb-10">
          <div className="h-8 w-64 bg-gray-300 dark:bg-gray-700 rounded mb-3"></div>
          <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>

        {/* Cards Skeleton */}
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 border rounded-lg shadow"
            >
              {/* Image */}
              <div className="w-full h-48 bg-gray-300 dark:bg-gray-700 rounded-t-lg"></div>

              {/* Content */}
              <div className="p-5 space-y-3">
                <div className="h-3 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-5 w-3/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const BlogSection = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await GET("/api/v1/blogs");
      setBlogs(res.data.blogs || []);
      console.log("Fetched blogs:", res.data.blogs);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  if (loading) {
    return <BlogSkeleton />;
  }

  return (
    <section className="bg-white py-12 px-6 md:px-12 dark:bg-gray-900">
      <div className="max-w-9xl mx-auto">
        <div className="text-start mb-10">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-300">
            From Our Blog
          </h2>
          <p className="text-gray-600 mt-2 dark:text-gray-400">
            Shopping guides, trend reports, wellness tips, and more.
          </p>
        </div>

        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((post) => (
            <div
              key={post._id}
              className="bg-white dark:bg-gray-800 border rounded-lg shadow hover:shadow-md transition duration-300"
            >
              <img
                src={post.image}
                alt={post.title}
                className="rounded-t-lg w-full h-48 object-cover"
              />

              <div className="p-5">
                <span className="text-sm text-red-400 font-semibold">
                  {post.category}
                </span>

                <h3 className="text-xl font-semibold text-gray-700 mt-1 dark:text-gray-300">
                  {post.title}
                </h3>

                <p className="text-gray-600 text-sm my-2 dark:text-gray-400">
                  {post.description}
                </p>

                <Link
                  to={`/blog/${post._id}`}
                  className="text-red-300 hover:underline text-sm font-medium"
                >
                  Read more →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {!loading && blogs.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            No blogs available
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;