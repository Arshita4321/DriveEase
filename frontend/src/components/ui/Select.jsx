import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

function flattenOptions(children) {
  const options = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === 'option') {
      options.push(child);
    } else if (child.type === 'optgroup') {
      React.Children.forEach(child.props.children, (opt) => {
        if (React.isValidElement(opt) && opt.type === 'option') {
          options.push(React.cloneElement(opt, { label: child.props.label }));
        }
      });
    }
  });
  return options;
}

const Select = forwardRef(function Select(
  { label, className, children, containerClassName, value, defaultValue, onChange, disabled, required, name, ...props },
  ref
) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(null);
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const isControlled = value !== undefined;

  const options = flattenOptions(children);
  const currentValue = isControlled ? value : internalValue;
  const selectedOption = options.find((opt) => opt.props.value === currentValue);
  const displayLabel = selectedOption?.props.children || currentValue || 'Select…';

  const selectValue = (val) => {
    if (!isControlled) setInternalValue(val);
    onChange?.({ target: { value: val, name } });
    setOpen(false);
  };

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, [open]);

  // Keyboard handling
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      const values = options.map((o) => o.props.value);
      const idx = highlighted !== null ? values.indexOf(highlighted) : values.indexOf(currentValue);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = values[(idx + 1) % values.length];
        setHighlighted(next);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const next = values[(idx - 1 + values.length) % values.length];
        setHighlighted(next);
      } else if (e.key === 'Enter' && highlighted !== null) {
        e.preventDefault();
        selectValue(highlighted);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, highlighted, options, currentValue]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (!open || highlighted === null || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-value="${CSS.escape(highlighted)}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [open, highlighted]);

  return (
    <label className={clsx('block', containerClassName)} ref={containerRef}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-primary-900 dark:text-slate-200">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </span>
      )}
      <div className="relative">
        {/* Hidden native select preserves form validation and semantics */}
        <select
          ref={ref}
          name={name}
          value={currentValue}
          required={required}
          disabled={disabled}
          onChange={onChange}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        >
          {children}
        </select>

        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={clsx(
            'select-btn w-full rounded-xl border px-4 py-2.5 pr-9 text-left text-sm font-semibold outline-none transition-all duration-200',
            'border-primary-200',
            'focus:border-primary-500 focus:ring-2 focus:ring-primary-200',
            'hover:border-primary-300',
            disabled && 'cursor-not-allowed opacity-60',
            className
          )}
          {...props}
        >
          <span className="block truncate">{displayLabel}</span>
        </button>

        <FiChevronDown
          className={clsx(
            'pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-primary-400 transition-transform duration-300',
            open && 'rotate-180 text-primary-600'
          )}
        />

        <AnimatePresence>
          {open && (
            <motion.ul
              ref={listRef}
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="select-dropdown absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-primary-200 p-1 shadow-xl"
            >
              {options.map((option) => {
                const val = option.props.value;
                const isSelected = val === currentValue;
                const isHighlighted = val === highlighted;
                return (
                  <motion.li
                    key={val}
                    data-value={val}
                    data-selected={isSelected}
                    onClick={() => selectValue(val)}
                    onMouseEnter={() => setHighlighted(val)}
                    className={clsx(
                      'select-option cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
                      isHighlighted && 'opacity-80'
                    )}
                    whileTap={{ scale: 0.98 }}
                  >
                    {option.props.children}
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </label>
  );
});

export default Select;
