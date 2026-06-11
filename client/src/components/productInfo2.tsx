import React, { useState } from "react";
import DescriptionIcon from "@mui/icons-material/Description";
import StarIcon from "@mui/icons-material/Star";
import ListAltIcon from "@mui/icons-material/ListAlt";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ReviewsIcon from "@mui/icons-material/Reviews";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReplayIcon from "@mui/icons-material/Replay";
import SecurityIcon from "@mui/icons-material/Security";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

// ---------------- Offers Section ----------------
interface Offer {
  id: number;
  type: string;
  description: string;
}

const offers: Offer[] = [
  {
    id: 1,
    type: "Bank Offer",
    description:
      "10% Off on Supermoney UPI. Max discount of ₹50. Minimum order value of ₹250.",
  },
  {
    id: 2,
    type: "Bank Offer",
    description:
      "5% cashback on Flipkart SBI Credit Card upto ₹4,000 per calendar quarter",
  },
  {
    id: 3,
    type: "Bank Offer",
    description: "5% cashback on Axis Bank Flipkart Debit Card",
  },
  {
    id: 4,
    type: "Special Price",
    description: "Get extra 31% off (price inclusive of cashback/coupon)",
  },
];

const OffersSection: React.FC = () => {
  const [showAll, setShowAll] = useState(false);
  const [loadingOfferId, setLoadingOfferId] = useState<number | null>(null);
  const [termsData, setTermsData] = useState<Record<number, string>>({});

  const handleFetchTerms = async (offerId: number) => {
    try {
      setLoadingOfferId(offerId);
      // Example API call
      const response = await fetch(`/api/offers/${offerId}/terms`);
      const data = await response.json();

      setTermsData((prev) => ({
        ...prev,
        [offerId]: data.terms,
      }));
    } catch (error) {
      setTermsData((prev) => ({
        ...prev,
        [offerId]: "❌ Failed to load Terms & Conditions.",
      }));
    } finally {
      setLoadingOfferId(null);
    }
  };

  const visibleOffers = showAll ? offers : offers.slice(0, 4);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Available Offers</h3>
      <ul className="space-y-3">
        {visibleOffers.map((offer) => (
          <li key={offer.id} className="flex flex-col gap-1">
            <div className="flex items-start gap-2">
              <img
                src="https://rukminim2.flixcart.com/www/36/36/promos/06/09/2016/c22c9fc4-0555-4460-8401-bf5c28d7ba29.png?q=90"
                alt="offer"
                className="w-5 h-5 mt-1"
              />
              <div>
                <span className="font-medium">{offer.type} </span>
                <span>{offer.description}</span>
                <button
                  onClick={() => handleFetchTerms(offer.id)}
                  className="ml-2 text-blue-600 text-sm font-medium"
                  disabled={loadingOfferId === offer.id}
                >
                  {loadingOfferId === offer.id ? "Loading..." : "T&C"}
                </button>
              </div>
            </div>
            {termsData[offer.id] && (
              <p className="ml-7 text-sm text-gray-600 bg-gray-50 border-l-2 border-blue-400 pl-2">
                {termsData[offer.id]}
              </p>
            )}
          </li>
        ))}
      </ul>
      {offers.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-1 mt-3 text-blue-600 font-medium"
        >
          {showAll ? "Show less offers" : `View ${offers.length - 4} more offers`}
          {showAll ? <FiChevronUp /> : <FiChevronDown />}
        </button>
      )}
    </div>
  );
};

// ---------------- Tabs Data ----------------
interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const tabs: Tab[] = [
  {
    id: "description",
    label: "Description",
    icon: <DescriptionIcon fontSize="small" />,
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Product Description</h3>
        <p>
          This premium product is crafted with care, ensuring durability and
          comfort. Perfect for both daily use and special occasions.
        </p>
      </div>
    ),
  },
  {
    id: "highlights",
    label: "Highlights",
    icon: <StarIcon fontSize="small" />,
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Highlights</h3>
        <ul className="list-disc list-inside">
          <li>Eco-friendly materials</li>
          <li>Premium build quality</li>
          <li>Available in multiple colors</li>
        </ul>
      </div>
    ),
  },
  {
    id: "specs",
    label: "Specifications",
    icon: <ListAltIcon fontSize="small" />,
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Specifications</h3>
        <p>Dimensions: 10x5x3 inch</p>
        <p>Weight: 1.2 kg</p>
        <p>Material: Aluminum & Plastic</p>
      </div>
    ),
  },
  {
    id: "warranty",
    label: "Warranty",
    icon: <SecurityIcon fontSize="small" />,
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Warranty Information</h3>
        <p>
          This product comes with a <strong>1-year manufacturer warranty</strong>{" "}
          covering any manufacturing defects. Extended warranty options are also
          available at checkout.
        </p>
      </div>
    ),
  },
  {
    id: "offers",
    label: "Offers",
    icon: <LocalOfferIcon fontSize="small" />,
    content: <OffersSection />,
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: <ReviewsIcon fontSize="small" />,
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Customer Reviews</h3>
        <p>⭐ 4.5/5 (200 reviews)</p>
        <p>“Excellent product, worth the price!”</p>
      </div>
    ),
  },
  {
    id: "shipping",
    label: "Shipping Info",
    icon: <LocalShippingIcon fontSize="small" />,
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Shipping Information</h3>
        <p>Delivery usually takes 5-7 business days depending on location.</p>
      </div>
    ),
  },
  {
    id: "returns",
    label: "Returns Policy",
    icon: <ReplayIcon fontSize="small" />,
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Returns Policy</h3>
        <p>Easy 7-day return policy. Full refund for unused products.</p>
      </div>
    ),
  },
];

// ---------------- Main Component ----------------
const ProductInfo: React.FC = () => {
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) =>
      prev.includes(id) ? prev.filter((tab) => tab !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full max-w-3xl mt-5 ml-auto bg-white dark:bg-gray-900 ">      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {tabs.map((tab) => {
          const isOpen = openAccordions.includes(tab.id);
          return (
            <div key={tab.id}>
              <button
                onClick={() => toggleAccordion(tab.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800"
              >
                <div className="flex items-center gap-2">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
                {isOpen ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              {isOpen && (
                <div className="p-4 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900">
                  {tab.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductInfo;
