export type CatalogFilters = {
    client: number;
    product_code: string | null;
    product_description: string | null;
    category: number | null;
}

export type PriceRange = {
    units_from: number;
    units_to: string;
    price: number;
    discount_1: number;
    discount_2: number;
    discount_3: number;
    key: string;
};

export type Product = {
    product_code: string;
    product_description: string;
    units_per_package: number;
    units: number;
    price_ranges: PriceRange[];
};
