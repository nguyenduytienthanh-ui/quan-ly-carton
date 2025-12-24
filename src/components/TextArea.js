import React from 'react';

/**
 * TextArea - Tự động viết hoa chữ cái đầu dòng và sau dấu chấm
 */

const TextArea = ({ 
  value = '', 
  onChange, 
  className = '',
  ...rest 
}) => {
  const handleChange = (e) => {
    let newValue = e.target.value;
    const oldValue = value;
    
    // Chỉ auto-capitalize khi đang THÊM ký tự (độ dài tăng)
    if (newValue.length > oldValue.length) {
      // Ký tự vừa thêm vào
      const addedChar = newValue[newValue.length - 1];
      
      // Nếu là chữ cái thường
      if (/[a-zàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/.test(addedChar)) {
        // Kiểm tra vị trí: đầu dòng HOẶC sau dấu chấm HOẶC sau Enter
        const position = newValue.length - 1;
        const beforeChar = position > 0 ? newValue[position - 1] : '';
        const twoCharsBefore = position > 1 ? newValue[position - 2] : '';
        
        // Đầu dòng (vị trí 0) 
        // HOẶC sau ". " hoặc "! " hoặc "? "
        // HOẶC sau Enter (\n)
        if (position === 0 || 
            (beforeChar === ' ' && /[.!?]/.test(twoCharsBefore)) ||
            beforeChar === '\n') {
          // Viết hoa ký tự vừa thêm
          newValue = newValue.slice(0, -1) + addedChar.toUpperCase();
        }
      }
    }
    
    onChange(newValue);
  };

  return (
    <textarea
      value={value}
      onChange={handleChange}
      className={className}
      {...rest}
    />
  );
};

export default TextArea;
