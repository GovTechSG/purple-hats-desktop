const ButtonSvgIcon = ({ className, focusable = false, svgIcon }) => {
  return (
    <i aria-hidden focusable={focusable} className={`${className}`}>
      {svgIcon}
    </i>
  );
};

export default ButtonSvgIcon;
