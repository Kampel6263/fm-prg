import React from "react";
import classNames from "classnames";
import classes from "./button.module.scss";

type ButtonProps = {
  name: string;
  type?: "submit" | "cancel" | "border" | "secondary";
  size?: "small" | "short";
  mainType?: "submit";
  onClick?: () => void;
  disabled?: boolean;
  rotate?: number;
};

const Button: React.FC<ButtonProps> = ({
  name,
  type = "submit",
  size,
  mainType,
  onClick,
  disabled,
  rotate,
}) => {
  return (
    <button
      style={rotate ? { transform: `rotate(${rotate}deg)` } : {}}
      className={classNames(
        classes.button,
        classes[type],
        size && classes[size],
        disabled && classes.disabled
      )}
      onClick={onClick}
      type={mainType}
      disabled={disabled}
    >
      {name}
    </button>
  );
};

export default Button;
