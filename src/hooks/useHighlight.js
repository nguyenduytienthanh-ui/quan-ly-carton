import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

/**
 * useHighlight Hook - COMPLETE VERSION
 * 
 * Đọc ?highlight=ID từ URL và tự động:
 * 1. Scroll tới item
 * 2. Highlight item
 * 3. Clear URL sau 3s
 * 
 * @returns {Object} { highlightId, clearHighlight }
 */

const useHighlight = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [highlightId, setHighlightId] = useState(null);

  useEffect(() => {
    // Đọc highlight param từ URL
    const highlight = searchParams.get('highlight');
    
    if (highlight) {
      setHighlightId(highlight);

      // Scroll tới element sau 100ms (đợi render)
      setTimeout(() => {
        const element = document.getElementById(`item-${highlight}`);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);

      // Clear highlight sau 3s
      setTimeout(() => {
        setHighlightId(null);
        // Xóa param khỏi URL (optional)
        searchParams.delete('highlight');
        setSearchParams(searchParams, { replace: true });
      }, 3000);
    }
  }, [searchParams]);

  const clearHighlight = () => {
    setHighlightId(null);
    searchParams.delete('highlight');
    setSearchParams(searchParams, { replace: true });
  };

  return { highlightId, clearHighlight };
};

export default useHighlight;

/**
 * ========================================
 * USAGE - CÁCH DÙNG
 * ========================================
 * 
 * Trong bất kỳ module nào (Customer, Material, Product...):
 * 
 * ```javascript
 * import useHighlight from '../hooks/useHighlight';
 * 
 * function Customer() {
 *   const { highlightId } = useHighlight();
 *   const [customers, setCustomers] = useState([]);
 * 
 *   return (
 *     <div>
 *       {customers.map(customer => (
 *         <div
 *           key={customer.id}
 *           id={`item-${customer.id}`}  // ← QUAN TRỌNG: ID cho scroll
 *           className={
 *             highlightId && highlightId === customer.id.toString()
 *               ? 'bg-yellow-100 border-2 border-yellow-400'  // ← Highlight
 *               : 'bg-white'
 *           }
 *         >
 *           {customer.name}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 * 
 * ========================================
 * FLOW:
 * ========================================
 * 
 * 1. User click LinkedField trong Product:
 *    <LinkedField type="customer" id={123} />
 * 
 * 2. Navigate to: /customers?highlight=123
 * 
 * 3. Customer module:
 *    - useHighlight() đọc highlight=123
 *    - Tìm element id="item-123"
 *    - Scroll tới element
 *    - Add class bg-yellow-100
 *    - Sau 3s: Remove highlight, xóa URL param
 * 
 * ========================================
 * TỰ ĐỘNG HOẠT ĐỘNG!
 * ========================================
 * 
 * Chỉ cần thêm 3 dòng vào mỗi module:
 * 
 * 1. Import hook
 * 2. Call useHighlight()
 * 3. Thêm id={`item-${id}`} và className cho mỗi row
 * 
 * XONG!
 */
