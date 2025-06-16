// src/components/common/Pagination.jsx

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5; // Số nút trang tối đa hiển thị
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        Trước
      </Button>
      <div className="flex space-x-1">
        {totalPages > 0 && getPageNumbers().map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
      >
        Tiếp
      </Button>
    </div>
  );
};

export default Pagination;