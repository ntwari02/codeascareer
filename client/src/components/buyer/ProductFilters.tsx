import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown, ChevronUp, Check, X, SlidersHorizontal, Search, Save, RotateCcw, Filter } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import type { Product } from '../../types';

// Debounce utility for resize/scroll handlers
function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

// Debounce utility function
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface FilterOption {
  id: string;
  label: string;
  count: number;
  color?: string;
}

interface ProductFiltersProps {
  products: Product[];
  onFilterChange: (filters: FilterState) => void;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  getTotalActiveFilters?: number;
}

export interface FilterState {
  sort: string;
  category: string[];
  brand: string[];
  priceRange: [number, number];
  color: string[];
  size: string[];
  rating: number | null;
  seller: string[];
  delivery: string[];
  stock: string[];
  quickFilters: string[];
}

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Most Relevant' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'newest', label: 'Newest First' },
  { id: 'popular', label: 'Most Popular' },
  { id: 'best_seller', label: 'Best Seller' },
  { id: 'top_rated', label: 'Top Rated' },
  { id: 'fast_delivery', label: 'Fast Delivery' },
];

const QUICK_FILTERS = [
  { id: 'free_shipping', label: 'Free Shipping' },
  { id: 'express_delivery', label: 'Express Delivery' },
  { id: 'in_stock', label: 'In Stock Only' },
  { id: 'verified_seller', label: 'Verified Seller' },
  { id: 'discounted', label: 'Discounted' },
];

const BRANDS = [
  { id: 'apple', label: 'Apple' },
  { id: 'samsung', label: 'Samsung' },
  { id: 'sony', label: 'Sony' },
  { id: 'nike', label: 'Nike' },
  { id: 'adidas', label: 'Adidas' },
  { id: 'zara', label: 'Zara' },
  { id: 'hm', label: 'H&M' },
  { id: 'gucci', label: 'Gucci' },
  { id: 'puma', label: 'Puma' },
  { id: 'lg', label: 'LG' },
  { id: 'whirlpool', label: 'Whirlpool' },
  { id: 'bosch', label: 'Bosch' },
];

const SIZES = [
  { id: 'xs', label: 'XS' },
  { id: 's', label: 'S' },
  { id: 'm', label: 'M' },
  { id: 'l', label: 'L' },
  { id: 'xl', label: 'XL' },
  { id: 'xxl', label: 'XXL' },
  { id: 'one-size', label: 'One Size' },
];

const COLOURS = [
  { id: 'black', label: 'Black', color: '#000000' },
  { id: 'white', label: 'White', color: '#FFFFFF' },
  { id: 'red', label: 'Red', color: '#FF0000' },
  { id: 'blue', label: 'Blue', color: '#0000FF' },
  { id: 'green', label: 'Green', color: '#008000' },
  { id: 'yellow', label: 'Yellow', color: '#FFFF00' },
  { id: 'orange', label: 'Orange', color: '#FFA500' },
  { id: 'purple', label: 'Purple', color: '#800080' },
  { id: 'pink', label: 'Pink', color: '#FFC0CB' },
  { id: 'brown', label: 'Brown', color: '#A52A2A' },
  { id: 'grey', label: 'Grey', color: '#808080' },
  { id: 'navy', label: 'Navy', color: '#000080' },
];

const DELIVERY_OPTIONS = [
  { id: 'fast_delivery', label: 'Fast Delivery' },
  { id: 'free_shipping', label: 'Free Shipping' },
  { id: 'same_day', label: 'Same Day Delivery' },
  { id: 'under_3_days', label: 'Delivery Under 3 Days' },
];

const STOCK_OPTIONS = [
  { id: 'in_stock', label: 'In Stock' },
  { id: 'out_of_stock', label: 'Out of Stock' },
];

const SELLER_OPTIONS = [
  { id: 'verified', label: 'Verified Seller' },
  { id: 'high_rated', label: 'High-Rated Seller' },
  { id: 'local', label: 'Local Seller' },
  { id: 'international', label: 'International Seller' },
];

const RATING_OPTIONS = [
  { value: 4, label: '4+ Stars', stars: 4 },
  { value: 3, label: '3+ Stars', stars: 3 },
  { value: 2, label: '2+ Stars', stars: 2 },
];

