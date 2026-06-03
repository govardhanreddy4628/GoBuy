import { useRef, useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MdInfo, MdInventory, MdOutlinePermMedia } from "react-icons/md";
import { HiOutlineTag } from "react-icons/hi2";
import { BsCurrencyDollar } from "react-icons/bs";
import { BiSolidOffer } from "react-icons/bi";
import Media, { UploadedImage } from "./MediaDnD2";
import BasicInfo from "./BasicInfo";
import Pricing from "./Pricing";
import Inventory from "./Inventory";
import SeoTags from "./SeoTags";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "../../../../hooks/use-toast";
import { Form } from "../../../../ui/form"

import { sideBarContext } from "../../../../context/sidebarContext";
import { Button } from "../../../../ui/button";
import { useCategories } from "../../context/categoryContext";
import Offers from "./Offers";
import { deleteCloudinaryImage } from "../../utils/cloudinaryDelete";

// ---------------------------
// TAB COMPONENT CONFIG
// ---------------------------
const tabComponents: Record<string, React.ComponentType<any>> = {
    basic: BasicInfo,
    pricing: Pricing,
    offers: Offers,
    inventory: Inventory,
    media: Media,
    seotags: SeoTags,
};

const TABS = [
    { id: "basic", label: "Basic Info", icon: <MdInfo /> },
    { id: "pricing", label: "Pricing", icon: <BsCurrencyDollar /> },
    { id: "offers", label: "Offers", icon: <BiSolidOffer /> },
    { id: "inventory", label: "Inventory", icon: <MdInventory /> },
    { id: "media", label: "Media", icon: <MdOutlinePermMedia /> },
    { id: "seotags", label: "SEO&Tags", icon: <HiOutlineTag /> },
];


// ---------------------------
// SCHEMAS
// ---------------------------
const offerSchema = z.object({
    type: z.enum(["Bank Offer", "Special Price", "Coupon", "Cashback"]),
    description: z.string().min(1),

    discountValue: z.coerce.number().min(0).optional(),
    discountType: z.enum(["PERCENTAGE", "FLAT"]).optional(),
    maxDiscount: z.coerce.number().min(0).optional(),
    minOrderValue: z.coerce.number().min(0).optional(),

    applicableBanks: z.array(z.string()).optional(),
    paymentMethods: z.array(z.string()).optional(),
    applicableCategories: z.array(z.string()).optional(),
    applicableProducts: z.array(z.string()).optional(),

    couponCode: z.string().optional(),
    validFrom: z.string().optional(),
    validTill: z.string().optional(),

    usageLimit: z.coerce.number().min(1).optional(),
    isStackable: z.boolean().optional(),
    priority: z.coerce.number().optional(),
});



