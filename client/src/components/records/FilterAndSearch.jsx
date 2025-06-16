// src/components/FilterAndSearch.jsx
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export const FilterAndSearch = ({
  searchQuery,
  onSearchChange,
  wardFilter,
  onWardChange,
  placeholder,
}) => {
  return (
    <div className="flex gap-4 mt-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={placeholder || "Tìm kiếm..."}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
};