import React from 'react';
import PropTypes from 'prop-types';

const CustomSnackbar = ({
  isOpen,
  message,
  severity = 'error',
  duration = 2000,
  onClose,
  customStyles = {},
}) => {
  const [animating, setAnimating] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setAnimating(true);
      const timer = setTimeout(() => {
        setAnimating(false); // After the slide-in animation, trigger fade-out
      }, duration); // Controls when fade-out should start
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration]);

  const handleAnimationEnd = () => {
    if (!animating) {
      onClose(); // Close when fade-out is complete
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`custom-snackbar ${severity}`}
      style={customStyles}
      onAnimationEnd={handleAnimationEnd} // Listen for animation end
    >
      <span className="custom-snackbar-message">{message}</span>
      <button className="custom-snackbar-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
};

CustomSnackbar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  severity: PropTypes.oneOf(['error', 'warning', 'info', 'success']),
  duration: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  customStyles: PropTypes.object,
};

export default CustomSnackbar;
