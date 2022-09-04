import React from "react";
import classes from "./loader.module.scss";

import Spin from "../../assets/Spinner-1s-250px.svg";
import Dot from "../../assets/dot.svg";
import Line from "../../assets/line.svg";
import Stripes from "../../assets/stripes.svg";

import classNames from "classnames";

type LoaderProps = {
  size?: "small";
  type?: "dot" | "line" | "stripes";
  position?: "bottom";
};

const Loader: React.FC<LoaderProps> = ({ size, type, position }) => {
  const loaders = {
    dot: Dot,
    line: Line,
    stripes: Stripes,
  };

  return (
    <div
      className={classNames(
        classes.loader,
        size && classes[size],
        type && classes[type],
        position && classes[position]
      )}
    >
      <object type="image/svg+xml" data={type ? loaders[type] : Spin}>
        svg-animation
      </object>
    </div>
  );
};

export default Loader;
