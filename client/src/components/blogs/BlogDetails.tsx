import { useParams, Link } from 'react-router-dom';

type BlogPost = {
    title: string;
    content: string;
    image: string;
};

const blogData: Record<string, BlogPost> = {               //**Record<K, V> is a utility type that helps you define an object type with specific key and value types.
    1: {
        title: 'Top 5 Fashion Trends for Summer 2025',
        content: 'From oversized blazers to bold prints, summer 2025 is all about vibrant self-expression...',
        image: 'https://kaizenaire.com/wp-content/uploads/2023/10/Singapore-Clothing-Brands-Discover-the-Best-Fashion-Labels-in-the-Lion-City-Singapore.jpg',
    },
    2: {
        title: 'How to Choose the Best Laptop for Work & Gaming',
        content: 'When picking a laptop, focus on RAM, GPU, battery life, and screen size...',
        image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg',
    },
    3: {
        title: '10 Grocery Hacks to Save Time and Money',
        content: 'Buy in bulk, shop with a list, and learn to store produce correctly...',
        image: 'https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/GYOBVQAM2II63CHIYWG4HW5O4I.jpg',
    },
    4: {
        title: 'Best Beauty Products for Glowing Skin in 2025',
        content: 'Our 2025 beauty guide includes hydrating serums, vitamin C creams, and more...',
        image: 'https://png.pngtree.com/background/20230612/original/pngtree-various-makeup-products-lie-on-a-table-on-dark-picture-image_3185889.jpg',
    },
    5: {
        title: 'Essential Footwear Styles Every Wardrobe Needs',
        content: 'Whether you’re dressing up or down, these 5 shoes have you covered...',
        image: 'https://tse1.mm.bing.net/th?id=OIP.dSMTiGuBykd-7gZYc3mSFgHaE8&pid=Api&P=0&h=180',
    },
    6: {
        title: 'Top 10 Headphones in 2025',
        content:
            'Here’s the complete breakdown of the top headphones in 2025. We evaluated noise cancellation, comfort, and battery life. Brands like Sony, Bose, and Apple dominated the charts...',
        image: 'https://axerosolutions.com/assets/Uploaded-CMS-Files/1c3bc747-fef3-4ce9-a3ae-dc94f44fbcb1.jpg',
    },
};

const BlogDetail = () => {
    const { id } = useParams<{ id: string }>(); // Tell TypeScript we expect 'id'

    const blog = id ? blogData[id] : undefined;

    if (!blog) return <div className="p-6 text-center">Blog not found.</div>;

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <img src={blog.image} alt={blog.title} className="w-full rounded-lg mb-6" />
            <h1 className="text-3xl font-bold mb-4 text-gray-800">{blog.title}</h1>
            <p className="text-gray-700 leading-relaxed">{blog.content}</p>
            <Link to="/" className="text-blue-600 text-sm mt-4 inline-block hover:underline">← Back to Blog</Link>
        </div>
    );
};

export default BlogDetail;