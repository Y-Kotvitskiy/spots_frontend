import styles from "./Pagination.module.scss";

interface PaginationProps {
  pageSize: number;
  pageSizeOptions: readonly number[];
  currentPage: number;
  totalPages: number;
  onPageSizeChange: (newSize: number) => void;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  pageSize,
  pageSizeOptions,
  currentPage,
  totalPages,
  onPageSizeChange,
  onPageChange,
}: PaginationProps) => {
  return (
    <div className={styles.paginationBar}>
      <div className={styles.pageSizeSelector}>
        <label htmlFor="page-size-select">Per page:</label>
        <select
          id="page-size-select"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className={styles.pageSizeSelect}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {totalPages > 1 && (
        <div className={styles.paginationControls}>
          <button
            type="button"
            className={styles.paginationBtn}
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;
            return (
              <button
                key={pageNumber}
                type="button"
                className={`${styles.paginationBtn} ${
                  currentPage === pageNumber ? styles.paginationBtn_active : ""
                }`}
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            type="button"
            className={styles.paginationBtn}
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;