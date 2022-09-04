import React from "react";
import classes from "./avatar.module.scss";

type AvatarProps = {
  title: string;
  subtitle?: string;
};

const Avatar: React.FC<AvatarProps> = ({ title, subtitle }) => {
  return (
    <div className={classes.avatar}>
      <div className={classes.moove}>
        <div className={classes.circle}>{title}</div>
        {subtitle && <div className={classes.name}>{subtitle}</div>}
      </div>
    </div>
  );
};

export default Avatar;