export function ProductFilters({ products, onFilterChange, showFilters: externalShowFilters, onToggleFilters, getTotalActiveFilters: externalGetTotalActiveFilters }: ProductFiltersProps) {
  const { user } = useAuthStore();
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [internalShowFilters, setInternalShowFilters] = useState(false);
  const showFilters = externalShowFilters !== undefined ? externalShowFilters : internalShowFilters;
  const handleToggleFilters = onToggleFilters || (() => setInternalShowFilters(!internalShowFilters));
  const [searchQuery, setSearchQuery] = useState<Record<string, string>>({});
  const [localSearchQuery, setLocalSearchQuery] = useState<Record<string, string>>({});
  
  // Debounce search queries
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);
  
  // Update actual search query after debounce
  useEffect(() => {
    setSearchQuery(debouncedSearchQuery);
  }, [debouncedSearchQuery]);
  
  const [filters, setFilters] = useState<FilterState>({
    sort: 'relevance',
    category: [],
    brand: [],
    priceRange: [0, 2000],
    color: [],
    size: [],
    rating: null,
    seller: [],
    delivery: [],
    stock: [],
    quickFilters: [],
  });

  const filterRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const filtersRef = useRef(filters);
  const onFilterChangeRef = useRef(onFilterChange);

  // Keep refs in sync
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  // Calculate product counts for each filter option (memoized to prevent recalculation)
  const getFilterCounts = useCallback((filterType: string, optionId: string): number => {
    // In production, calculate based on actual filtered products
    // For now, return mock counts (using a stable hash instead of random)
    const hash = `${filterType}-${optionId}`.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    return Math.abs(hash % 200) + 10;
  }, []);

  const getFilterOptionsWithCounts = useCallback((options: { id: string; label: string; color?: string }[]): FilterOption[] => {
    return options.map(option => ({
      ...option,
      count: getFilterCounts('', option.id),
    }));
  }, [getFilterCounts]);

  const brandOptions = useMemo(() => getFilterOptionsWithCounts(BRANDS), [getFilterOptionsWithCounts]);
  const sizeOptions = useMemo(() => getFilterOptionsWithCounts(SIZES), [getFilterOptionsWithCounts]);
  const colourOptions = useMemo(() => COLOURS.map(col => ({
    ...col,
    count: getFilterCounts('colour', col.id),
  })), [getFilterCounts]);
  const deliveryOptions = useMemo(() => getFilterOptionsWithCounts(DELIVERY_OPTIONS), [getFilterOptionsWithCounts]);
  const stockOptions = useMemo(() => getFilterOptionsWithCounts(STOCK_OPTIONS), [getFilterOptionsWithCounts]);
  const sellerOptions = useMemo(() => getFilterOptionsWithCounts(SELLER_OPTIONS), [getFilterOptionsWithCounts]);

  // Get categories from products
  const categoryOptions = useMemo(() => {
    const categories = Array.from(new Set(products.map(p => p.category_id).filter(Boolean)));
    return categories.map(cat => ({
      id: cat || '',
      label: cat || 'Uncategorized',
      count: products.filter(p => p.category_id === cat).length,
    }));
  }, [products]);

  const toggleFilter = useCallback((filterId: string) => {
    if (openFilter === filterId) {
      setOpenFilter(null);
      setDropdownPosition(null);
    } else {
      setOpenFilter(filterId);
      // Use requestAnimationFrame to avoid forced reflow
      requestAnimationFrame(() => {
        const button = buttonRefs.current[filterId];
        if (button) {
          const rect = button.getBoundingClientRect();
          setDropdownPosition({
            top: rect.bottom + 4,
            left: rect.left,
          });
        }
      });
    }
  }, [openFilter]);

  const handleMultiSelect = (filterKey: keyof FilterState, optionId: string) => {
    const current = filters[filterKey] as string[];
    const isSelected = current.includes(optionId);
    
    setFilters(prev => ({
      ...prev,
      [filterKey]: isSelected
        ? current.filter(id => id !== optionId)
        : [...current, optionId],
    }));
  };

  const handleSelectAll = (filterKey: keyof FilterState, allOptions: FilterOption[]) => {
    const allIds = allOptions.map(opt => opt.id);
    const currentSelected = filters[filterKey] as string[];
    const isAllSelected = allIds.every(id => currentSelected.includes(id));
    
    setFilters(prev => ({
      ...prev,
      [filterKey]: isAllSelected ? [] : allIds,
    }));
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      priceRange: [min, max],
    }));
  };

  const handleRatingChange = (rating: number | null) => {
    setFilters(prev => ({
      ...prev,
      rating: prev.rating === rating ? null : rating,
    }));
  };

  const handleSortChange = (sortId: string) => {
    setFilters(prev => ({ ...prev, sort: sortId }));
    setOpenFilter(null);
    setDropdownPosition(null);
  };

  const handleQuickFilter = (filterId: string) => {
    const current = filters.quickFilters;
    const isSelected = current.includes(filterId);
    
    setFilters(prev => ({
      ...prev,
      quickFilters: isSelected
        ? current.filter(id => id !== filterId)
        : [...current, filterId],
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      sort: 'relevance',
      category: [],
      brand: [],
      priceRange: [0, 2000],
      color: [],
      size: [],
      rating: null,
      seller: [],
      delivery: [],
      stock: [],
      quickFilters: [],
    });
    setSearchQuery({});
    setLocalSearchQuery({});
  };

  const saveFilter = () => {
    if (!user) return;
    // Save filter to user preferences
    localStorage.setItem(`saved_filter_${user.id}`, JSON.stringify(filters));
    // Show success message (you can add toast notification here)
    alert('Filter saved successfully!');
  };

  const getSelectedCount = useCallback((filterKey: keyof FilterState): number => {
    if (filterKey === 'sort') return filters.sort !== 'relevance' ? 1 : 0;
    if (filterKey === 'rating') return filters.rating !== null ? 1 : 0;
    if (filterKey === 'priceRange') {
      return filters.priceRange[0] !== 0 || filters.priceRange[1] !== 2000 ? 1 : 0;
    }
    return (filters[filterKey] as string[]).length;
  }, [filters]);

  const internalGetTotalActiveFilters = useMemo(() => {
    return (
      filters.category.length +
      filters.brand.length +
      (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 2000 ? 1 : 0) +
      filters.color.length +
      filters.size.length +
      (filters.rating !== null ? 1 : 0) +
      filters.seller.length +
      filters.delivery.length +
      filters.stock.length +
      filters.quickFilters.length +
      (filters.sort !== 'relevance' ? 1 : 0)
    );
  }, [
    filters.category.length,
    filters.brand.length,
    filters.priceRange[0],
    filters.priceRange[1],
    filters.color.length,
    filters.size.length,
    filters.rating,
    filters.seller.length,
    filters.delivery.length,
    filters.stock.length,
    filters.quickFilters.length,
    filters.sort,
  ]);
  
  const getTotalActiveFilters = externalGetTotalActiveFilters !== undefined ? externalGetTotalActiveFilters : internalGetTotalActiveFilters;

  // Filter options based on search (using debounced search query)
  const getFilteredOptions = (options: FilterOption[], filterType: string): FilterOption[] => {
    const query = searchQuery[filterType]?.toLowerCase() || '';
    if (!query) return options;
    return options.filter(opt => opt.label.toLowerCase().includes(query));
  };

  // Notify parent of filter changes (optimized to prevent unnecessary re-renders)
  // Use a ref to track previous values and only call onFilterChange when values actually change
  const prevFiltersRef = useRef<string>('');
  
  useEffect(() => {
    // Create a stable string representation of filters
    const filtersKey = JSON.stringify({
      sort: filters.sort,
      category: filters.category.sort().join(','),
      brand: filters.brand.sort().join(','),
      priceRange: filters.priceRange,
      color: filters.color.sort().join(','),
      size: filters.size.sort().join(','),
      rating: filters.rating,
      seller: filters.seller.sort().join(','),
      delivery: filters.delivery.sort().join(','),
      stock: filters.stock.sort().join(','),
      quickFilters: filters.quickFilters.sort().join(','),
    });
    
    // Only call onFilterChange if filters actually changed
    if (prevFiltersRef.current !== filtersKey) {
      prevFiltersRef.current = filtersKey;
      // Use requestIdleCallback or setTimeout to defer the callback
      // This prevents blocking the main thread
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => {
          onFilterChangeRef.current(filtersRef.current);
        }, { timeout: 100 });
      } else {
        setTimeout(() => {
          onFilterChangeRef.current(filtersRef.current);
        }, 0);
      }
    }
  }, [
    filters.sort,
    filters.category,
    filters.brand,
    filters.priceRange,
    filters.color,
    filters.size,
    filters.rating,
    filters.seller,
    filters.delivery,
    filters.stock,
    filters.quickFilters,
  ]);

  // Debounced resize handler to avoid forced reflows
  const handleResizeDebounced = useDebouncedCallback(() => {
    if (openFilter) {
      // Use requestAnimationFrame to batch layout reads
      requestAnimationFrame(() => {
        const button = buttonRefs.current[openFilter];
        if (button) {
          const rect = button.getBoundingClientRect();
          setDropdownPosition({
            top: rect.bottom + 4,
            left: rect.left,
          });
        }
      });
    }
  }, 150);

  // Close dropdown when clicking outside, scrolling, or resizing
  useEffect(() => {
    if (!openFilter) return;

    const handleClickOutside = (event: MouseEvent) => {
      const ref = filterRefs.current[openFilter];
      const button = buttonRefs.current[openFilter];
      if (ref && button && !ref.contains(event.target as Node) && !button.contains(event.target as Node)) {
        setOpenFilter(null);
        setDropdownPosition(null);
      }
    };

    const handleScroll = () => {
      setOpenFilter(null);
      setDropdownPosition(null);
    };

    // Use passive listeners where possible for better performance
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    window.addEventListener('resize', handleResizeDebounced, { passive: true });
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('resize', handleResizeDebounced);
    };
  }, [openFilter, handleResizeDebounced]);

  // Price Slider Component
  const PriceSlider = () => {
    const [localMin, setLocalMin] = useState(filters.priceRange[0]);
    const [localMax, setLocalMax] = useState(filters.priceRange[1]);
    const maxPrice = 2000;
    const sliderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setLocalMin(filters.priceRange[0]);
      setLocalMax(filters.priceRange[1]);
    }, [filters.priceRange]);

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Math.min(Number(e.target.value), localMax - 1);
      setLocalMin(value);
      handlePriceRangeChange(value, localMax);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Math.max(Number(e.target.value), localMin + 1);
      setLocalMax(value);
      handlePriceRangeChange(localMin, value);
    };

    const minPercent = (localMin / maxPrice) * 100;
    const maxPercent = (localMax / maxPrice) * 100;

    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700 dark:text-gray-300 font-medium">Price Range</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            ${localMin} - ${localMax}
          </span>
        </div>
        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-lg" ref={sliderRef}>
          <div
            className="absolute h-2 bg-orange-600 rounded-lg"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />
          <input
            type="range"
            min="0"
            max={maxPrice}
            value={localMin}
            onChange={handleMinChange}
            className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider z-10"
            style={{ zIndex: localMin > maxPrice - 100 ? 5 : 3 }}
          />
          <input
            type="range"
            min="0"
            max={maxPrice}
            value={localMax}
            onChange={handleMaxChange}
            className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider z-10"
            style={{ zIndex: localMax < 100 ? 5 : 3 }}
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <input
            type="number"
            min="0"
            max={maxPrice}
            value={localMin}
            onChange={handleMinChange}
            className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <span className="text-gray-500 dark:text-gray-400">to</span>
          <input
            type="number"
            min="0"
            max={maxPrice}
            value={localMax}
            onChange={handleMaxChange}
            className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>
    );
  };

  // Filter Dropdown Component
  const FilterDropdown = ({
    filterId,
    label,
    options,
    filterKey,
    showColors = false,
    showSearch = false,
    customContent,
  }: {
    filterId: string;
    label: string;
    options?: FilterOption[];
    filterKey?: keyof FilterState;
    showColors?: boolean;
    showSearch?: boolean;
    customContent?: React.ReactNode;
  }) => {
    const isOpen = openFilter === filterId;
    const selectedCount = filterKey ? getSelectedCount(filterKey) : 0;
    const selected = filterKey && filterKey !== 'rating' && filterKey !== 'priceRange'
      ? (filters[filterKey] as string[])
      : filterKey === 'rating'
      ? (filters.rating !== null ? [filters.rating.toString()] : [])
      : [];
    
    const displayOptions = options ? getFilteredOptions(options, filterId) : [];
    const allSelected = filterKey && options ? options.every(opt => selected.includes(opt.id)) : false;

    return (
      <div className="relative" ref={el => filterRefs.current[filterId] = el}>
        <button
          ref={el => buttonRefs.current[filterId] = el}
          onClick={() => toggleFilter(filterId)}
          className={`flex items-center justify-between gap-1 px-2 py-1 rounded-md transition-all whitespace-nowrap text-[10px] sm:text-xs border ${
            isOpen || selectedCount > 0
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700'
              : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
          }`}
        >
          <span className="font-medium truncate">{label}</span>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {selectedCount > 0 && (
              <span className="bg-blue-600 text-white text-[9px] px-1 py-0.5 rounded-full min-w-[14px] text-center">
                {selectedCount}
              </span>
            )}
            {isOpen ? (
              <ChevronUp className="h-3 w-3 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-3 w-3 flex-shrink-0" />
            )}
          </div>
        </button>

        {isOpen && dropdownPosition && (
          <>
            <div
              className="fixed inset-0 z-[9998] bg-transparent"
              onMouseDown={(e) => {
                // Don't close if clicking on input or inside dropdown
                const target = e.target as HTMLElement;
                if (target.tagName === 'INPUT' || target.closest('input') || target.closest('[data-dropdown-content]')) {
                  return;
                }
                setOpenFilter(null);
                setDropdownPosition(null);
              }}
            />
            <div 
              className="fixed w-[calc(100vw-1rem)] sm:w-80 lg:w-96 bg-white dark:bg-dark-card rounded-lg shadow-xl z-[9999] max-h-[calc(100vh-6rem)] sm:max-h-[600px] overflow-y-auto"
              style={{
                top: `${Math.max(8, dropdownPosition.top)}px`,
                left: `${Math.max(8, Math.min(dropdownPosition.left, window.innerWidth - (window.innerWidth < 640 ? 20 : 320)))}px`,
                maxWidth: window.innerWidth < 640 ? 'calc(100vw - 1rem)' : undefined,
              }}
              data-dropdown-content
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              {customContent ? (
                customContent
              ) : (
                <>
                  {filterKey && filterKey !== 'rating' && (
                    <div className="p-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {selectedCount} selected
                      </span>
                      <button
                        onClick={() => filterKey && options && handleSelectAll(filterKey, options)}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 uppercase"
                      >
                        <Check className={`h-3.5 w-3.5 ${allSelected ? 'opacity-100' : 'opacity-0'}`} />
                        ALL
                      </button>
                    </div>
                  )}
                  
                  {showSearch && options && options.length > 10 && (
                    <div 
                      className="p-3 border-b border-gray-200 dark:border-gray-700"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={localSearchQuery[filterId] || ''}
                          onChange={(e) => {
                            e.stopPropagation();
                            const value = e.target.value;
                            setLocalSearchQuery(prev => ({ ...prev, [filterId]: value }));
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onFocus={(e) => e.stopPropagation()}
                          className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-white"
                          autoComplete="off"
                          spellCheck="false"
                        />
                      </div>
                    </div>
                  )}

                  <div className="p-2">
                    {customContent || displayOptions.map((option) => {
                      const isSelected = selected.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          onClick={() => filterKey && handleMultiSelect(filterKey, option.id)}
                          className={`w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-between ${
                            isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            {showColors && option.color && (
                              <div
                                className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"
                                style={{ backgroundColor: option.color }}
                              />
                            )}
                            <span className="text-sm text-gray-900 dark:text-white">{option.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({option.count})
                            </span>
                            {isSelected && (
                              <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Sticky Active Filters Summary */}
      {getTotalActiveFilters > 0 && (
        <div className="bg-white dark:bg-dark-card sticky top-[73px] z-40 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="w-full px-2 sm:px-3 lg:px-6 xl:px-8 py-2 sm:py-3">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[10px] sm:text-xs lg:text-sm text-gray-500 dark:text-gray-400 font-medium">
                You filtered by:
              </span>
              {filters.category.length > 0 && filters.category.map(id => (
                <button
                  key={id}
                  onClick={() => handleMultiSelect('category', id)}
                  className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-0.5 sm:gap-1"
                >
                  <span className="truncate max-w-[100px] sm:max-w-none">{categoryOptions.find(c => c.id === id)?.label || id}</span>
                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                </button>
              ))}
              <span className="text-[10px] sm:text-xs lg:text-sm text-gray-500 dark:text-gray-400 font-medium">
                You filtered by:
              </span>
              {filters.category.length > 0 && filters.category.map(id => (
                <button
                  key={id}
                  onClick={() => handleMultiSelect('category', id)}
                  className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-0.5 sm:gap-1"
                >
                  <span className="truncate max-w-[100px] sm:max-w-none">{categoryOptions.find(c => c.id === id)?.label || id}</span>
                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                </button>
              ))}
              {filters.brand.length > 0 && filters.brand.map(id => (
                <button
                  key={id}
                  onClick={() => handleMultiSelect('brand', id)}
                  className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-0.5 sm:gap-1"
                >
                  <span className="truncate max-w-[100px] sm:max-w-none">{BRANDS.find(b => b.id === id)?.label || id}</span>
                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                </button>
              ))}
              {(filters.priceRange[0] !== 0 || filters.priceRange[1] !== 2000) && (
                <button
                  onClick={() => handlePriceRangeChange(0, 2000)}
                  className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-0.5 sm:gap-1"
                >
                  <span className="truncate max-w-[120px] sm:max-w-none">Price: ${filters.priceRange[0]}-${filters.priceRange[1]}</span>
                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                </button>
              )}
              {filters.color.length > 0 && filters.color.map(id => (
                <button
                  key={id}
                  onClick={() => handleMultiSelect('color', id)}
                  className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-0.5 sm:gap-1"
                >
                  <span className="truncate max-w-[100px] sm:max-w-none">{COLOURS.find(c => c.id === id)?.label || id}</span>
                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                </button>
              ))}
              {filters.size.length > 0 && filters.size.map(id => (
                <button
                  key={id}
                  onClick={() => handleMultiSelect('size', id)}
                  className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-0.5 sm:gap-1"
                >
                  <span className="truncate max-w-[100px] sm:max-w-none">{SIZES.find(s => s.id === id)?.label || id}</span>
                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                </button>
              ))}
              {filters.rating !== null && (
                <button
                  onClick={() => handleRatingChange(null)}
                  className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-0.5 sm:gap-1"
                >
                  {filters.rating}+ Stars
                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                </button>
              )}
              {filters.seller.length > 0 && filters.seller.map(id => (
                <button
                  key={id}
                  onClick={() => handleMultiSelect('seller', id)}
                  className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-0.5 sm:gap-1"
                >
                  <span className="truncate max-w-[100px] sm:max-w-none">{SELLER_OPTIONS.find(s => s.id === id)?.label || id}</span>
                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                </button>
              ))}
              {filters.delivery.length > 0 && filters.delivery.map(id => (
                <button
                  key={id}
                  onClick={() => handleMultiSelect('delivery', id)}
                  className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-0.5 sm:gap-1"
                >
                  <span className="truncate max-w-[100px] sm:max-w-none">{DELIVERY_OPTIONS.find(d => d.id === id)?.label || id}</span>
                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                </button>
              ))}
              {filters.stock.length > 0 && filters.stock.map(id => (
                <button
                  key={id}
                  onClick={() => handleMultiSelect('stock', id)}
                  className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-0.5 sm:gap-1"
                >
                  <span className="truncate max-w-[100px] sm:max-w-none">{STOCK_OPTIONS.find(s => s.id === id)?.label || id}</span>
                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                </button>
              ))}
              {filters.quickFilters.length > 0 && filters.quickFilters.map(id => (
                <button
                  key={id}
                  onClick={() => handleQuickFilter(id)}
                  className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-0.5 sm:gap-1"
                >
                  <span className="truncate max-w-[100px] sm:max-w-none">{QUICK_FILTERS.find(q => q.id === id)?.label || id}</span>
                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                </button>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 font-medium flex items-center gap-0.5 sm:gap-1 ml-auto"
              >
                <RotateCcw className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="hidden sm:inline">Reset All</span>
                <span className="sm:hidden">Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Filter Bar - Only show when filters are toggled on */}
      {showFilters && (
        <div className="bg-white dark:bg-dark-card sticky z-40" style={{ top: getTotalActiveFilters > 0 ? '145px' : '73px' }}>
          <div className="w-full px-1 sm:px-2 lg:px-6 xl:px-8">
            {/* Clear All Button - Only show if filters are visible */}
            {getTotalActiveFilters > 0 && (
              <div className="flex items-center justify-end py-1.5 sm:py-2 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
              </div>
            )}

            {/* Filter Container */}
            <div className="overflow-visible">
            {/* Primary Filter Bar - Compact Grid Layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 sm:gap-2 py-1.5 sm:py-2 px-1 sm:px-2">
            {/* Add scroll indicator on mobile */}
            <style>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>
            <FilterDropdown
              filterId="sort"
              label="Sort"
              options={SORT_OPTIONS.map(opt => ({ ...opt, count: 0 }))}
              filterKey="sort"
              customContent={
                <div className="p-1.5">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleSortChange(option.id)}
                      className={`w-full text-left px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-between ${
                        filters.sort === option.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <span className="text-xs text-gray-900 dark:text-white">{option.label}</span>
                      {filters.sort === option.id && (
                        <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      )}
                    </button>
                  ))}
                </div>
              }
            />
            <FilterDropdown
              filterId="category"
              label="Category"
              options={categoryOptions}
              filterKey="category"
              showSearch={categoryOptions.length > 10}
            />
            <FilterDropdown
              filterId="brand"
              label="Brand"
              options={brandOptions}
              filterKey="brand"
              showSearch={true}
            />
            <FilterDropdown
              filterId="price"
              label="Price"
              filterKey="priceRange"
              customContent={<PriceSlider />}
            />
            <FilterDropdown
              filterId="color"
              label="Color"
              options={colourOptions}
              filterKey="color"
              showColors={true}
              showSearch={true}
            />
            <FilterDropdown
              filterId="size"
              label="Size"
              options={sizeOptions}
              filterKey="size"
            />
            <FilterDropdown
              filterId="rating"
              label="Rating"
              filterKey="rating"
              customContent={
                <div className="p-1.5">
                  {RATING_OPTIONS.map((option) => {
                    const isSelected = filters.rating === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleRatingChange(option.value)}
                        className={`w-full text-left px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-between ${
                          isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="flex text-xs">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < option.stars ? 'text-yellow-400' : 'text-gray-300'}>
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-gray-900 dark:text-white">{option.label}</span>
                        </div>
                        {isSelected && (
                          <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              }
            />
            <FilterDropdown
              filterId="seller"
              label="Seller"
              options={sellerOptions}
              filterKey="seller"
            />
            <FilterDropdown
              filterId="delivery"
              label="Delivery"
              options={deliveryOptions}
              filterKey="delivery"
            />
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center justify-center gap-1 px-2 py-1 rounded-md transition-all whitespace-nowrap text-[10px] sm:text-xs border ${
                showAdvancedFilters
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700'
                  : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <SlidersHorizontal className="h-3 w-3" />
              <span>More</span>
            </button>
            {user && getTotalActiveFilters > 0 && (
              <button
                onClick={saveFilter}
                className="flex items-center justify-center gap-1 px-2 py-1 rounded-md transition-all whitespace-nowrap text-[10px] sm:text-xs bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <Save className="h-3 w-3" />
                <span className="hidden sm:inline">Save</span>
              </button>
            )}
            </div>

            {/* Quick Filters Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 sm:gap-2 py-1.5 border-t border-gray-200 dark:border-gray-700 px-1 sm:px-2">
              {QUICK_FILTERS.map((filter) => {
                const isSelected = filters.quickFilters.includes(filter.id);
                return (
                  <button
                    key={filter.id}
                    onClick={() => handleQuickFilter(filter.id)}
                    className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-medium whitespace-nowrap transition-all text-center ${
                      isSelected
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-2 sm:p-3 bg-gray-50 dark:bg-gray-900/50">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Stock Status</h4>
                  <div className="space-y-1.5">
                    {stockOptions.map((option) => {
                      const isSelected = filters.stock.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleMultiSelect('stock', option.id)}
                          className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <span>{option.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">({option.count})</span>
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Seller Type</h4>
                  <div className="space-y-1.5">
                    {sellerOptions.map((option) => {
                      const isSelected = filters.seller.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleMultiSelect('seller', option.id)}
                          className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <span>{option.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">({option.count})</span>
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Delivery Options</h4>
                  <div className="space-y-1.5">
                    {deliveryOptions.map((option) => {
                      const isSelected = filters.delivery.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleMultiSelect('delivery', option.id)}
                          className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <span>{option.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">({option.count})</span>
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Rating</h4>
                  <div className="space-y-1.5">
                    {RATING_OPTIONS.map((option) => {
                      const isSelected = filters.rating === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleRatingChange(option.value)}
                          className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < option.stars ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}>
                                  ★
                                </span>
                              ))}
                            </div>
                            <span>{option.label}</span>
                          </div>
                          {isSelected && <Check className="h-4 w-4" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