const productSchema = z.object({
    name: z.string().min(2, "Product name must be at least 2 characters").max(200, "Product name must be less than 100 characters"),
    shortDescription: z.string().min(5, "Short description must be at least 5 characters").max(360, "Short description must be less than 360 characters"),
    description: z.string().min(10, "Description must be at least 10 characters").max(5000, "Description must be less than 5000 characters"),
    category: z.string().min(1, "Please select a category"),
    listedPrice: z.coerce.number().min(1, "Listed price is required"),
    finalPrice: z.coerce.number().min(0).optional(),
    costPerItem: z.coerce.number().optional(),
    highlights: z.array(z.string().min(2, "Highlight must be at least 2 characters")).max(10, "Max 10 highlights allowed").optional(),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    warranty: z.string().optional(),
    sku: z.string().min(1, "SKU is required").max(50, "SKU must be less than 50 characters"),
    productColor: z.string().optional().or(z.literal("")),
    availableColorsForProduct: z.array(z.string()).optional(),
    trackQuantity: z.boolean().default(true),
    quantityInStock: z.coerce.number().optional(),
    lowStockThreshold: z.coerce.number().default(10),
    recentQuantity: z.coerce.number().optional(),
    specifications: z.array(
        z.object({
            key: z.string().min(1, "Specification key is required"),
            value: z.string().min(1, "Specification value is required"),
            unit: z.string().optional(),
            group: z.string().optional(),
        })
    ).optional(),
    shipping: z.boolean().default(true),
    barcode: z.string().optional(),
    seoTags: z.array(z.string()).max(10, "Maximum 10 tags allowed").optional(),
    seoTitle: z.string().max(60, "SEO title must be less than 60 characters").optional(),
    seoDescription: z.string().max(160, "SEO description must be less than 160 characters").optional(),
    offers: z.array(offerSchema).optional(),
    returnPolicy: z.string().optional(),
    brand: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

// MAIN COMPONENT

export default function CreateProduct3() {
    const navigate = useNavigate();
    const { id } = useParams(); // detect edit mode
    console.log("Product ID param:", id);
    const isEditMode = Boolean(id);

    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
    const [activeTab, setActiveTab] = useState("basic");
    const [wizardMode, setWizardMode] = useState(false);
    const [currentTab, setCurrentTab] = useState("basic");

    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [deletedImagePublicIds, setDeletedImagePublicIds] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");

    const { categories } = useCategories();
    const { toast } = useToast();

    const context = useContext(sideBarContext);
    if (!context) { throw new Error('sideBarContext must be used within a Provider') }
    const { setIsExpand } = context;

    useEffect(() => { setIsExpand(false) }, [setIsExpand])


    const MAX_IMAGES = 8;

    const BASE_URL = import.meta.env.VITE_BACKEND_URL_LOCAL || import.meta.env.VITE_BACKEND_URL;

    const emptyProductValues: ProductFormData = {
        name: "",
        description: "",
        shortDescription: "",
        category: "",
        finalPrice: 0,
        listedPrice: 0,
        costPerItem: 0,
        sku: "",
        barcode: "",
        trackQuantity: true,
        quantityInStock: 0,
        lowStockThreshold: 0,
        recentQuantity: 0,
        specifications: [],
        seoTags: [],
        seoTitle: "",
        seoDescription: "",
        isActive: true,
        isFeatured: false,
        shipping: true,
        offers: [],
        warranty: "",
        brand: "",
        returnPolicy: "",
        highlights: [],
        productColor: "",
        availableColorsForProduct: [],

    };

    const form = useForm<ProductFormData>({
        resolver: zodResolver(productSchema) as Resolver<ProductFormData, object>,
        defaultValues: emptyProductValues,
    });


    useEffect(() => {
        if (!id) {
            // Create mode → reset everything
            form.reset(emptyProductValues);
            setUploadedImages([]);
            setDeletedImagePublicIds([]);
            setTagInput("");
            setCurrentTab("basic");
            setActiveTab("basic");
        }
    }, [id, form]);

    // ---------------------------
    // LOAD PRODUCT DATA IF EDIT MODE
    // ---------------------------
    useEffect(() => {
        if (!isEditMode) return;

        const fetchSingleProduct = async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/v1/product/getproductdetails/${id}`);
                if (!res.ok) throw new Error("Failed to fetch product");

                const data = await res.json();
                console.log("Raw product data:", data);

                if (!data?.data) return;

                const product = data.data;

                // Normalize the data to match your form schema
                form.reset({
                    name: product.name || "",
                    description: product.description || "",
                    shortDescription: product.shortDescription || "",
                    category: product.category?._id || "",       // category object -> string id
                    finalPrice: product.finalPrice ?? 0,
                    listedPrice: product.listedPrice ?? 0,
                    costPerItem: product.costPerItem || 0,
                    sku: product.sku || "",
                    brand: product.brand || "",
                    barcode: product.barcode || "",
                    quantityInStock: product.quantityInStock || 0,
                    lowStockThreshold: product.lowStockThreshold || 10,
                    recentQuantity: product.recentQuantity || 0,
                    isActive: product.isActive ?? true,
                    isFeatured: product.isFeatured ?? false,
                    shipping: product.shipping ?? true,
                    warranty: product.warranty || "",
                    seoTags: product.seoTags || [],
                    seoTitle: product.seoTitle || "",
                    seoDescription: product.seoDescription || "",
                    highlights: product.highlights || [],
                    specifications: product.specifications || [],
                    offers: product.offers || [],
                    returnPolicy: product.returnPolicy || "",
                    productColor: product.productColor ?? "",
                    availableColorsForProduct: product.availableColorsForProduct || [],
                    trackQuantity: product.trackQuantity ?? true,
                });



                // Normalize images for your Media component
                setUploadedImages(
                    (product.images || []).map((img: any) => ({
                        id: img.public_id,               // ✅ STABLE ID
                        public_id: img.public_id,
                        url: img.url,
                        width: img.width,
                        height: img.height,
                        format: img.format,
                        size: img.size,
                        originalName: img.public_id,
                        uploadedAt: new Date(img.uploadedAt || Date.now()),
                        status: "done",
                        role: img.role ?? "gallery",
                    }))
                );

            } catch (err) {
                console.error("Error loading product:", err);
                toast({
                    title: "Error loading product",
                    description: "Could not load product details.",
                    variant: "destructive",
                });
            }
        };

        fetchSingleProduct();
    }, [isEditMode, id]);



    // ---------------------------
    // FORM SUBMIT HANDLER
    // ---------------------------
    const onSubmit = async (data: ProductFormData) => {
        console.log("hello")
        try {

            // const allValid = Object.values(validation).every(Boolean);
            // if (!allValid) return;

            // if (uploadedImages.length === 0) {
            //     toast({
            //         title: "Missing images",
            //         description: "Please upload at least one image.",
            //         variant: "destructive",
            //     });
            //     return;
            // }

            // const hasCover = uploadedImages.some(img => img.role === "cover");
            // if (!hasCover) {
            //     toast({
            //         title: "Cover image required",
            //         description: "Please select one image as cover.",
            //         variant: "destructive",
            //     });
            //     return;
            // }


            const normalizedImages = uploadedImages.map(
                ({ public_id, url, width, height, format, size, uploadedAt, role }) => ({
                    public_id,
                    url,
                    width,
                    height,
                    format,
                    size,
                    uploadedAt,
                    role,
                })
            );

            const payload = {
                ...data,
                productColor: data.productColor || undefined, 
                images: normalizedImages, // each image has public_id + secure_url
                deletedImages: deletedImagePublicIds,
            };


            const url = isEditMode
                ? `${BASE_URL}/api/v1/product/update/${id}`
                : `${BASE_URL}/api/v1/product/createproduct`;
            const method = isEditMode ? "PUT" : "POST";

            console.log("Product data:", data);
            console.log("Uploaded images:", uploadedImages);


            // Send JSON to server (product create endpoint that accepts JSON)
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload) // send image names for now,
            });

            const respData = await res.json();
            console.log("Server response:", respData);
            if (!res.ok) throw new Error(isEditMode ? "Product Update failed" : "Product Creation failed");

            toast({
                title: isEditMode ? "Product updated!" : "Product created!",
                description: `${data.name} has been ${isEditMode ? "updated" : "added"} successfully.`,
                variant: "default",
            });

            // Reset form
            if (isEditMode) navigate(`/products/all`);
            if (!isEditMode) {
                form.reset();
                setUploadedImages([]);
                setTagInput("");
            }
            return respData;
        } catch (error) {
            toast({
                title: "Error creating product",
                description: "Something went wrong. Please try again later.",
                variant: "destructive",
            });
            console.error("submitProduct error:", error);
        }
    };

    // OTHER UI LOGIC (TABS, VALIDATION, ETC.)
    const [validation, setValidation] = useState<Record<string, boolean>>(
        TABS.reduce((acc, tab) => ({ ...acc, [tab.id]: false }), {})
    );

    const watchedTags = form.watch("seoTags");
    const watchedTrackQuantity = form.watch("trackQuantity");
    const watchedFinalPrice = form.watch("finalPrice");
    const watchedListedPrice = form.watch("listedPrice");

    const generateSKU = () => {
        const name = form.getValues("name");
        const category = form.getValues("category");
        if (name && category) {
            const sku = `${category.substring(0, 3).toUpperCase()}-${name.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
            form.setValue("sku", sku);
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !watchedTags.includes(tagInput.trim()) && watchedTags.length < 10) {
            form.setValue("seoTags", [...watchedTags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        form.setValue("seoTags", watchedTags.filter(tag => tag !== tagToRemove));
    };


    const removeImage = (id: string) => {
        const image = uploadedImages.find(img => img.id === id);
        if (!image) return;

        if (image.status === "uploading") {
            toast({ title: "Please wait", description: "Image is still uploading" });
            return;
        }

        if (image.public_id) {
            setDeletedImagePublicIds(prev => [...prev, image.public_id]);
        }

        setUploadedImages(prev => prev.filter(img => img.id !== id));
    };




    // IntersectionObserver for scroll spy
    useEffect(() => {
        if (wizardMode) return; // skip in wizard mode

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveTab(entry.target.id);
                    }
                });
            },
            { rootMargin: "-40% 0px -40% 0px", threshold: 0.1 }
        );

        Object.values(sectionRefs.current).forEach((section) => {
            if (section) observer.observe(section);
        });

        return () => observer.disconnect();
    }, [wizardMode]);

    const scrollToSection = (id: string) => {
        if (wizardMode) {
            setCurrentTab(id);
        } else {
            sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };


    const validateSection = (id: string, isValid: boolean) => {
        setValidation((prev) => ({ ...prev, [id]: isValid }));
    };

    const nextTab = () => {
        const idx = TABS.findIndex((t) => t.id === currentTab);
        if (idx < TABS.length - 1) setCurrentTab(TABS[idx + 1].id);
    };
    const prevTab = () => {
        const idx = TABS.findIndex((t) => t.id === currentTab);
        if (idx > 0) setCurrentTab(TABS[idx - 1].id);
    };


    const tabPropsMap: Record<string, any> = {
        basic: {
            tab: { id: "basic" },
            form,
            validateSection,
            generateSKU,
            categories,
        },
        media: {
            uploadedImages,
            setUploadedImages,
            removeImage,
            MAX_IMAGES
        },
        pricing: {
            form,
            validateSection,
            watchedFinalPrice,
            watchedListedPrice
        },
        inventory: {
            form,
            watchedTrackQuantity,
        },
        seotags: {
            form,
            addTag,
            removeTag,
            watchedTags,
            tagInput,
            setTagInput,
        },
    };

    console.log("Form errors:", form.formState.errors);


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, (errors) => console.log("❌ BLOCKED BY ZOD", errors))}>
                <div className="h-[calc(100vh-5rem)] flex flex-col overflow-hidden relative">
                    {/* Breadcrumb */}
                    <div className="p-4 border-b bg-white sticky top-0 z-50 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm">
                            <button type="button" onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900">← Back</button>
                            <span>/</span>
                            <span className="font-medium text-gray-800">{isEditMode ? "Edit Product" : "Create Product"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <label>Wizard Mode</label>
                            <input type="checkbox" checked={wizardMode} onChange={(e) => setWizardMode(e.target.checked)} />
                        </div>
                    </div>

                    <div className="flex flex-1 overflow-hidden relative">
                        {/* Left Tabs */}
                        <div className="w-64 bg-white border-r p-4 overflow-y-auto hidden md:flex flex-col gap-2 sticky top-0 h-[calc(100vh-5rem)]">
                            {TABS.map((tab) => {
                                const isActive = wizardMode ? currentTab === tab.id : activeTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => scrollToSection(tab.id)}
                                        className={`flex items-center gap-3 px-4 py-2 rounded-md text-left transition-all ${isActive
                                            ? "bg-blue-100 text-blue-600 font-medium"
                                            : "text-gray-600 hover:bg-gray-100"
                                            }`}
                                    >
                                        <span className="text-lg">{tab.icon}</span>
                                        <span>{tab.label}</span>
                                        {!validation[tab.id] === false && <span className="ml-auto text-red-500 text-xs">⚠️</span>}
                                    </button>
                                )
                            })}
                        </div>

                        {/*Scroll Content */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-14">
                            {TABS.map((tab) => {
                                const isVisible = wizardMode ? currentTab === tab.id : true;
                                if (!isVisible) return null;

                                const TabComponent = tabComponents[tab.id];
                                const extraProps = tabPropsMap[tab.id] || {};

                                return (
                                    <section
                                        key={tab.id}
                                        id={tab.id}
                                        ref={(el) => (sectionRefs.current[tab.id] = el)}
                                        className="scroll-mt-32"
                                    >
                                        <h2 className="text-2xl font-bold mb-2">{tab.label}</h2>
                                        <div className="bg-gray-100 p-6 rounded-md space-y-4">
                                            <TabComponent
                                                onValidate={(isValid: boolean) => validateSection(tab.id, isValid)}
                                                {...extraProps}
                                            />
                                        </div>
                                    </section>
                                );
                            })}

                            {wizardMode && (
                                <div className="flex justify-between mt-12">
                                    <button
                                        onClick={prevTab}
                                        disabled={TABS[0].id === currentTab}
                                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={nextTab}
                                        disabled={TABS[TABS.length - 1].id === currentTab}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>



                    {!wizardMode && (
                        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
                            {!isEditMode && (
                                <Button type="button" className="px-6 py-3 rounded-md shadow-lg border border-gray-800 shadow-gray-500" variant="outline" onClick={() => form.reset()}>
                                    Reset Form
                                </Button>
                            )}
                            <Button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-3 rounded-md shadow-lg shadow-gray-500 hover:bg-blue-700 transition"
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting
                                    ? isEditMode
                                        ? "Updating..."
                                        : "Creating..."
                                    : isEditMode
                                        ? "Update Product"
                                        : "Create Product"}
                            </Button>
                        </div>
                    )}

                </div>
            </form>
        </Form>
    );
}
