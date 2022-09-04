import classNames from "classnames";
import { Field } from "formik";
import React from "react";
import Loader from "../loader/loader.component";
import classes from "./infoItem.module.scss";

type InfoItemProps = {
  name: string;
  value?: string | number;
  form?: {
    name: string;
    type: string;
    error?: string;
  };
  loading?: boolean;
};

const InfoItem: React.FC<InfoItemProps> = ({ name, value, form, loading }) => {
  if (form) {
    return (
      <div
        className={classNames(
          classes.infoItem,
          classes.form,
          form.error && classes.error,
          loading && classes.loading
        )}
      >
        <div className={classNames(classes.loader, loading && classes.active)}>
          <Loader size="small" type="stripes" />
        </div>
        <label className={classes.item} htmlFor={form.name}>
          {name}:
        </label>
        <Field
          className={classes.value}
          name={form.name}
          id={form.name}
          type={form.type}
          // min={form.type === "number" && 1}
        />
      </div>
    );
  }
  return (
    <div className={classNames(classes.infoItem, loading && classes.loading)}>
      <div className={classNames(classes.loader, loading && classes.active)}>
        <Loader size="small" type="stripes" />
      </div>
      <div className={classes.item}>{name}:</div>
      <div className={classes.value}>{value}</div>
    </div>
  );
};

export default InfoItem;
