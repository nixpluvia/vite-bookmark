import { activeAnimations } from 'framer-motion';
import { create } from 'zustand';

const useStore = create((set, get) => ({
    activeCategory: "전체",
    searchQuery: "",
    ratingFilter: 0, // 0 = 전체
    dateFrom: "",
    dateTo: "",
    cardTemplate : "default",
    sort: {
        type: null, // createdAt, title
        order: null, // asc, desc
    },
    ableSortCard: false,
    actions : {
        setActiveCategory: (category) => set({ activeCategory: category }),
        setSearchQuery: (query) => set({ searchQuery: query }),
        setRatingFilter: (rating) => set({ ratingFilter: rating }),
        setDateFrom: (date) => set({ dateFrom: date }),
        setDateTo: (date) => set({ dateTo: date }),
        resetFilter: () => {
            set({ searchQuery: "", ratingFilter: 0, dateFrom: "", dateTo: "" });
        },
        onChangeTemplate: (template) => set({ cardTemplate: template }),
        changeSort: (sort) => {
            if (sort === null) {
                set({ sort: { type: null, order: null } });
                return;
            }
            set({ 
                sort: {
                    type: sort,
                    order: get().sort.type === sort && get().sort.order === "asc" ? "desc" : "asc",
                }
            })
        },
        toggleAbleSortCard: () => set({ ableSortCard: !get().ableSortCard }),
    }
}));

const isFiltered = (state) => {
    const searchQuery = state.searchQuery;
    const ratingFilter = state.ratingFilter;
    const dateFrom = state.dateFrom;
    const dateTo = state.dateTo;
    const sort = state.sort;
    
    return searchQuery.trim() !== "" ||
    ratingFilter > 0 ||
    dateFrom !== "" ||
    dateTo !== "" ||
    sort.type !== null;
}

export default useStore;
export { useStore, isFiltered };