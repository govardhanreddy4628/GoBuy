import { Button } from '../../../../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../../../../ui/form";
import { useState } from "react";
//import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../ui/select";
import { Input } from "../../../../ui/input";
//import { Plus } from "lucide-react";
import { Textarea } from "../../../../ui/textarea";
import RecursiveCategorySelector from './RecursiveCategorySelector';


const BasicInfo = ({ validateSection, tab, form, generateSKU, categories, }) => {
  const [highlightInput, setHighlightInput] = useState("");
  const highlights = form.watch("highlights");

  const addHighlight = () => {
    if (highlightInput.trim() && !highlights.includes(highlightInput.trim())) {
      form.setValue("highlights", [...highlights, highlightInput.trim()]);
      setHighlightInput("");
    }
  };

  const removeHighlight = (hl: string) => {
    form.setValue("highlights", highlights.filter((h: string) => h !== hl));
  };

  console.log(categories)
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            Enter the basic details about your product
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="category"
              render={() => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>

                  <RecursiveCategorySelector
                    categories={categories}
                    form={form}
                    fieldName="category"
                  />

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU *</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="Enter SKU" {...field} />
                    </FormControl>
                    <Button type="button" variant="outline" onClick={generateSKU}>
                      Generate
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>


          <FormField
            control={form.control}
            name="shortDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Short Description *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief product description (used in listings)"
                    className="min-h-[60px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This will appear in product listings and search results
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Description *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detailed product description"
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barcode (UPC/EAN)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter barcode" {...field} />
                </FormControl>
                <FormDescription>
                  Optional: Used for inventory management and POS systems
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-sm">Highlights</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={highlightInput}
                  onChange={(e) => setHighlightInput(e.target.value)}
                  placeholder="Enter a product highlight"
                  className="w-full p-2 border rounded focus:outline-none focus:border-black focus:border-2 bg-gray-50"
                />
                <Button type="button" onClick={addHighlight}>
                  Add
                </Button>
              </div>

              {/* Display added highlights */}
              <div className="flex flex-wrap gap-2 mt-2">
                {highlights.map((hl: string, i: number) => (
                  <span
                    key={i}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1"
                  >
                    {hl}
                    <button
                      type="button"
                      onClick={() => removeHighlight(hl)}
                      className="text-red-500 ml-1"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Color */}
            <FormField
              control={form.control}
              name="productColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Color</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter primary product color (e.g. Red)"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="availableColorsForProduct"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Colors</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter colors separated by comma (e.g. Red, Blue)"
                      value={field.value?.join(", ") || ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            .split(",")
                            .map((c) => c.trim())
                            .filter(Boolean)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            {/* Brand Name */}
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Brand name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>


        </CardContent>
      </Card>
    </>
  )
}

export default BasicInfo
